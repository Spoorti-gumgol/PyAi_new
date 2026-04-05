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
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser


load_dotenv(override=True)

api_key = os.getenv("GOOGLE_API_KEY")

class ChatRequest(BaseModel):
    message: str
    history: list = []
    lesson_title: str | None = None
    lesson_content: str | None = None
    username: str | None = None

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

    llm = ChatGoogleGenerativeAI(
        model="gemini-3-flash-preview",
        temperature=0
    )

    prompt = ChatPromptTemplate.from_template("""
    You are a friendly coding tutor for kids.

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
                                            
    If possible, give examples and real-world applications.

    Format your answer STRICTLY like this:

    Title (1 line)

    ## Explanation
    Short explanation in 2-3 lines.

    ## Example
    Simple example.

    ## Tip
    One small helpful tip.

    Use:
    - Short sentences
    - Line breaks
    - No long paragraphs
    - No symbols like --- or ###

    Use previous conversation if helpful.

    Chat History:
    {history}

    Context:
    {context}

    Question:
    {question}

    Answer like a teacher:
    """)

    retriever = vector_db.as_retriever(search_kwargs={"k": 3})

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
        return x["question"]
    
    def get_history(x):
        return format_history(x["history"])
    
    def combine_context(x):
        # 🔥 retrieve from vector DB
        docs = retriever.invoke(x["question"])
        rag_context = format_docs(docs)

        # 🔥 lesson context from frontend
        lesson_context = ""
        if x.get("lesson_content"):
            lesson_context = f"Lesson Content:\n{x['lesson_content']}\n\n"

        return lesson_context + rag_context

    rag_chain = (
        {
            "context": RunnablePassthrough() | combine_context,
            "question": RunnablePassthrough() | get_question,
            "history": RunnablePassthrough() | get_history
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

@app.options("/chat")
async def options_chat():
    return {}

@app.post("/chat")
async def chat_api(req: ChatRequest):
    response = rag_chain.invoke({
        "question": req.message,
        "history": req.history,
        "lesson_content": req.lesson_content,
        "lesson_title": req.lesson_title
    })
    return {"reply": response}