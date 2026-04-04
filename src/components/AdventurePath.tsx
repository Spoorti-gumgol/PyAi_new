import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Topic } from "../types/course";

interface AdventurePathProps {
  topics: Topic[];
}

const AdventurePath: React.FC<AdventurePathProps> = ({ topics }) => {
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);

  // Duolingo-style zigzag: alternates left/right columns
  const getXOffset = (index: number) => {
    const pattern = [0, 120, 200, 120, 0, -120, -200, -120];
    return pattern[index % pattern.length];
  };

  // Color palette cycling for topic nodes
  const nodeColors = [
    { bg: "bg-[#58CC02]", shadow: "shadow-[0_6px_0_0_#46A302]", ring: "ring-[#58CC02]" },
    { bg: "bg-[#1CB0F6]", shadow: "shadow-[0_6px_0_0_#1899D6]", ring: "ring-[#1CB0F6]" },
    { bg: "bg-[#FF9600]", shadow: "shadow-[0_6px_0_0_#CC7A00]", ring: "ring-[#FF9600]" },
    { bg: "bg-[#FF4B4B]", shadow: "shadow-[0_6px_0_0_#CC3C3C]", ring: "ring-[#FF4B4B]" },
    { bg: "bg-[#CE82FF]", shadow: "shadow-[0_6px_0_0_#A567CC]", ring: "ring-[#CE82FF]" },
  ];

  // Adventure-themed icons per topic slot
  const nodeIcons = ["⚔️", "🗡️", "🏹", "🛡️", "🔮", "🗺️", "🏆", "⚡"];

  // Dashed connector line between nodes
  const Connector = ({ color }: { color: string }) => (
    <div className="flex flex-col items-center my-1 z-0">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`w-1 h-4 rounded-full my-0.5 opacity-40`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );

  // Milestone banner every 3 topics
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

  const nodeColorsList = ["#58CC02", "#1CB0F6", "#FF9600", "#FF4B4B", "#CE82FF"];

  return (
    <div className="relative flex flex-col items-center py-16 select-none">

      {/* ── Decorative background dots ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${8 + (i % 5) * 6}px`,
              height: `${8 + (i % 5) * 6}px`,
              background: nodeColorsList[i % nodeColorsList.length],
              top: `${(i * 137) % 100}%`,
              left: `${(i * 97 + 13) % 90 + 5}%`,
            }}
          />
        ))}
      </div>

      {/* ── Start Banner ── */}
      <div className="mb-10 flex flex-col items-center gap-2">
        <div className="text-4xl">🏕️</div>
        <div className="bg-[#58CC02] text-white font-black text-sm px-6 py-2 rounded-full shadow-[0_4px_0_0_#46A302] tracking-widest uppercase">
          Begin Your Quest
        </div>
      </div>

      {/* ── Topic Nodes ── */}
      {topics.map((topic, index) => {
        const xOffset = getXOffset(index);
        const color = nodeColors[index % nodeColors.length];
        const icon = nodeIcons[index % nodeIcons.length];
        const isOpen = openTopicId === topic.id;
        const hexColor = nodeColorsList[index % nodeColorsList.length];
        const completedLessons = 0; // wire up real progress later

        return (
          <div key={topic.id} className="flex flex-col items-center z-10">

            {/* Milestone checkpoint */}
            <Milestone index={index} />

            {/* Connector from previous node */}
            {index > 0 && <Connector color={hexColor} />}

            {/* Node + Popup wrapper */}
            <div
              className="flex flex-col items-center"
              style={{ transform: `translateX(${xOffset}px)` }}
            >
              {/* ── Topic Bubble ── */}
              <button
                onClick={() =>
                  setOpenTopicId((prev) => (prev === topic.id ? null : topic.id))
                }
                className={`
                  relative w-24 h-24 rounded-full ${color.bg} ${color.shadow}
                  text-white flex flex-col items-center justify-center
                  font-black text-2xl cursor-pointer
                  transition-all duration-200 active:translate-y-1 active:shadow-none
                  ring-4 ring-white outline-none
                  hover:brightness-105
                `}
                aria-label={`Open topic: ${topic.name}`}
              >
                <span className="text-2xl leading-none">{icon}</span>
                <span className="text-xs font-black mt-0.5 opacity-80">{index + 1}</span>

                {/* Completed badge */}
                {completedLessons === topic.lessons.length && topic.lessons.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#FFC800] rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white">
                    ⭐
                  </div>
                )}
              </button>

              {/* ── Topic Name Label ── */}
              <div className="mt-3 bg-white px-4 py-1.5 rounded-2xl shadow-md border-2 border-gray-100 text-xs font-black text-gray-600 text-center max-w-[160px] leading-snug">
                {topic.name}
              </div>

              {/* ── Lessons Popup ── */}
              {isOpen && (
                <div
                  className="mt-4 bg-white rounded-3xl border-2 border-gray-100 shadow-2xl w-72 overflow-hidden"
                  style={{
                    animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
                  }}
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
                      topic.lessons.map((lesson, li) => (
                        <div
                          key={lesson.id}
                          className="flex items-start gap-3 p-3 rounded-2xl border-2 border-gray-100 hover:border-[#1CB0F6] transition-colors group bg-white"
                        >
                          {/* Lesson number badge */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#DDF4FF] flex items-center justify-center text-xs font-black text-gray-500 group-hover:text-[#1CB0F6] transition-colors">
                            {li + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-[#4B4B4B] leading-tight truncate">
                              {lesson.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-snug">
                              {lesson.description}
                            </p>

                            <Link
                              to={`/lesson/${lesson.id}`}
                              className="inline-flex items-center gap-1 mt-2 px-3 py-1 text-xs font-black text-white bg-[#1CB0F6] rounded-xl shadow-[0_3px_0_0_#1899D6] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition-all"
                            >
                              START 🚀
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ── Finish Banner ── */}
      <div className="mt-10 flex flex-col items-center gap-2">
        <Connector color="#FFC800" />
        <div className="text-5xl mt-2">🏆</div>
        <div className="bg-[#FFC800] text-black font-black text-sm px-6 py-2 rounded-full shadow-[0_4px_0_0_#CC9F00] tracking-widest uppercase mt-1">
          Quest Complete!
        </div>
      </div>

      {/* ── Pop-in keyframe ── */}
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
