import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Topic } from "../types/course";
import { useProgress } from "../context/ProgressContext";

interface AdventurePathProps {
  topics: Topic[];
  unitId: string;
}

type LessonState = "untouched" | "visited" | "completed";

const STATE_COLORS: Record<LessonState, {
  bg: string; shadow: string; hex: string; label: string;
}> = {
  untouched: { bg: "bg-[#1CB0F6]", shadow: "shadow-[0_6px_0_0_#1899D6]", hex: "#1CB0F6", label: "Not started"  },
  visited:   { bg: "bg-[#FFC800]", shadow: "shadow-[0_6px_0_0_#CC9F00]", hex: "#FFC800", label: "In progress"  },
  completed: { bg: "bg-[#58CC02]", shadow: "shadow-[0_6px_0_0_#46A302]", hex: "#58CC02", label: "Completed ✓"  },
};

const AdventurePath: React.FC<AdventurePathProps> = ({ topics, unitId }) => {
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { userProgress } = useProgress();
  const visitedLessons = userProgress?.visitedLessons ?? new Set();
  const testedLessons  = userProgress?.testedLessons  ?? new Set();

  const getLessonState = (lessonId: string): LessonState => {
    if (testedLessons.has(lessonId))  return "completed";
    if (visitedLessons.has(lessonId)) return "visited";
    return "untouched";
  };

  const getTopicState = (topic: Topic): LessonState => {
    const states = topic.lessons.map((l) => getLessonState(l.id));
    if (states.length === 0) return "untouched";
    if (states.every((s) => s === "completed")) return "completed";
    if (states.some((s) => s !== "untouched"))  return "visited";
    return "untouched";
  };

  const getXOffset = (index: number) => {
    const pattern = [0, 120, 200, 120, 0, -120, -200, -120];
    return pattern[index % pattern.length];
  };

  const nodeIcons = ["⚔️", "🗡️", "🏹", "🛡️", "🔮", "🗺️", "🏆", "⚡"];

  const Connector = ({ color }: { color: string }) => (
    <div className="flex flex-col items-center my-1 z-0">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-1 h-4 rounded-full my-0.5 opacity-40"
          style={{ backgroundColor: color }} />
      ))}
    </div>
  );

  const Milestone = ({ index }: { index: number }) => {
    if (index === 0 || index % 3 !== 0) return null;
    return (
      <div className="relative flex items-center justify-center my-2">
        <div className="absolute w-72 h-0.5 bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />
        <div className="relative bg-[#FFC800] text-black text-xs font-black px-5 py-1.5 rounded-full shadow-[0_3px_0_0_#CC9F00] tracking-widest uppercase z-10">
          ✨ Checkpoint {Math.floor(index / 3)} ✨
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col items-center py-16 select-none">

      {/* Decorative background dots */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(18)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-10"
            style={{
              width:      `${8 + (i % 5) * 6}px`,
              height:     `${8 + (i % 5) * 6}px`,
              background: ["#58CC02", "#1CB0F6", "#FF9600", "#FF4B4B", "#CE82FF"][i % 5],
              top:        `${(i * 137) % 100}%`,
              left:       `${(i * 97 + 13) % 90 + 5}%`,
            }}
          />
        ))}
      </div>

      {/* Start Banner */}
      <div className="mb-10 flex flex-col items-center gap-2">
        <div className="text-4xl">🏕️</div>
        <div className="bg-[#58CC02] text-white font-black text-sm px-6 py-2 rounded-full shadow-[0_4px_0_0_#46A302] tracking-widest uppercase">
          Begin Your Quest
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mb-8 flex-wrap justify-center">
        {(Object.entries(STATE_COLORS) as [LessonState, typeof STATE_COLORS[LessonState]][]).map(([state, c]) => (
          <div key={state} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
            <span className="text-xs font-bold text-gray-500">{c.label}</span>
          </div>
        ))}
      </div>

      {/* Topic Nodes */}
      {topics.map((topic, index) => {
        const xOffset    = getXOffset(index);
        const icon       = nodeIcons[index % nodeIcons.length];
        const isOpen     = openTopicId === topic.id;
        const topicState = getTopicState(topic);
        const color      = STATE_COLORS[topicState];

        return (
          <div key={topic.id} className="flex flex-col items-center z-10">
            <Milestone index={index} />
            {index > 0 && <Connector color={color.hex} />}

            <div className="flex flex-col items-center"
              style={{ transform: `translateX(${xOffset}px)` }}>

              {/* Topic Bubble */}
              <button
                onClick={() => setOpenTopicId(prev => prev === topic.id ? null : topic.id)}
                className={`
                  relative w-24 h-24 rounded-full ${color.bg} ${color.shadow}
                  text-white flex flex-col items-center justify-center
                  font-black text-2xl cursor-pointer
                  transition-all duration-200 active:translate-y-1 active:shadow-none
                  ring-4 ring-white outline-none hover:brightness-105
                `}
                aria-label={`Open topic: ${topic.name}`}
              >
                <span className="text-2xl leading-none">{icon}</span>
                <span className="text-xs font-black mt-0.5 opacity-80">{index + 1}</span>

                {/* Completed star badge */}
                {topicState === "completed" && (
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#FFC800] rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white">
                    ⭐
                  </div>
                )}
              </button>

              {/* ── Topic Name Label ── */}
              <div className="mt-3 bg-white px-4 py-1.5 rounded-2xl shadow-md border-2 border-gray-100 text-xs font-black text-gray-600 text-center max-w-[160px] leading-snug">
                {topic.name}
              </div>

              {/* Lessons Popup */}
              {isOpen && (
                <div
                  className="mt-4 bg-white rounded-3xl border-2 border-gray-100 shadow-2xl w-72 overflow-hidden"
                  style={{ animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}
                >
                  {/* Popup header */}
                  <div className={`${color.bg} px-5 py-3 flex items-center gap-2`}>
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="text-white font-black text-sm leading-tight">{topic.name}</p>
                      <p className="text-white/70 text-xs font-semibold">
                        {topic.lessons.length} lesson{topic.lessons.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Lessons list */}
                  <div className="p-4 space-y-3">
                    {topic.lessons.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-3xl mb-1">🔒</div>
                        <p className="text-gray-400 text-xs font-bold">No lessons yet</p>
                      </div>
                    ) : (
                      topic.lessons.map((lesson: any, li: number) => {
                        const lState = getLessonState(lesson.id);
                        const lColor = STATE_COLORS[lState];
                        return (
                          <div key={lesson.id}
                            className="flex items-start gap-3 p-3 rounded-2xl border-2 border-gray-100 hover:border-[#1CB0F6] transition-colors bg-white"
                          >
                            {/* Lesson state indicator */}
                            <div
                              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                              style={{ backgroundColor: lColor.hex }}
                            >
                              {lState === "completed" ? "✓" : li + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm text-[#4B4B4B] leading-tight truncate">
                                {lesson.title}
                              </p>
                              {lesson.description && (
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-snug">
                                  {lesson.description}
                                </p>
                              )}
                              <p className="text-xs font-bold mt-1" style={{ color: lColor.hex }}>
                                {lColor.label}
                              </p>
                              <Link
                                to={`/lesson/${lesson.id}`}
                                className="inline-flex items-center gap-1 mt-2 px-3 py-1 text-xs font-black text-white rounded-xl shadow-[0_3px_0_0_rgba(0,0,0,0.15)] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition-all"
                                style={{ backgroundColor: lColor.hex }}
                              >
                                {lState === "completed" ? "REDO 🔄" : lState === "visited" ? "CONTINUE 🚀" : "START 🚀"}
                              </Link>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Finish Banner + Assessment Button */}
      <div className="mt-10 flex flex-col items-center gap-4">
        <Connector color="#FFC800" />

        <div className="text-5xl mt-2">🏆</div>
        <div className="bg-[#FFC800] text-black font-black text-sm px-6 py-2 rounded-full shadow-[0_4px_0_0_#CC9F00] tracking-widest uppercase mt-1">
          Quest Complete!
        </div>

        {/* Take Assessment */}
        <button
          onClick={() => {
            if (!unitId) { alert("Unit not selected"); return; }
            navigate(`/adaptive-test/${unitId}`);
          }}
          className="mt-2 flex items-center gap-3 bg-[#FF9600] text-black font-black text-lg px-10 py-5 rounded-3xl shadow-[0_6px_0_0_#CC7A00] active:translate-y-1 active:shadow-none transition-all hover:brightness-105"
          style={{ animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }}
        >
          <span className="text-2xl">📋</span>
          TAKE ASSESSMENT
          <span className="text-2xl">⚡</span>
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(-8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdventurePath;