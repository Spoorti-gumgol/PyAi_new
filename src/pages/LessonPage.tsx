import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";
import { X, AlertCircle, BookOpen, ArrowRight } from "lucide-react";
import { useProgress } from "../context/ProgressContext";

type Lesson = {
  id: string;
  title: string;
  content: string;
  test_id: string | null;
};

type PageState = "loading" | "error" | "ready";

export const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate     = useNavigate();

  // ── Progress context ─────────────────────────────────
  const { markLessonVisited } = useProgress();

  const [lesson,    setLesson]    = useState<Lesson | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) {
        setErrorMsg("No lesson ID found.");
        setPageState("error");
        return;
      }

      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, content, test_id")
        .eq("id", lessonId)
        .limit(1);

      if (error) {
        setErrorMsg(error.message);
        setPageState("error");
        return;
      }

      if (!data || data.length === 0) {
        setErrorMsg("Lesson not found.");
        setPageState("error");
        return;
      }

      setLesson(data[0] as Lesson);
      setPageState("ready");

      // ✅ Mark this lesson as visited as soon as it loads
      if (typeof markLessonVisited === "function") {
        markLessonVisited(lessonId);
      }
    };

    fetchLesson();
  }, [lessonId]);

  // ── Loading ──────────────────────────────────────────
  if (pageState === "loading") return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="text-6xl animate-bounce">📖</div>
        <div className="w-12 h-12 border-4 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-gray-400 text-xl">Loading lesson...</p>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────
  if (pageState === "error" || !lesson) return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle size={52} className="text-red-400" />
        <p className="font-black text-red-400 text-xl">{errorMsg ?? "Something went wrong."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  // ── Ready ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">

      {/* ── Header ── */}
      <div className="bg-white border-b-2 border-gray-100 px-6 py-5 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-300 hover:text-gray-500 transition flex-shrink-0"
        >
          <X size={28} />
        </button>

        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
          <div className="h-full w-1/2 bg-[#58CC02] rounded-full" />
        </div>

        <div className="flex items-center gap-1 bg-[#FFF9E6] px-3 py-1.5 rounded-full border-2 border-[#FFC800] flex-shrink-0">
          <span className="text-sm">⚡</span>
          <span className="font-black text-[#CC9F00] text-sm">XP</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-6">

        {/* Mascot + title card */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm p-6 flex items-start gap-4">
          <div className="text-5xl flex-shrink-0">🦉</div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-[#1CB0F6]" />
              <span className="text-xs font-black text-[#1CB0F6] uppercase tracking-widest">
                Lesson
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#4B4B4B] leading-snug">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Main content block */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm p-6">
          <p className="text-gray-600 whitespace-pre-line leading-relaxed text-lg font-medium">
            {lesson.content}
          </p>
        </div>

        {/* Fun tip box */}
        <div className="bg-[#DDF4FF] rounded-3xl border-2 border-[#1CB0F6] p-5 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <p className="text-[#0077b6] font-bold text-sm leading-relaxed">
            Read carefully before starting the test. You got this, adventurer! 🚀
          </p>
        </div>

        {/* Start Test CTA */}
        {lesson.test_id ? (
          <Link to={`/test/${lesson.test_id}`} className="mt-2">
            <button className="w-full py-5 bg-[#58CC02] text-white font-black text-xl rounded-3xl shadow-[0_6px_0_0_#46A302] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3">
              START TEST
              <ArrowRight size={24} />
            </button>
          </Link>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="w-full py-5 bg-[#1CB0F6] text-white font-black text-xl rounded-3xl shadow-[0_6px_0_0_#1899D6] active:translate-y-1 active:shadow-none transition-all"
          >
            BACK TO PATH 🗺️
          </button>
        )}

      </div>
    </div>
  );
};