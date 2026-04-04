import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { X, CheckCircle, XCircle, Star, Zap } from "lucide-react";

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
  mcq_options: Option[];
  coding_test_cases: CodingTestCase[];
};

// Fun mascot messages
const CORRECT_MESSAGES = ["Amazing! 🎉", "You rock! ⭐", "Superstar! 🌟", "Brilliant! 🧠", "Nailed it! 🎯"];
const WRONG_MESSAGES  = ["Almost! 💪", "Keep going! 🔥", "You got this! 🚀", "Try harder! 😤", "So close! 🌈"];

const randomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];


// Animated floating stars background
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

export default function TestPage() {
  const { testId }  = useParams<{ testId: string }>();
  const navigate    = useNavigate();

  const [questions,       setQuestions]       = useState<Question[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [currentIndex,    setCurrentIndex]    = useState(0);
  const [selectedOption,  setSelectedOption]  = useState<Option | null>(null);
  const [score,           setScore]           = useState(0);
  const [finished,        setFinished]        = useState(false);
  const [mascotMessage,   setMascotMessage]   = useState<string | null>(null);
  const [streakCount,     setStreakCount]      = useState(0);
  const [userCode, setUserCode] = useState("");

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

      if (error) { console.error(error); setLoading(false); return; }
      setQuestions(data as Question[] || []);
      setLoading(false);
    };
    fetchQuestions();
  }, [testId]);

  const currentQuestion = questions[currentIndex];
  const progress        = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

  const handleSelect = (opt: Option) => {
    if (selectedOption) return;
    setSelectedOption(opt);
    if (opt.is_correct) {
      setScore(s => s + 1);
      setStreakCount(s => s + 1);
      setMascotMessage(randomFrom(CORRECT_MESSAGES));
    } else {
      setStreakCount(0);
      setMascotMessage(randomFrom(WRONG_MESSAGES));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setMascotMessage(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setStreakCount(0);
    setFinished(false);
    setMascotMessage(null);
  };

  // ── Option button style ──────────────────────────────
  const optionStyle = (opt: Option) => {
    const base = "w-full px-5 py-4 rounded-3xl font-black text-left transition-all duration-200 flex items-center justify-between gap-3 border-b-4 text-lg active:translate-y-1 active:border-b-0";
    if (!selectedOption) {
      return `${base} bg-white border-gray-200 border-2 border-b-gray-300 text-gray-700 hover:border-[#1CB0F6] hover:bg-[#f0faff] hover:scale-[1.02]`;
    }
    if (opt.is_correct) {
      return `${base} bg-[#d7ffb8] border-[#58CC02] border-2 border-b-[#3fa000] text-[#2a6e00]`;
    }
    if (selectedOption.id === opt.id && !opt.is_correct) {
      return `${base} bg-[#ffdfe0] border-[#FF4B4B] border-2 border-b-[#cc0000] text-[#8b0000]`;
    }
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

    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-6">
        <FloatingStars />

        <div className="relative z-10 bg-white rounded-[40px] border-2 border-gray-100 shadow-2xl p-10 max-w-sm w-full flex flex-col items-center gap-6 text-center">

          {/* Trophy */}
          <div className="text-8xl animate-bounce">
            {isPerfect ? "🏆" : isGood ? "🌟" : "💪"}
          </div>

          <h1 className="text-4xl font-black text-[#4B4B4B]">
            {isPerfect ? "PERFECT!" : isGood ? "Well Done!" : "Keep Going!"}
          </h1>

          <p className="text-gray-400 font-bold text-lg">
            {isPerfect
              ? "You got every single one right!"
              : isGood
              ? "You're doing great, adventurer!"
              : "Practice makes perfect! Try again!"}
          </p>

          {/* Score ring */}
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f0" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="42" fill="none"
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

          {/* XP earned */}
          <div className="flex items-center gap-2 bg-[#FFF9E6] px-6 py-3 rounded-2xl border-2 border-[#FFC800]">
            <Zap size={20} className="text-[#FFC800]" />
            <span className="font-black text-[#CC9F00] text-lg">+{score * 10} XP earned!</span>
          </div>

          <div className="flex gap-3 w-full pt-2">
            <button onClick={() => navigate(-1)}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition text-base">
              Exit
            </button>
            <button onClick={handleRestart}
              className="flex-1 py-4 bg-[#58CC02] text-white font-black rounded-2xl shadow-[0_4px_0_0_#46A302] active:translate-y-1 active:shadow-none transition-all text-base">
              Try Again 🔄
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── Question screen ──────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <FloatingStars />

      {/* ── Header bar ── */}
      <div className="relative z-10 bg-white border-b-2 border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-gray-500 transition flex-shrink-0">
          <X size={28} />
        </button>

        {/* Progress bar */}
        <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
          <div
            className="h-full bg-[#58CC02] rounded-full transition-all duration-700 relative overflow-hidden"
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

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* Question counter */}
        <div className="flex items-center gap-2">
          <Star size={16} className="text-[#FFC800]" fill="#FFC800" />
          <span className="font-black text-gray-400 text-sm uppercase tracking-widest">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Mascot + Question card */}
        <div className="bg-white rounded-[32px] border-2 border-gray-100 shadow-md p-8 space-y-2">
          <div className="flex items-start gap-4">
            {/* Owl mascot */}
            <div className="text-5xl flex-shrink-0 mt-1">🦉</div>
            <div>
              <p className="text-xs font-black text-[#1CB0F6] uppercase tracking-widest mb-2">
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
            <button
              key={opt.id}
              onClick={() => handleSelect(opt)}
              disabled={!!selectedOption}
              className={optionStyle(opt)}
            >
              <span>{opt.option_text}</span>
              {selectedOption && opt.is_correct && (
                <CheckCircle size={24} className="text-[#58CC02] flex-shrink-0" />
              )}
              {selectedOption && selectedOption.id === opt.id && !opt.is_correct && (
                <XCircle size={24} className="text-[#FF4B4B] flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Feedback panel */}
        {selectedOption && (
          <div
            className={`rounded-3xl p-6 border-2 space-y-4 ${
              selectedOption.is_correct
                ? "bg-[#d7ffb8] border-[#58CC02]"
                : "bg-[#ffdfe0] border-[#FF4B4B]"
            }`}
            style={{ animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {selectedOption.is_correct ? "🎉" : "😅"}
              </span>
              <div>
                <p className={`font-black text-lg ${selectedOption.is_correct ? "text-[#2a6e00]" : "text-[#8b0000]"}`}>
                  {mascotMessage}
                </p>
                {streakCount >= 2 && selectedOption.is_correct && (
                  <p className="text-[#FF9600] font-bold text-sm">
                    🔥 {streakCount} in a row!
                  </p>
                )}
              </div>
            </div>

            {selectedOption.explanation && (
              <p className={`text-sm font-bold leading-relaxed ${selectedOption.is_correct ? "text-[#3a8a00]" : "text-[#8b0000]"}`}>
                {selectedOption.explanation}
              </p>
            )}

            <button
              onClick={handleNext}
              className={`w-full py-4 text-white font-black text-lg rounded-2xl transition-all active:translate-y-1 active:shadow-none ${
                selectedOption.is_correct
                  ? "bg-[#58CC02] shadow-[0_4px_0_0_#46A302]"
                  : "bg-[#FF4B4B] shadow-[0_4px_0_0_#cc0000]"
              }`}
            >
              {currentIndex + 1 >= questions.length ? "SEE RESULTS 🏆" : "CONTINUE →"}
            </button>
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