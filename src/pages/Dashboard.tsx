import React from 'react';
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

export const Dashboard = () => {
  const { userProgress } = useProgress();

  // Mock user data or get from local storage if I added a profile context
  const userName = "Student"; 

  // Calculate Stats
  const xp = Math.round(userProgress.totalXP);
  
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
                <LayoutDashboard className="text-[#1CB0F6]" /> Active Quest
              </h2>
              {/* Show all courses as active for now since no enrollment logic */}
              <div className="space-y-4">
                {COURSES.map(course => {
                  // Calculate progress
                  const totalSkills = course.units.reduce((acc, u) => acc + u.skills.length, 0);
                  let completedInCourse = 0;
                  
                  // Check progress
                  course.units.forEach(u => {
                    u.skills.forEach(s => {
                      if (userProgress.progress[u.id]?.[s.id]?.completed) {
                        completedInCourse++;
                      }
                    });
                  });
                  
                  const progressPercent = totalSkills > 0 ? Math.round((completedInCourse / totalSkills) * 100) : 0;

                  return (
                    <div key={course.id} className="bg-white rounded-[32px] border-2 border-[#E5E5E5] p-8 shadow-sm group hover:border-[#1CB0F6] transition-colors">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-4 flex-1">
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-[#1CB0F6] font-black text-[10px] rounded-full uppercase">ENROLLED</span>
                            <span className="px-3 py-1 bg-gray-50 text-gray-400 font-black text-[10px] rounded-full uppercase">{course.level}</span>
                          </div>
                          <h3 className="text-2xl font-black text-[#4B4B4B]">{course.title}</h3>
                          <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                                <span>Overall Progress</span>
                                <span>{progressPercent}%</span>
                              </div>
                              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                className="h-full bg-[#58CC02]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                />
                              </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center">
                          <Link 
                            to={`/course/${course.id}`}
                            className="bg-[#1CB0F6] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-[0_6px_0_0_#1899D6] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                          >
                            CONTINUE <ChevronRight />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
