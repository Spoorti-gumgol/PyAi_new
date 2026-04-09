import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Trophy, 
  BookOpen, 
  Star, 
  Flame, 
  Calendar, 
  ChevronRight, 
  LayoutDashboard,
  CheckCircle2
} from 'lucide-react';
import { COURSES } from '../data/courseData';
import { useProgress } from '../context/ProgressContext';
import { supabase } from "../supabase";


export const Dashboard = () => {
  const { userProgress } = useProgress();

  // Mock user data or get from local storage if I added a profile context
  const userName = "Student"; 

  // Calculate Stats
  const xp = Math.round(userProgress.totalXP);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [userId, setUserId] = useState<string | null>(null);

  // Calculate total completed skills
  let completedSkillsCount = 0;
  let recentActivity: string[] = [];

  // Iterate over all units in progress
  Object.keys(userProgress.progress).forEach(unitId => {
    const unitProgress = userProgress.progress[unitId];
    Object.keys(unitProgress).forEach(lessonId => {
      const lesson = unitProgress[lessonId];
      if (lesson.completed) {
        completedSkillsCount++;
        recentActivity.push(lessonId);
      }
    });
  });

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    };

    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchAnalysis = async () => {
      try {
        const res = await fetch("http://localhost:8000/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id: userId,
            progress: userProgress
          })
        });

        const data = await res.json();
        setAnalysis(data);
      } catch (err) {
        console.error("Analysis fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [userId, userProgress]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-[#4B4B4B]">Welcome back, {userName}! 👋</h1>
            <p className="text-gray-500 font-medium">You've mastered {completedSkillsCount} skills so far. Ready for more?</p>
          </div>
          <div className="flex gap-4">
            <StatBadge icon={Flame} value={0} label="Streak" color="text-[#FF4B4B] bg-red-50" />
            <StatBadge icon={Star} value={xp} label="XP" color="text-[#FFC800] bg-yellow-50" />
            <StatBadge icon={Trophy} value={'N/A'} label="Last Eval" color="text-[#1CB0F6] bg-blue-50" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Main Progress Area */}
          <div className="lg:col-span-2 space-y-10">
            <section className="space-y-6">
              <h2 className="text-2xl font-black text-[#4B4B4B] flex items-center gap-2">
                🧠 AI Learning Analysis
              </h2>

              <div className="bg-white rounded-[32px] border-2 border-[#E5E5E5] p-8 shadow-sm">
                
                {loading ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center gap-3 py-10"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    <span className="text-4xl">🤖</span>
                    <p className="text-gray-500 font-semibold">
                      Your AI coach is thinking...
                    </p>
                  </motion.div>
                ) : analysis ? (
                  <div className="space-y-6">
                    
                    {/* 🧠 Summary Card */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 shadow-sm"
                    >
                      <h3 className="font-black text-lg text-blue-600 mb-2">🧠 Your Learning Story</h3>
                      <p className="text-gray-700 font-medium leading-relaxed">
                        {analysis.summary}
                      </p>
                    </motion.div>

                    {/* 💪 Strengths */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-green-50 border-2 border-green-100 rounded-2xl p-6"
                    >
                      <h3 className="font-black text-lg text-green-600 mb-3">💪 You’re Awesome At</h3>
                      <div className="space-y-2">
                        {analysis.strengths?.map((s: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm">
                            <span className="text-green-500 text-xl">⭐</span>
                            <p className="text-gray-700 font-medium">{s}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* ⚡ Weaknesses */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-red-50 border-2 border-red-100 rounded-2xl p-6"
                    >
                      <h3 className="font-black text-lg text-red-500 mb-3">⚡ Let’s Improve</h3>
                      <div className="space-y-2">
                        {analysis.weaknesses?.map((w: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm">
                            <span className="text-red-400 text-xl">🎯</span>
                            <p className="text-gray-700 font-medium">{w}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* 🚀 Next Steps */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-yellow-50 border-2 border-yellow-100 rounded-2xl p-6"
                    >
                      <h3 className="font-black text-lg text-yellow-600 mb-3">🚀 Your Next Mission</h3>
                      <div className="space-y-2">
                        {analysis.nextSteps?.map((n: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm">
                            <span className="text-yellow-500 text-xl">👉</span>
                            <p className="text-gray-700 font-medium">{n}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                  </div>
                ) : (
                  <p className="text-red-400">Failed to load analysis.</p>
                )}

              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-10">
            <section className="space-y-6">
              <h2 className="text-2xl font-black text-[#4B4B4B]">Stats</h2>
              <div className="bg-white rounded-[32px] border-2 border-[#E5E5E5] p-8 shadow-sm space-y-8">
                  <div className="flex items-center gap-4">
                    <Calendar className="text-gray-400" />
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Joined</p>
                      <p className="font-bold text-[#4B4B4B]">Feb 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Trophy className="text-[#FFC800]" />
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Mastery</p>
                      <p className="font-bold text-[#4B4B4B]">{completedSkillsCount} Skills</p>
                    </div>
                  </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-black text-[#4B4B4B]">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 3).map((id, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-[#E5E5E5]">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                          <CheckCircle2 size={20} className="text-[#58CC02]" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#4B4B4B]">Skill Mastered</p>
                          <p className="text-xs text-gray-400">ID: {id}</p>
                        </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 font-medium italic">No recent activity.</p>
                )}
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

const StatBadge = ({ icon: Icon, value, label, color }: any) => (
  <div className={`flex flex-col items-center px-4 py-3 rounded-2xl border-2 border-transparent hover:border-gray-200 transition-all ${color}`}>
    <Icon size={24} className="mb-1" />
    <span className="font-black text-lg">{value}</span>
    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
  </div>
);
