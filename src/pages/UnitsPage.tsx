import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { ChevronLeft, ChevronDown, Star, Lock } from "lucide-react";
import AdventurePath from "../components/AdventurePath";
import { fetchTopicsWithLessons } from "../utils/FetchCourseData";
import { Topic } from "../types/course";

type Unit = {
  id: string;
  course_id: string;
  name: string;
  order_index: number;
};

const UNIT_THEMES = [
  { bg: "bg-[#58CC02]", shadow: "shadow-[0_6px_0_0_#46A302]", light: "bg-[#e9ffd4]", border: "border-[#58CC02]", text: "text-[#2d7a00]", icon: "🌱" },
  { bg: "bg-[#1CB0F6]", shadow: "shadow-[0_6px_0_0_#1899D6]", light: "bg-[#ddf4ff]", border: "border-[#1CB0F6]", text: "text-[#0077b6]", icon: "⚡" },
  { bg: "bg-[#FF9600]", shadow: "shadow-[0_6px_0_0_#CC7A00]", light: "bg-[#fff4e0]", border: "border-[#FF9600]", text: "text-[#a35f00]", icon: "🔥" },
  { bg: "bg-[#FF4B4B]", shadow: "shadow-[0_6px_0_0_#CC3C3C]", light: "bg-[#ffe8e8]", border: "border-[#FF4B4B]", text: "text-[#8b0000]", icon: "🚀" },
  { bg: "bg-[#CE82FF]", shadow: "shadow-[0_6px_0_0_#A567CC]", light: "bg-[#f5e8ff]", border: "border-[#CE82FF]", text: "text-[#6a00cc]", icon: "🌟" },
  { bg: "bg-[#FFC800]", shadow: "shadow-[0_6px_0_0_#CC9F00]", light: "bg-[#fffbe0]", border: "border-[#FFC800]", text: "text-[#7a5c00]", icon: "🏆" },
];

const FloatingStars = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="absolute animate-bounce opacity-10 text-yellow-400"
        style={{
          left: `${(i * 91 + 5) % 92}%`, top: `${(i * 73 + 9) % 88}%`,
          fontSize: `${14 + (i % 3) * 10}px`,
          animationDelay: `${i * 0.35}s`, animationDuration: `${2.5 + (i % 3) * 0.5}s`,
        }}
      >
        {["⭐", "✨", "💫"][i % 3]}
      </div>
    ))}
  </div>
);

