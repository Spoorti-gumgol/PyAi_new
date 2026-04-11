import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { X, CheckCircle, XCircle, Star, Zap, Brain } from "lucide-react";
import { useProgress } from "../context/ProgressContext";

// ── Types ─────────────────────────────────────────────────────────────────────

type Option = {
  id: string;
  option_text: string;
  is_correct: boolean;
  explanation: string;
};

type Question = {
  id: string;
  question_text: string;
  topic_id: string;
  difficulty: number;
  mcq_options: Option[];
};

// ── Constants ─────────────────────────────────────────────────────────────────

const CORRECT_MESSAGES = ["Amazing! 🎉", "You rock! ⭐", "Superstar! 🌟", "Brilliant! 🧠", "Nailed it! 🎯"];
const WRONG_MESSAGES   = ["Almost! 💪", "Keep going! 🔥", "You got this! 🚀", "Try harder! 😤", "So close! 🌈"];
const randomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const MAX_QUESTIONS = 10;
const INITIAL_DIFFICULTY = 50;
const DIFFICULTY_STEP = 15;
const DIFFICULTY_MIN = 25;
const DIFFICULTY_MAX = 85;
const DIFFICULTY_BAND = 10;

// ── Floating particles ────────────────────────────────────────────────────────

const FloatingParticles = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    {[...Array(14)].map((_, i) => (
      <div key={i} className="absolute opacity-15 animate-bounce"
        style={{
          left:              `${(i * 79 + 11) % 94}%`,
          top:               `${(i * 61 + 7) % 88}%`,
          fontSize:          `${14 + (i % 4) * 7}px`,
          animationDelay:    `${i * 0.3}s`,
          animationDuration: `${2 + (i % 3) * 0.8}s`,
          color:             ["#FF9600", "#1CB0F6", "#58CC02", "#CE82FF", "#FFC800"][i % 5],
        }}
      >
        {["🧠", "⚡", "🔥", "💡", "🎯", "⭐", "🚀"][i % 7]}
      </div>
    ))}
  </div>
);

// ── Score Ring ────────────────────────────────────────────────────────────────

