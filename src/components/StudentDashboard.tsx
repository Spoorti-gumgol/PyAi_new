import React from 'react';
import { 
  Flame, 
  Trophy, 
  Star, 
  Settings, 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  MessageCircle,
  Home,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Badge, ProgressBar, AIMentor, Button } from './SharedUI';
import { motion } from 'motion/react';

interface StudentDashboardProps {
  onStartLesson: () => void;
}

export const StudentDashboard = ({ onStartLesson }: StudentDashboardProps) => {
  const units = [
    { 
      title: "Unit 1: The Basics of Command", 
      desc: "Learn how to give instructions to your robot friend!",
      color: "#58CC02",
      lessons: [
        { id: 1, type: 'start', status: 'completed', icon: Home },
        { id: 2, type: 'lesson', status: 'completed', icon: BookOpen },
        { id: 3, type: 'quiz', status: 'current', icon: Star },
        { id: 4, type: 'lesson', status: 'locked', icon: BookOpen },
        { id: 5, type: 'test', status: 'locked', icon: Trophy },
      ]
    },
    { 
      title: "Unit 2: Loopy Logic", 
      desc: "Doing things over and over again with style!",
      color: "#1CB0F6",
      lessons: [
        { id: 6, type: 'lesson', status: 'locked', icon: BookOpen },
        { id: 7, type: 'lesson', status: 'locked', icon: BookOpen },
        { id: 8, type: 'quiz', status: 'locked', icon: Star },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r-2 border-[#E5E5E5] p-6 hidden lg:flex flex-col">
        <h1 className="text-2xl font-black text-[#58CC02] mb-10 px-2">CodeQuest</h1>
        <nav className="flex-1 space-y-2">
          <SidebarItem icon={Home} label="Learn" active />
          <SidebarItem icon={Trophy} label="Leaderboard" />
          <SidebarItem icon={Users} label="Friends" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-10 bg-white border-b-2 border-[#E5E5E5] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Badge icon={Flame} color="accent">14 DAY STREAK</Badge>
            <Badge icon={Star} color="primary">450 XP</Badge>
            <Badge icon={Trophy} color="secondary">LEVEL 4</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-[#4B4B4B] hidden sm:inline">SuperCoder Sarah</span>
            <div className="w-10 h-10 rounded-full bg-[#E5E5E5] overflow-hidden border-2 border-[#E5E5E5]">
               <img src="https://images.unsplash.com/photo-1710020494165-4c4bb6b4c7fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMGF2YXRhciUyMGlsbHVzdHJhdGlvbiUyMDNkfGVufDF8fHx8MTc3MDgxNDMxMXww" alt="Profile" />
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
          {units.map((unit, idx) => (
            <div key={idx} className="space-y-8">
              {/* Unit Header Card */}
              <div 
                className="rounded-3xl p-8 text-white shadow-lg relative overflow-hidden"
                style={{ backgroundColor: unit.color }}
              >
                <div className="relative z-10 flex justify-between items-center">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase tracking-tight">{unit.title}</h2>
                    <p className="opacity-90 font-medium text-lg">{unit.desc}</p>
                  </div>
                  <Button variant="outline" className="bg-white/20 border-white/40 text-white shadow-none hover:bg-white/30">
                    GUIDEBOOK
                  </Button>
                </div>
                {/* Abstract shape decoration */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              </div>

              {/* Lesson Path Nodes */}
              <div className="flex flex-col items-center gap-6 py-4">
                {unit.lessons.map((lesson, lIdx) => (
                  <LessonNode 
                    key={lIdx} 
                    {...lesson} 
                    color={unit.color} 
                    offset={lIdx % 2 === 0 ? 0 : (lIdx % 4 === 1 ? 40 : -40)}
                    onClick={lesson.status === 'current' || lesson.status === 'completed' ? onStartLesson : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Persistent AI Mentor (Floating) */}
      <div className="fixed bottom-8 right-8 z-20 flex flex-col items-end gap-4 max-w-sm pointer-events-none">
        <div className="pointer-events-auto">
          <AIMentor message="Great job, Sarah! You're only 2 lessons away from your next badge. Ready to keep going?" />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E5E5E5] flex justify-around p-3 z-30">
        <Home className="text-[#58CC02]" size={28} />
        <Trophy className="text-[#777777]" size={28} />
        <Users className="text-[#777777]" size={28} />
        <Settings className="text-[#777777]" size={28} />
      </nav>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-lg cursor-pointer transition-all ${active ? 'bg-[#DDF4FF] text-[#1CB0F6] border-2 border-[#1CB0F6]' : 'text-[#777777] hover:bg-[#F7F7F7]'}`}>
    <Icon size={24} />
    {label}
  </div>
);

const LessonNode = ({ status, icon: Icon, color, offset, onClick }: any) => {
  const statusStyles = {
    completed: { bg: color, border: '#0000001A', icon: CheckCircle2, shadow: '#00000026' },
    current: { bg: color, border: '#0000001A', icon: Icon, shadow: '#00000026' },
    locked: { bg: '#E5E5E5', border: '#D0D0D0', icon: Lock, shadow: 'transparent' },
  };

  const currentStatus = statusStyles[status as keyof typeof statusStyles];

  return (
    <motion.button
      whileHover={status !== 'locked' ? { scale: 1.1 } : {}}
      whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
      onClick={onClick}
      className="relative group outline-none"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {status === 'current' && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-xl border-2 border-[#E5E5E5] shadow-sm whitespace-nowrap z-10">
          <span className="font-black text-[#58CC02] text-xs uppercase tracking-wider">Start!</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-[#E5E5E5] rotate-45" />
        </div>
      )}
      
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center border-b-4 transition-all"
        style={{ 
          backgroundColor: currentStatus.bg, 
          borderColor: currentStatus.shadow,
        }}
      >
        <currentStatus.icon className="text-white w-8 h-8" />
      </div>
      
      {status === 'current' && (
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-full border-4 border-[#58CC02] opacity-50"
        />
      )}
    </motion.button>
  );
};