export default function UnitsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate     = useNavigate();

  const [units,          setUnits]          = useState<Unit[]>([]);
  const [loading,        setLoading]        = useState(true);

  // ── Adventure path state ──
  const [selectedUnit,   setSelectedUnit]   = useState<Unit | null>(null);
  const [topics,         setTopics]         = useState<Topic[]>([]);
  const [topicsLoading,  setTopicsLoading]  = useState(false);

  // Fetch units
  useEffect(() => {
    if (!courseId) return;
    const fetchUnits = async () => {
      const { data, error } = await supabase
        .from("units").select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });
      if (!error) setUnits(data || []);
      setLoading(false);
    };
    fetchUnits();
  }, [courseId]);

  // Fetch topics+lessons when a unit is selected
  const handleUnitClick = async (unit: Unit) => {
    // clicking same unit again collapses it
    if (selectedUnit?.id === unit.id) {
      setSelectedUnit(null);
      setTopics([]);
      return;
    }

    setSelectedUnit(unit);
    setTopics([]);
    setTopicsLoading(true);

    try {
      const data = await fetchTopicsWithLessons(unit.id);
      setTopics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTopicsLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="text-6xl animate-bounce">🦉</div>
        <div className="w-12 h-12 border-4 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
        <p className="font-black text-gray-400 text-xl">Loading your adventure...</p>
      </div>
    </div>
  );

  // ── Empty ────────────────────────────────────────────
  if (units.length === 0) return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-6xl">🏗️</div>
        <p className="font-black text-gray-500 text-2xl">No units yet!</p>
        <button onClick={() => navigate(-1)}
          className="mt-2 px-8 py-4 bg-[#1CB0F6] text-white font-black rounded-2xl shadow-[0_4px_0_0_#1899D6] active:translate-y-1 active:shadow-none transition-all">
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-20">
      <FloatingStars />

      {/* ── Header ── */}
      <div className="relative z-10 bg-white border-b-2 border-gray-100 px-6 py-5 flex items-center gap-4 sticky top-0">
        <button onClick={() => {
          // if a unit is open, collapse it first; otherwise go back
          if (selectedUnit) { setSelectedUnit(null); setTopics([]); }
          else navigate(-1);
        }} className="text-gray-300 hover:text-gray-500 transition">
          <ChevronLeft size={32} />
        </button>
        <div>
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Your Course</p>
          <h1 className="text-2xl font-black text-[#4B4B4B]">
            {selectedUnit ? selectedUnit.name : "Choose a Unit"}
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-1 bg-[#FFF9E6] px-4 py-2 rounded-full border-2 border-[#FFC800]">
          <Star size={16} className="text-[#FFC800]" fill="#FFC800" />
          <span className="font-black text-[#CC9F00] text-sm">{units.length} Units</span>
        </div>
      </div>

      {/* ── ADVENTURE PATH (shown when a unit is selected) ── */}
      {selectedUnit && (
        <div style={{ animation: "slideDown 0.3s ease both" }}>
          {topicsLoading ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="text-5xl animate-bounce">🗺️</div>
              <div className="w-10 h-10 border-4 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
              <p className="font-black text-gray-400">Loading path...</p>
            </div>
          ) : topics.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20">
              <div className="text-5xl">🏗️</div>
              <p className="font-black text-gray-400 text-lg">No topics yet for this unit.</p>
            </div>
          ) : (
            <AdventurePath topics={topics} />
          )}
        </div>
      )}

      {/* ── UNITS LIST (always visible below) ── */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 mt-8 flex flex-col gap-5">

        {!selectedUnit && (
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="text-5xl">🦉</div>
            <div>
              <p className="font-black text-[#4B4B4B] text-lg leading-tight">Pick a unit to begin!</p>
              <p className="text-gray-400 font-bold text-sm mt-1">Tap any unit to explore its path 🗺️</p>
            </div>
          </div>
        )}

        {units.map((unit, i) => {
          const theme     = UNIT_THEMES[i % UNIT_THEMES.length];
          const isOpen    = selectedUnit?.id === unit.id;
          const isFirst   = i === 0;

          return (
            <div key={unit.id} style={{ animation: `popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s both` }}>
              <button
                onClick={() => handleUnitClick(unit)}
                className={`w-full bg-white rounded-3xl border-2 ${isOpen ? theme.border : "border-gray-200"}
                  shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden text-left`}
              >
                {/* Coloured top strip */}
                <div className={`${theme.bg} px-6 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{theme.icon}</span>
                    <span className="text-white font-black text-xs uppercase tracking-widest opacity-80">
                      Unit {unit.order_index}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isFirst && !isOpen && (
                      <span className="bg-white/30 text-white font-black text-xs px-3 py-1 rounded-full">
                        START HERE ✨
                      </span>
                    )}
                    {/* Chevron toggle */}
                    <div className="bg-white/20 rounded-full p-1">
                      <ChevronDown
                        size={18}
                        className={`text-white transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className={`${isOpen ? theme.light : "bg-white"} px-6 py-5 flex items-center justify-between gap-4 transition-colors`}>
                  <div className="flex-1">
                    <h2 className={`font-black text-xl ${isOpen ? theme.text : "text-[#4B4B4B]"} leading-snug`}>
                      {unit.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} size={14}
                          className={s === 0 ? "text-[#FFC800]" : "text-gray-200"}
                          fill={s === 0 ? "#FFC800" : "#e5e7eb"} />
                      ))}
                      <span className="text-xs font-bold text-gray-400 ml-1">0 / 5 stars</span>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${theme.bg} ${theme.shadow}
                    flex items-center justify-center text-white text-2xl font-black
                    active:translate-y-1 active:shadow-none transition-all`}>
                    {isOpen ? "▲" : "→"}
                  </div>
                </div>
              </button>
            </div>
          );
        })}

        {/* Locked teaser */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden opacity-50">
          <div className="bg-gray-300 px-6 py-3 flex items-center gap-2">
            <Lock size={16} className="text-white" />
            <span className="text-white font-black text-xs uppercase tracking-widest">Locked</span>
          </div>
          <div className="bg-gray-50 px-6 py-5 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-black text-gray-400 text-lg">More units coming soon...</p>
              <p className="text-xs text-gray-300 font-bold mt-1">Complete above units to unlock 🔒</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center text-2xl">🔒</div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}