const ScoreRing = ({ percent, score, total }: { percent: number; score: number; total: number }) => {
  const isPerfect = percent === 100;
  const isGood    = percent >= 70;
  const color     = isPerfect ? "#FFC800" : isGood ? "#58CC02" : "#FF4B4B";
  const r         = 42;
  const circ      = 2 * Math.PI * r;

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f0f0f0" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${circ * (1 - percent / 100)}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-[#4B4B4B]">{percent}%</span>
        <span className="text-xs font-bold text-gray-400">{score}/{total}</span>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdaptiveTestPage() {
  const { unitId }  = useParams<{ unitId: string }>();
  const navigate    = useNavigate();
  const { userProgress } = useProgress();

  // ── State ──────────────────────────────────────────
  const [questions,      setQuestions]      = useState<Question[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [unitName,       setUnitName]       = useState("Unit Assessment");
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [score,          setScore]          = useState(0);
  const [finished,       setFinished]       = useState(false);
  const [mascotMessage,  setMascotMessage]  = useState<string | null>(null);
  const [streakCount,    setStreakCount]     = useState(0);
  const [answers,        setAnswers]        = useState<{ correct: boolean; question: string }[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Adaptive difficulty state
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(INITIAL_DIFFICULTY);
  const [adaptiveQuestions, setAdaptiveQuestions]  = useState<Question[]>([]);
  const [usedIds,           setUsedIds]            = useState<string[]>([]);

  const generateAIQuestions = async () => {
    if (!userId || !currentQuestion) return;

    try {
      // ✅ Get user doubts from ai_messages
      const { data: messages, error } = await supabase
        .from("ai_messages")
        .select("content, metadata")
        .eq("sender", "user")
        .eq("message_type", "doubt");

      if (error) {
        console.error("Error fetching doubts:", error);
        return;
      }

      // ✅ Filter only relevant doubts for THIS topic (optional but powerful)
      const userDoubts = messages
        ?.filter((msg: any) => msg.metadata?.topic_id === currentQuestion.topic_id)
        .map((msg: any) => msg.content) || [];

      // 🔥 Call backend
      const res = await fetch("http://localhost:8000/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: userId,
          topic_id: currentQuestion.topic_id,
          doubts: userDoubts,
          existing_questions: questions.map(q => q.question_text),
          difficulty: currentDifficulty
        })
      });

      const data = await res.json();

      // ✅ Add generated questions
      if (data.generated_questions?.length) {
        setQuestions(prev => [...prev, ...data.generated_questions]);
      }

    } catch (err) {
      console.error("AI generation failed", err);
    }
  };

  // Auth
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  

  // ── Fetch unit name ──────────────────────────────
  useEffect(() => {
    if (!unitId) return;
    supabase.from("units").select("name").eq("id", unitId).limit(1)
      .then(({ data }) => { if (data && data[0]) setUnitName(data[0].name); });
  }, [unitId]);

  // ── Fetch ALL questions for this unit ─────────────
  useEffect(() => {
    if (!unitId) return;
    const fetchQuestions = async () => {
      setLoading(true);

      // 1. Get all topic IDs for this unit
      const { data: topics, error: tErr } = await supabase
        .from("topics")
        .select("id")
        .eq("unit_id", unitId);

      if (tErr || !topics || topics.length === 0) {
        setLoading(false);
        return;
      }

      const topicIds = topics.map((t: any) => t.id);

      // 2. Get all questions for those topics
      const { data: qs, error: qErr } = await supabase
        .from("questions")
        .select(`
          id,
          question_text,
          topic_id,
          difficulty,
          mcq_options (
            id,
            option_text,
            is_correct,
            explanation
          )
        `)
        .in("topic_id", topicIds);

      if (qErr) { console.error(qErr); setLoading(false); return; }

      const allQuestions = (qs || []) as Question[];

      // Shuffle all questions
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);

      // Pick one random starting question
      if (shuffled.length > 0) {
        const firstQuestion = shuffled[Math.floor(Math.random() * shuffled.length)];
        setAdaptiveQuestions([firstQuestion]);
        setUsedIds([firstQuestion.id]);
      }

      setLoading(false);
    };

    fetchQuestions();
  }, [unitId]);

  // ── Derived current question from adaptive list ──
  const currentQuestion = adaptiveQuestions[currentIndex];
  const progress = (currentIndex / MAX_QUESTIONS) * 100;

  // ── Adaptive next question picker ────────────────
  const pickNextQuestion = (difficulty: number, currentUsedIds: string[]): Question | null => {
    const candidates = questions.filter(
      (q) =>
        !currentUsedIds.includes(q.id) &&
        Math.abs((q.difficulty ?? INITIAL_DIFFICULTY) - difficulty) <= DIFFICULTY_BAND
    );

    if (candidates.length === 0) {
      // Fallback: pick any unused question
      const fallback = questions.filter((q) => !currentUsedIds.includes(q.id));
      if (fallback.length === 0) return null;
      return fallback[Math.floor(Math.random() * fallback.length)];
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  // ── Handle answer ──────────────────────────────────
  const handleSelect = async (opt: Option) => {
    if (selectedOption) return;
    setSelectedOption(opt);

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

    if (opt.is_correct) {
      setScore(s => s + 1);
      setStreakCount(s => s + 1);
      setMascotMessage(randomFrom(CORRECT_MESSAGES));
      setCurrentDifficulty(d => Math.min(DIFFICULTY_MAX, d + DIFFICULTY_STEP));
    } else {
      setStreakCount(0);
      setMascotMessage(randomFrom(WRONG_MESSAGES));
      setCurrentDifficulty(d => Math.max(DIFFICULTY_MIN, d - DIFFICULTY_STEP));
    }

    setAnswers(prev => [...prev, {
      correct:  opt.is_correct,
      question: currentQuestion.question_text,
    }]);

    // Save to user_attempts if logged in
    if (userId && unitId) {
      await supabase.from("user_attempts").insert({
        user_id:                 userId,
        topic_id:                currentQuestion.topic_id,
        question_id:             currentQuestion.id,
        selected_option_or_code: opt.id,
        is_correct:              opt.is_correct,
        attempt_number:          1,
        time_taken_seconds:      timeTaken,
        xp_earned:               opt.is_correct ? 10 : 0,
        submitted_at:            new Date().toISOString(),
      });
    }
  };

  // ── Next ──────────────────────────────────────────
  const handleNext = () => {

      // 👇 ADD THIS HERE
    if (currentIndex > 0 && currentIndex % 3 === 0) {
      generateAIQuestions();
    }

    setSelectedOption(null);
    setMascotMessage(null);
    setQuestionStartTime(Date.now());

    // Check if we've hit the 30-question limit
    if (adaptiveQuestions.length >= MAX_QUESTIONS) {
      setFinished(true);
      return;
    }

    // Compute next difficulty based on last answer
    const lastWasCorrect = answers[answers.length - 1]?.correct ?? false;
    const nextDifficulty = lastWasCorrect
      ? Math.min(DIFFICULTY_MAX, currentDifficulty)
      : Math.max(DIFFICULTY_MIN, currentDifficulty);

    const updatedUsedIds = [...usedIds];
    const nextQuestion = pickNextQuestion(nextDifficulty, updatedUsedIds);

    if (!nextQuestion) {
      // No more questions available → finish early
      setFinished(true);
      return;
    }

    const newUsedIds = [...updatedUsedIds, nextQuestion.id];
    setUsedIds(newUsedIds);
    setAdaptiveQuestions(prev => [...prev, nextQuestion]);
    setCurrentIndex(i => i + 1);
  };

  // ── Restart ───────────────────────────────────────
  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setStreakCount(0);
    setFinished(false);
    setMascotMessage(null);
    setAnswers([]);
    setQuestionStartTime(Date.now());
    setCurrentDifficulty(INITIAL_DIFFICULTY);

    // Re-shuffle and pick new first question
    const reshuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(reshuffled);

    if (reshuffled.length > 0) {
      const firstQuestion = reshuffled[Math.floor(Math.random() * reshuffled.length)];
      setAdaptiveQuestions([firstQuestion]);
      setUsedIds([firstQuestion.id]);
    } else {
      setAdaptiveQuestions([]);
      setUsedIds([]);
    }
  };




  // ── Option style ──────────────────────────────────
  const optionStyle = (opt: Option) => {
    const base = "w-full px-5 py-4 rounded-3xl font-black text-left transition-all duration-200 flex items-center justify-between gap-3 border-b-4 text-lg active:translate-y-1 active:border-b-0";
    if (!selectedOption) return `${base} bg-white border-gray-200 border-2 border-b-gray-300 text-gray-700 hover:border-[#FF9600] hover:bg-[#fff8f0] hover:scale-[1.02]`;
    if (opt.is_correct)  return `${base} bg-[#d7ffb8] border-[#58CC02] border-2 border-b-[#3fa000] text-[#2a6e00]`;
    if (selectedOption.id === opt.id && !opt.is_correct) return `${base} bg-[#ffdfe0] border-[#FF4B4B] border-2 border-b-[#cc0000] text-[#8b0000]`;
    return `${base} bg-gray-50 border-gray-200 border-2 border-b-gray-200 text-gray-400 opacity-60`;
  };

  // ── Loading ───────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
      <div className="flex flex-col items-center gap-5">
        <div className="text-6xl animate-bounce">🧠</div>
        <div className="w-12 h-12 border-4 border-[#FF9600] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-gray-400 text-xl">Preparing your assessment...</p>
      </div>
    </div>
  );

  // ── No questions ──────────────────────────────────
  if (!loading && questions.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
      <div className="text-center space-y-5">
        <div className="text-6xl">😕</div>
        <p className="font-black text-gray-500 text-2xl">No questions found for this unit!</p>
        <button onClick={() => navigate(-1)}
          className="px-8 py-4 bg-[#FF9600] text-white font-black rounded-2xl shadow-[0_4px_0_0_#CC7A00] active:translate-y-1 active:shadow-none transition-all text-lg">
          Go Back
        </button>
      </div>
    </div>
  );

  // ── Finished screen ───────────────────────────────
  if (finished) {
    const totalAnswered = answers.length;
    const percent   = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
    const isPerfect = percent === 100;
    const isGood    = percent >= 70;

    const handleContinue = () => {
      if (!unitId) return;

      if (percent >= 45) {
        // 👉 Go to next unit
        navigate(`/units/${Number(unitId) + 1}`);
      } else {
        // 👉 Restart same unit
        handleRestart();
      }
    };

    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-6 py-12">
        <FloatingParticles />

        <div className="relative z-10 bg-white rounded-[40px] border-2 border-orange-100 shadow-2xl p-10 max-w-lg w-full flex flex-col items-center gap-6 text-center">

          {/* Trophy */}
          <div className="text-8xl animate-bounce">
            {isPerfect ? "🏆" : isGood ? "🌟" : "💪"}
          </div>

          <div>
            <h1 className="text-4xl font-black text-[#4B4B4B]">
              {isPerfect ? "PERFECT!" : isGood ? "Great Work!" : "Keep Practicing!"}
            </h1>
            <p className="text-gray-400 font-bold mt-2">
              Assessment complete for <span className="text-[#FF9600]">{unitName}</span>
            </p>
          </div>

          {/* Score ring */}
          <ScoreRing percent={percent} score={score} total={totalAnswered} />

          {/* XP */}
          <div className="flex items-center gap-2 bg-[#FFF9E6] px-6 py-3 rounded-2xl border-2 border-[#FFC800]">
            <Zap size={20} className="text-[#FFC800]" />
            <span className="font-black text-[#CC9F00] text-lg">+{score * 10} XP earned!</span>
          </div>

          {/* Answer breakdown */}
          <div className="w-full bg-gray-50 rounded-3xl p-5 space-y-2 text-left max-h-52 overflow-y-auto">
            <p className="font-black text-gray-500 text-xs uppercase tracking-widest mb-3">Answer Breakdown</p>
            {answers.map((a, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-2xl border-2 ${a.correct ? "bg-[#f0fff4] border-[#58CC02]" : "bg-[#fff0f0] border-[#FF4B4B]"}`}>
                <span className="text-lg flex-shrink-0">{a.correct ? "✅" : "❌"}</span>
                <p className="text-xs font-bold text-gray-600 leading-snug">{a.question}</p>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full pt-2">
            <button onClick={() => navigate(-1)}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition text-base">
              Exit
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 py-4 bg-[#FF9600] text-white font-black rounded-2xl shadow-[0_4px_0_0_#CC7A00] active:translate-y-1 active:shadow-none transition-all text-base"
            >
              {percent >= 45 ? "Next Unit 🚀" : "Retry Unit 🔄"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Guard: wait until adaptive questions are ready ─
  if (!currentQuestion) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
      <div className="flex flex-col items-center gap-5">
        <div className="text-6xl animate-bounce">🧠</div>
        <div className="w-12 h-12 border-4 border-[#FF9600] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-gray-400 text-xl">Loading question...</p>
      </div>
    </div>
  );

  // ── Question screen ───────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col">
      <FloatingParticles />

      {/* Header */}
      <div className="relative z-10 bg-white border-b-2 border-orange-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-gray-500 transition flex-shrink-0">
          <X size={28} />
        </button>

        {/* Progress bar */}
        <div className="flex-1 bg-orange-50 rounded-full h-5 overflow-hidden border-2 border-orange-100">
          <div
            className="h-full bg-[#FF9600] rounded-full transition-all duration-700 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1 bg-[#FFF9E6] px-3 py-1.5 rounded-full border-2 border-[#FFC800] flex-shrink-0">
          <Zap size={14} className="text-[#FFC800]" />
          <span className="font-black text-[#CC9F00] text-sm">{streakCount}</span>
        </div>
      </div>

      {/* Assessment badge */}
      <div className="relative z-10 flex justify-center pt-6 pb-2">
        <div className="flex items-center gap-2 bg-[#FF9600] text-white px-5 py-2 rounded-full shadow-[0_3px_0_0_#CC7A00] font-black text-xs uppercase tracking-widest">
          <Brain size={14} />
          Unit Assessment · {unitName}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-6 py-6 flex flex-col gap-6">

        {/* Question counter */}
        <div className="flex items-center gap-2">
          <Star size={16} className="text-[#FFC800]" fill="#FFC800" />
          <span className="font-black text-gray-400 text-sm uppercase tracking-widest">
            Question {currentIndex + 1} of {MAX_QUESTIONS}
          </span>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-[32px] border-2 border-orange-100 shadow-md p-8">
          <div className="flex items-start gap-4">
            <div className="text-5xl flex-shrink-0 mt-1">🧠</div>
            <div>
              <p className="text-xs font-black text-[#FF9600] uppercase tracking-widest mb-2">
                What's the answer?
              </p>
              <h2 className="text-xl font-black text-[#4B4B4B] leading-snug">
                {currentQuestion.question_text}
              </h2>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {currentQuestion.mcq_options.map((opt) => (
            <button key={opt.id} onClick={() => handleSelect(opt)}
              disabled={!!selectedOption} className={optionStyle(opt)}>
              <span>{opt.option_text}</span>
              {selectedOption && opt.is_correct && <CheckCircle size={24} className="text-[#58CC02] flex-shrink-0" />}
              {selectedOption && selectedOption.id === opt.id && !opt.is_correct && <XCircle size={24} className="text-[#FF4B4B] flex-shrink-0" />}
            </button>
          ))}
        </div>

        {/* Feedback panel */}
        {selectedOption && (
          <div
            className={`rounded-3xl p-6 border-2 space-y-4 ${selectedOption.is_correct ? "bg-[#d7ffb8] border-[#58CC02]" : "bg-[#ffdfe0] border-[#FF4B4B]"}`}
            style={{ animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedOption.is_correct ? "🎉" : "😅"}</span>
              <div>
                <p className={`font-black text-lg ${selectedOption.is_correct ? "text-[#2a6e00]" : "text-[#8b0000]"}`}>
                  {mascotMessage}
                </p>
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

            <button onClick={handleNext}
              className={`w-full py-4 text-white font-black text-lg rounded-2xl transition-all active:translate-y-1 active:shadow-none ${
                selectedOption.is_correct
                  ? "bg-[#58CC02] shadow-[0_4px_0_0_#46A302]"
                  : "bg-[#FF4B4B] shadow-[0_4px_0_0_#cc0000]"
              }`}>
              {adaptiveQuestions.length >= MAX_QUESTIONS ? "SEE RESULTS 🏆" : "CONTINUE →"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}