from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from supabase import create_client
import json
import re


load_dotenv(override=True)

api_key = os.getenv("GOOGLE_API_KEY")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class ChatRequest(BaseModel):
    message: str           # user doubt
    question: str
    history: list = []
    lesson_title: str | None = None
    lesson_content: str | None = None
    user_id: str

class AnalysisRequest(BaseModel):
    user_id: str
    progress: dict

class GenerateQuestionsRequest(BaseModel):
    user_id: str
    topic_id: str
    doubts: list[str]
    existing_questions: list
    difficulty: int

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    global rag_chain

    pdf_files = [
        r"D:\\BE\\AI Adv proj\\data.pdf",
        r"D:\\BE\\AI Adv proj\\data2.pdf",
        r"D:\\BE\\AI Adv proj\\Artificial Intelligence Fundamentals and Applications.pdf",
        r"D:\\BE\\AI Adv proj\\Artificial Intelligence_Methods and Applications.pdf"
    ]

    documents = []
    for file in pdf_files:
        loader = PyPDFLoader(file)
        documents.extend(loader.load())

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    chunks = text_splitter.split_documents(documents)

    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    if not os.path.exists("faiss_index"):
        vector_db = FAISS.from_documents(chunks, embedding_model)
        vector_db.save_local("faiss_index")
    else:
        vector_db = FAISS.load_local(
            "faiss_index",
            embedding_model,
            allow_dangerous_deserialization=True
        )

    llm = ChatGroq(
        model="llama-3.1-8b-instant",   # fast & cheap
        temperature=0.3,
        groq_api_key=os.getenv("GROQ_API_KEY")
    )

    prompt = ChatPromptTemplate.from_template("""
    You are a friendly coding tutor for kids.

    Student Info:
    Name: {student_name}
    Current Topic: {topic_name}
    Current Question: {question_text}
    Test: {test_name}

    Adapt your teaching based on this:
    - Refer to the student by name when appropriate
    - Focus more on the current topic
    - If a question is given, explain it clearly
    - If test is present, help improve mistakes

    Use the provided context as your primary reference.
    But you are also allowed to use your own knowledge to:
    - explain concepts clearly
    - elaborate with examples
    - simplify for better understanding

    If the context contains relevant information:
    - use it first
    - then expand on it

    If the context is insufficient:
    - use your own knowledge, but clearly explain

    Format your answer STRICTLY like this:
    Format your answer as plain text.
    Do NOT use:
    - #
    - *
    - bullet points
    - markdown
    - new lines

    Write like a chatbot speaking naturally.

    Title (1 line)
    Explanation Short explanation in 2-3 lines.
    Simple example.
    One small helpful tip.

    Use:
    - Short sentences
    - Line breaks
    - No long paragraphs

    Chat History:
    {history}

    Context:
    {context}

    Question:
    {question}

    Answer like a teacher:
    """)   

    retriever = vector_db.as_retriever(search_kwargs={"k": 5})

    def format_history(history):
        history = history[-5:]  # limit memory (important)

        formatted = ""
        for msg in history:
            role = "User" if msg["role"] == "user" else "Assistant"
            formatted += f"{role}: {msg['content']}\n"

        return formatted

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    def get_question(x):
        return x["question"]   # ✅ use real question for RAG
    
    def get_history(x):
        return format_history(x["history"])
    
    def combine_context(x):
        # 🔥 retrieve from vector DB
        docs = retriever.invoke(x["question"])
        rag_context = format_docs(docs)

        # 🔥 lesson context
        lesson_context = ""
        if x.get("lesson_content"):
            lesson_context = f"Lesson Content:\n{x['lesson_content']}\n\n"

        # 🔥 ADD THIS (personalization)
        profile_context = f"""
    Student Name: {x.get("student_name")}
    Topic: {x.get("topic_name")}
    Current Question: {x.get("question_text")}
    Test: {x.get("test_name")}
    """

        return profile_context + "\n\n" + lesson_context + rag_context
    

    rag_chain = (
        {
            "context": RunnablePassthrough() | combine_context,
            "question": RunnablePassthrough() | get_question,
            "history": RunnablePassthrough() | get_history,

            # 🔥 ADD THESE
            "student_name": RunnablePassthrough(),
            "question_text": RunnablePassthrough(),
            "topic_name": RunnablePassthrough(),
            "test_name": RunnablePassthrough(),
            "message": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    yield  # app runs here

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def enrich_context_with_profile(user_id):
    res = supabase.table("user_attempts")\
        .select("""
            *,
            users(*),
            questions(*),
            topics(*),
            tests(*)
        """)\
        .eq("user_id", user_id)\
        .execute()
    if res.data:
        data = res.data[0]
        student_name = data["users"]["name"]
        question_text = data["questions"]["question_text"]
        topic_name = data["topics"]["name"]
        test_name = data["tests"]["title"]
    if res.data:
        return student_name, question_text, topic_name, test_name
    else:
        return "", "", "", ""

@app.options("/chat")
async def options_chat():
    return {}

@app.post("/chat")
async def chat_api(req: ChatRequest):
    
    student_name,question_text,topic_name,test_name = enrich_context_with_profile(req.user_id)
    response = rag_chain.invoke({
        "question": req.question,   # 🔥 REAL QUESTION
        "message": req.message,
        "history": req.history,
        "lesson_content": req.lesson_content,
        "lesson_title": req.lesson_title,
        "student_name":student_name,
        "question_text":question_text,
        "topic_name":topic_name,
        "test_name":test_name,
    })
    # 🔥 CLEAN RESPONSE
    clean = response

    # remove markdown symbols
    clean = re.sub(r"#", "", clean)
    clean = re.sub(r"\*", "", clean)

    # replace newlines with space
    clean = re.sub(r"\n+", " ", clean)

    # remove extra spaces
    clean = re.sub(r"\s+", " ", clean).strip()

    return {"reply": clean}

@app.post("/analyze")
async def analyze_user(req: AnalysisRequest):
    try:
        # 🔥 Get profile info (reuse your function)
        student_name, question_text, topic_name, test_name = enrich_context_with_profile(req.user_id)

        # 🔥 Build prompt for analysis
        analysis_prompt = f"""
You are an AI learning coach.

Analyze the student's learning progress.

Student Name: {student_name}
Topic: {topic_name}
Recent Question: {question_text}
Test: {test_name}

Return ONLY valid JSON.
Do NOT return a list.
Do NOT use markdown.
Do NOT add explanation.

Output format:
{{
  "summary": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "nextSteps": ["...", "..."]
}}

Progress Data:
{req.progress}

"""

        # 🔥 Call LLM directly (reuse your Gemini model)
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0,
            groq_api_key=os.getenv("GROQ_API_KEY")
        )

        response = llm.invoke(analysis_prompt)

        raw = response.content

        # ✅ Case 1: Gemini returns list
        if isinstance(raw, list):
            raw = raw[0]  # take first item

        # ✅ Case 2: extract text field
        if isinstance(raw, dict) and "text" in raw:
            raw = raw["text"]

        # ✅ Case 3: now raw is string → extract JSON
        if isinstance(raw, str):
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                return json.loads(match.group())

        # ❌ fallback
        raise ValueError("Invalid LLM response format")

    except Exception as e:
        print("Analysis error:", e)
        return {
            "summary": "Could not analyze progress.",
            "strengths": [],
            "weaknesses": [],
            "nextSteps": []
        }
    
@app.post("/generate-questions")
async def generate_questions(req: GenerateQuestionsRequest):
    try:
        # 🔥 Step 1: Build prompt
        prompt = f"""
You are an adaptive learning system.

Student doubts:
{req.doubts}

Existing questions:
{req.existing_questions}

Target difficulty: {req.difficulty} (0-100)

TASK:
1. Identify weak areas from doubts
2. Check if existing questions already cover them
3. ONLY IF NOT covered:
   - Generate 2 new MCQ questions
4. Match difficulty level
5. Return JSON ONLY

FORMAT:
[
  {{
    "question_text": "...",
    "difficulty": 60,
    "options": [
      {{"option_text": "...", "is_correct": true, "explanation": "..."}},
      {{"option_text": "...", "is_correct": false, "explanation": "..."}},
      {{"option_text": "...", "is_correct": false, "explanation": "..."}},
      {{"option_text": "...", "is_correct": false, "explanation": "..."}}
    ]
  }}
]
"""

        # 🔥 Step 2: Call LLM
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.5,
            groq_api_key=os.getenv("GROQ_API_KEY")
        )

        response = llm.invoke(prompt)
        raw = response.content

        # 🔥 Step 3: Extract JSON safely
        match = re.search(r"\[\s*{.*?}\s*\]", raw, re.DOTALL)
        if not match:
            return {"generated_questions": []}

        try:
            generated_questions = json.loads(match.group())
        except:
            return {"generated_questions": []}

        saved_questions = []

        for q in generated_questions:
            # ✅ validate structure
            if "options" not in q or len(q["options"]) < 2:
                continue

            # ✅ limit options to 4
            q["options"] = q["options"][:4]

            # ✅ ensure only ONE correct answer
            correct_found = False
            for opt in q["options"]:
                if opt.get("is_correct"):
                    if correct_found:
                        opt["is_correct"] = False
                    else:
                        correct_found = True


            q_insert = supabase.table("questions").insert({
                "question_text": q["question_text"],
                "difficulty": q["difficulty"],
                "topic_id": req.topic_id,
                "is_generated": True
            }).execute()

            if not q_insert.data:
                continue

            question_id = q_insert.data[0]["id"]

            formatted_options = []

            # ✅ insert options AND collect inserted rows
            for opt in q["options"]:
                opt_insert = supabase.table("mcq_options").insert({
                    "question_id": question_id,
                    "option_text": opt["option_text"],
                    "is_correct": opt["is_correct"],
                    "explanation": opt["explanation"]
                }).execute()

                if opt_insert.data:
                    formatted_options.append(opt_insert.data[0])  # ✅ includes ID

            # ✅ skip if no options inserted
            if len(formatted_options) == 0:
                continue

            # ✅ return DB-shaped object (matches frontend)
            saved_questions.append({
                "id": question_id,
                "question_text": q["question_text"],
                "difficulty": q.get("difficulty", req.difficulty),
                "topic_id": req.topic_id,
                "mcq_options": formatted_options
            })

        return {"generated_questions": saved_questions}

    except Exception as e:
        print("Generation error:", e)
        return {"generated_questions": []}
