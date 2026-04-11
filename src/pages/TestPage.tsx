import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { X, CheckCircle, XCircle, Star, Zap } from "lucide-react";
import { useProgress } from "../context/ProgressContext";

// ── Types ─────────────────────────────────────────────────────────────────────

type Option = {
  id: string;
  option_text: string;
  is_correct: boolean;
  explanation: string;
};

type CodingTestCase = {
  id: string;
  input: string;
  expected_output: string;
};

type Question = {
  id: string;
  question_text: string;
  question_type: "mcq" | "coding";
  topic_id: string;
  mcq_options: Option[];
  coding_test_cases: CodingTestCase[];
};

// ── Constants ─────────────────────────────────────────────────────────────────

const CORRECT_MESSAGES = ["Amazing! 🎉", "You rock! ⭐", "Superstar! 🌟", "Brilliant! 🧠", "Nailed it! 🎯"];
const WRONG_MESSAGES   = ["Almost! 💪", "Keep going! 🔥", "You got this! 🚀", "Try harder! 😤", "So close! 🌈"];
const randomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// ── Floating Stars ────────────────────────────────────────────────────────────

const FloatingStars = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="absolute text-yellow-300 opacity-20 animate-bounce"
        style={{
          left:              `${(i * 83 + 7) % 95}%`,
          top:               `${(i * 67 + 11) % 90}%`,
          fontSize:          `${12 + (i % 4) * 8}px`,
          animationDelay:    `${i * 0.4}s`,
          animationDuration: `${2 + (i % 3)}s`,
        }}
      >
        {["⭐", "✨", "💫", "🌟"][i % 4]}
      </div>
    ))}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate   = useNavigate();

  // ── Progress context ─────────────────────────────────
  const { markLessonTested } = useProgress();

  // ── Core state ───────────────────────────────────────
  const [questions,      setQuestions]      = useState<Question[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [score,          setScore]          = useState(0);
  const [finished,       setFinished]       = useState(false);
  const [mascotMessage,  setMascotMessage]  = useState<string | null>(null);
  const [streakCount,    setStreakCount]     = useState(0);

  // ── Supabase tracking state ──────────────────────────
  const [userId,            setUserId]            = useState<string | null>(null);
  const [testAttemptId,     setTestAttemptId]     = useState<string | null>(null);
  const [attemptNumber,     setAttemptNumber]     = useState(1);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionId,         setSessionId]         = useState<string | null>(null);

  // ── Lesson info ──────────────────────────────────────
  const [lessonId,     setLessonId]     = useState<string | null>(null);
  const [unitId,       setUnitId]       = useState<string | null>(null);
  const [courseId,     setCourseId]     = useState<string | null>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);

  // ── Refs for closure-safe access in effect 5 ────────
  const lessonIdRef = useRef<string | null>(null);
  const unitIdRef   = useRef<string | null>(null);

  // ── Chat state ───────────────────────────────────────
  const [showChat,     setShowChat]     = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [userMessage,  setUserMessage]  = useState("");
  const chatEndRef   = useRef<HTMLDivElement | null>(null);
  const feedbackRef  = useRef<HTMLDivElement | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // ── 1. Get logged-in user ────────────────────────────
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    getUser();
  }, []);

  // ── 2. Fetch questions ───────────────────────────────
  useEffect(() => {
    if (!testId) return;
    const fetchQuestions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select(`
          id,
          question_text,
          question_type,
          topic_id,
          mcq_options (
            id,
            option_text,
            is_correct,
            explanation
          ),
          coding_test_cases (
            id,
            input,
            expected_output
          )
        `)
        .eq("test_id", testId);

      if (error) { console.error("Questions fetch error:", error.message); }
      else        { setQuestions(data as Question[] || []); }
      setLoading(false);
    };
    fetchQuestions();
  }, [testId]);

  // ── 2b. Fetch lesson meta + next lesson ──────────────
  useEffect(() => {
    if (!testId) return;
    const fetchLessonMeta = async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select(`
          id,
          topic_id,
          order_index,
          topics (
            unit_id,
            units (
              course_id
            )
          )
        `)
        .eq("test_id", testId)
        .limit(1);

      if (error || !data || data.length === 0) {
        console.error("Lesson meta fetch error:", error?.message);
        return;
      }

      const cur = data[0] as any;
      setLessonId(cur.id);
      setUnitId(cur.topics?.unit_id ?? null);
      setCourseId(cur.topics?.units?.course_id ?? null);

      // Keep refs in sync — state is stale in effect 5 closure
      lessonIdRef.current = cur.id;
      unitIdRef.current   = cur.topics?.unit_id ?? null;

      // Get current topic to find next topic
      const { data: topicDataArr, error: topicError } = await supabase
        .from("topics")
        .select("id, order_index, unit_id")
        .eq("id", cur.topic_id)
        .limit(1);

      if (topicError || !topicDataArr || topicDataArr.length === 0) return;
      const topicData = topicDataArr[0];

      // Try next lesson in same topic first
      const { data: nextInTopic } = await supabase
        .from("lessons")
        .select("id")
        .eq("topic_id", cur.topic_id)
        .gt("order_index", cur.order_index)
        .order("order_index", { ascending: true })
        .limit(1);

      if (nextInTopic && nextInTopic.length > 0) {
        setNextLessonId(nextInTopic[0].id);
        return;
      }

      // No next lesson in topic — try first lesson of next topic
      const { data: nextTopic } = await supabase
        .from("topics")
        .select("id")
        .eq("unit_id", topicData.unit_id)
        .gt("order_index", topicData.order_index)
        .order("order_index", { ascending: true })
        .limit(1);

      if (!nextTopic || nextTopic.length === 0) {
        setNextLessonId(null);
        return;
      }

      const { data: firstLesson } = await supabase
        .from("lessons")
        .select("id")
        .eq("topic_id", nextTopic[0].id)
        .order("order_index", { ascending: true })
        .limit(1);

      if (firstLesson && firstLesson.length > 0) {
        setNextLessonId(firstLesson[0].id);
      } else {
        setNextLessonId(null);
      }
    };
    fetchLessonMeta();
  }, [testId]);

  // ── 3. Get attempt number ────────────────────────────
  useEffect(() => {
    if (!testId || !userId) return;
    const getAttemptNumber = async () => {
      const { data, error } = await supabase
        .from("user_attempts")
        .select("attempt_number")
        .eq("user_id", userId)
        .eq("test_id", testId);

      if (error) { console.error("Attempt number error:", error.message); return; }

      if (!data || data.length === 0) {
        setAttemptNumber(1);
      } else {
        const max = Math.max(...data.map((d) => d.attempt_number));
        setAttemptNumber(max + 1);
      }
    };
    getAttemptNumber();
  }, [testId, userId]);

  // ── 4. Create test_attempts row when test starts ─────
  useEffect(() => {
    if (!testId || !userId || questions.length === 0 || testAttemptId) return;

    const createTestAttempt = async () => {
      const { data, error } = await supabase
        .from("test_attempts")
        .insert({
          user_id:         userId,
          test_id:         testId,
          total_questions: questions.length,
          correct_answers: 0,
          score:           0,
          started_at:      new Date().toISOString(),
          completed_at:    null,
        })
        .select("id")
        .limit(1);

      if (error) { console.error("Failed to create test attempt:", error.message); return; }
      if (data && data.length > 0) { setTestAttemptId(data[0].id); }
    };

    createTestAttempt();
  }, [testId, userId, questions.length]);

  // ── 5. Finalize test_attempts row when finished ──────
  useEffect(() => {
    if (!finished || !testAttemptId) return;

    const finalizeTestAttempt = async () => {
      const percent = Math.round((score / questions.length) * 100);

      const { error } = await supabase
        .from("test_attempts")
        .update({
          correct_answers: score,
          score:           percent,
          completed_at:    new Date().toISOString(),
        })
        .eq("id", testAttemptId);

      if (error) { console.error("Failed to finalize test attempt:", error.message); return; }

      // Use refs — state values are null here due to closure
      if (lessonIdRef.current && unitIdRef.current) {
        markLessonTested(lessonIdRef.current, unitIdRef.current, score * 10);
      } else {
        console.warn("markLessonTested skipped — refs still null");
      }
    };

    finalizeTestAttempt();
  }, [finished, testAttemptId]);

  // ── Scroll chat to bottom ────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── Chat: typewriter effect ──────────────────────────
  const typeMessage = (text: string) => {
    let index = 0;
    setChatMessages(prev => [...prev.slice(0, -1), { role: "bot", content: "" }]);
    const interval = setInterval(() => {
      index++;
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "bot", content: text.slice(0, index) };
        return updated;
      });
      if (index >= text.length) clearInterval(interval);
    }, 20);
  };

  // ── Chat: send message ───────────────────────────────
  const sendMessage = async () => {
    if (!userMessage.trim() || !currentQuestion) return;
    if (!userId) { console.error("No user ID"); return; }

    const newUserMsg = { role: "user", content: userMessage };
    const updatedHistory = [...chatMessages, newUserMsg];
    setChatMessages([...updatedHistory, { role: "bot", content: "Typing..." }]);
    const messageToSend = userMessage;
    setUserMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:         messageToSend,
          question:        currentQuestion.question_text,
          selected_option: selectedOption?.option_text,
          correct_answer:  currentQuestion.mcq_options.find(o => o.is_correct)?.option_text,
          history:         updatedHistory.map(msg => ({
            role:    msg.role === "bot" ? "assistant" : msg.role,
            content: msg.content,
          })),
          user_id:  userId,
          username: "student",
        }),
      });

      const data = await res.json();

      // Save session + messages to Supabase
      let currentSession = sessionId;
      if (!currentSession) {
        currentSession = crypto.randomUUID();
        setSessionId(currentSession);
      }

      await supabase.from("ai_messages").insert([{
        session_id:   currentSession,
        sender:       "user",
        content:      messageToSend,
        message_type: "doubt",
        metadata:     { test_id: testId, question_id: currentQuestion.id },
      }]);

      await supabase.from("ai_messages").insert([{
        session_id:   currentSession,
        sender:       "ai",
        content:      data.reply,
        message_type: "feedback",
        metadata:     { test_id: testId, question_id: currentQuestion.id },
      }]);

      typeMessage(data.reply);

    } catch {
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { role: "bot", content: "Error connecting to AI" },
      ]);
    }
  };

  // ── Handle answer selection ──────────────────────────
  const handleSelect = async (opt: Option) => {
    if (selectedOption) return;
    if (!userId) { console.error("No user ID"); return; }

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    setSelectedOption(opt);

    if (opt.is_correct) {
      setScore(s => s + 1);
      setStreakCount(s => s + 1);
      setMascotMessage(randomFrom(CORRECT_MESSAGES));
    } else {
      setStreakCount(0);
      setMascotMessage(randomFrom(WRONG_MESSAGES));
      setShowChat(true);
    }

    // Scroll to feedback
    setTimeout(() => {
      feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    const { error } = await supabase.from("user_attempts").insert({
      user_id:                 userId,
      test_id:                 testId,
      topic_id:                currentQuestion.topic_id,
      question_id:             currentQuestion.id,
      selected_option_or_code: opt.id,
      is_correct:              opt.is_correct,
      attempt_number:          attemptNumber,
      time_taken_seconds:      timeTaken,
      xp_earned:               opt.is_correct ? 10 : 0,
      submitted_at:            new Date().toISOString(),
    });

    if (error) { console.error("Failed to save attempt:", error.message); }
  };

  // ── Next question ────────────────────────────────────
  const handleNext = () => {
    setSelectedOption(null);
    setMascotMessage(null);
    setQuestionStartTime(Date.now());
    setShowChat(false);
    setChatMessages([]);

    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  // ── Navigate to next lesson ──────────────────────────
  const handleNextLesson = () => {
    if (nextLessonId) {
      navigate(`/lesson/${nextLessonId}`);
    } else if (courseId) {
      navigate(`/course/${courseId}/units`);
    } else {
      navigate(-1);
    }
  };

  // ── Restart ──────────────────────────────────────────
  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setStreakCount(0);
    setFinished(false);
    setMascotMessage(null);
    setQuestionStartTime(Date.now());
    setAttemptNumber(n => n + 1);
    setTestAttemptId(null);
    setShowChat(false);
    setChatMessages([]);
  };

  // ── Option button style ──────────────────────────────
  const optionStyle = (opt: Option) => {
    const base = "w-full px-5 py-4 rounded-3xl font-black text-left transition-all duration-200 flex items-center justify-between gap-3 border-b-4 text-lg active:translate-y-1 active:border-b-0";
    if (!selectedOption) return `${base} bg-white border-gray-200 border-2 border-b-gray-300 text-gray-700 hover:border-[#1CB0F6] hover:bg-[#f0faff] hover:scale-[1.02]`;
    if (opt.is_correct)  return `${base} bg-[#d7ffb8] border-[#58CC02] border-2 border-b-[#3fa000] text-[#2a6e00]`;
    if (selectedOption.id === opt.id && !opt.is_correct) return `${base} bg-[#ffdfe0] border-[#FF4B4B] border-2 border-b-[#cc0000] text-[#8b0000]`;
    return `${base} bg-gray-50 border-gray-200 border-2 border-b-gray-200 text-gray-400 opacity-60`;
  };

  // ── Loading ──────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
      <div className="flex flex-col items-center gap-5">
        <div className="text-6xl animate-bounce">🦉</div>
        <div className="w-12 h-12 border-4 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-gray-400 text-xl">Preparing your quest...</p>
      </div>
    </div>
  );

  // ── No questions ─────────────────────────────────────
  if (!loading && questions.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
      <div className="text-center space-y-5">
        <div className="text-6xl">😕</div>
        <p className="font-black text-gray-500 text-2xl">No questions found!</p>
        <button onClick={() => navigate(-1)}
          className="px-8 py-4 bg-[#1CB0F6] text-white font-black rounded-2xl shadow-[0_4px_0_0_#1899D6] active:translate-y-1 active:shadow-none transition-all text-lg">
          Go Back
        </button>
      </div>
    </div>
  );

  // ── Finished ─────────────────────────────────────────
  if (finished) {
    const percent   = Math.round((score / questions.length) * 100);
    const isPerfect = percent === 100;
    const isGood    = percent >= 70;
    const canProceed = percent >= 40;

    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-6">
        <FloatingStars />
        <div className="relative z-10 bg-white rounded-[40px] border-2 border-gray-100 shadow-2xl p-10 max-w-sm w-full flex flex-col items-center gap-6 text-center">
          <div className="text-8xl animate-bounce">{isPerfect ? "🏆" : isGood ? "🌟" : "💪"}</div>
          <h1 className="text-4xl font-black text-[#4B4B4B]">
            {isPerfect ? "PERFECT!" : isGood ? "Well Done!" : "Keep Going!"}
          </h1>
          <p className="text-gray-400 font-bold text-lg">
            {isPerfect ? "You got every single one right!" : isGood ? "You're doing great, adventurer!" : "Practice makes perfect! Try again!"}
          </p>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f0" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke={isPerfect ? "#FFC800" : isGood ? "#58CC02" : "#1CB0F6"}
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - percent / 100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-[#4B4B4B]">{percent}%</span>
              <span className="text-xs font-bold text-gray-400">{score}/{questions.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#FFF9E6] px-6 py-3 rounded-2xl border-2 border-[#FFC800]">
            <Zap size={20} className="text-[#FFC800]" />
            <span className="font-black text-[#CC9F00] text-lg">+{score * 10} XP earned!</span>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <button onClick={() => navigate(-1)}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition text-base">
              Exit
            </button>
            {canProceed ? (
              <button
                onClick={handleNextLesson}
                className="flex-1 py-4 bg-[#58CC02] text-white font-black rounded-2xl shadow-[0_4px_0_0_#46A302] active:translate-y-1 active:shadow-none transition-all text-base"
              >
                {nextLessonId ? "Next Lesson →" : "Finish 🎉"}
              </button>
            ) : (
              <button
                onClick={handleRestart}
                className="flex-1 py-4 bg-[#FF4B4B] text-white font-black rounded-2xl shadow-[0_4px_0_0_#cc0000] active:translate-y-1 active:shadow-none transition-all text-base"
              >
                Try Again 🔄
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Question screen ───────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <FloatingStars />
      <div className="relative z-10 bg-white border-b-2 border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-gray-500 transition flex-shrink-0">
          <X size={28} />
        </button>
        <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
          <div className="h-full bg-[#58CC02] rounded-full transition-all duration-700 relative overflow-hidden" style={{ width: `${progress}%` }}>
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#FFF9E6] px-3 py-1.5 rounded-full border-2 border-[#FFC800] flex-shrink-0">
          <Zap size={14} className="text-[#FFC800]" />
          <span className="font-black text-[#CC9F00] text-sm">{streakCount}</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-[#FFC800]" fill="#FFC800" />
          <span className="font-black text-gray-400 text-sm uppercase tracking-widest">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="bg-white rounded-[32px] border-2 border-gray-100 shadow-md p-8">
          <div className="flex items-start gap-4">
            <div className="text-5xl flex-shrink-0 mt-1">🦉</div>
            <div>
              <p className="text-xs font-black text-[#1CB0F6] uppercase tracking-widest mb-2">What's the answer?</p>
              <h2 className="text-xl font-black text-[#4B4B4B] leading-snug">{currentQuestion.question_text}</h2>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {currentQuestion.mcq_options.map((opt) => (
            <button key={opt.id} onClick={() => handleSelect(opt)} disabled={!!selectedOption} className={optionStyle(opt)}>
              <span>{opt.option_text}</span>
              {selectedOption && opt.is_correct && <CheckCircle size={24} className="text-[#58CC02] flex-shrink-0" />}
              {selectedOption && selectedOption.id === opt.id && !opt.is_correct && <XCircle size={24} className="text-[#FF4B4B] flex-shrink-0" />}
            </button>
          ))}
        </div>

        {selectedOption && (
          <div
            ref={feedbackRef}
            className={`rounded-3xl p-6 border-2 space-y-4 ${selectedOption.is_correct ? "bg-[#d7ffb8] border-[#58CC02]" : "bg-[#ffdfe0] border-[#FF4B4B]"}`}
            style={{ animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedOption.is_correct ? "🎉" : "😅"}</span>
              <div>
                <p className={`font-black text-lg ${selectedOption.is_correct ? "text-[#2a6e00]" : "text-[#8b0000]"}`}>{mascotMessage}</p>
                {streakCount >= 2 && selectedOption.is_correct && (
                  <p className="text-[#FF9600] font-bold text-sm">🔥 {streakCount} in a row!</p>
                )}
              </div>
            </div>

            {selectedOption.explanation && (
              <p className={`text-sm font-bold leading-relaxed ${selectedOption.is_correct ? "text-[#3a8a00]" : "text-[#8b0000]"}`}>
                {selectedOption.explanation}
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowChat(!showChat)} className="flex-1 py-4 bg-[#1CB0F6] text-white font-black text-lg rounded-2xl shadow-[0_4px_0_0_#1899D6] active:translate-y-1 active:shadow-none transition-all">
                {selectedOption.is_correct ? "ASK MORE 💬" : "ASK WHY ❓"}
              </button>
              <button onClick={handleNext} className={`flex-1 py-4 text-white font-black text-lg rounded-2xl transition-all active:translate-y-1 active:shadow-none ${selectedOption.is_correct ? "bg-[#58CC02] shadow-[0_4px_0_0_#46A302]" : "bg-[#FF4B4B] shadow-[0_4px_0_0_#cc0000]"}`}>
                {currentIndex + 1 >= questions.length ? "SEE RESULTS 🏆" : "CONTINUE →"}
              </button>
            </div>

            {showChat && (
              <div className="mt-4 bg-white border-2 border-gray-200 rounded-2xl p-4 space-y-3 max-h-80 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`p-3 rounded-xl text-sm font-medium max-w-[85%] ${msg.role === "user" ? "bg-[#1CB0F6] text-white self-end ml-auto" : "bg-gray-100 text-gray-700 self-start"}`}>
                      {msg.content}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask your doubt..."
                    className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1CB0F6]"
                  />
                  <button onClick={sendMessage} className="bg-[#58CC02] text-white px-4 rounded-xl font-bold shadow-[0_3px_0_0_#46A302] active:translate-y-0.5 active:shadow-none transition-all">Send</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}