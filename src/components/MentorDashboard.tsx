import React from 'react';
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  AlertCircle, 
  Search, 
  Bell, 
  Calendar,
  ChevronRight,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, COLORS, Badge, ProgressBar } from './SharedUI';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Mon', xp: 400, active: 12 },
  { name: 'Tue', xp: 300, active: 15 },
  { name: 'Wed', xp: 600, active: 10 },
  { name: 'Thu', xp: 800, active: 18 },
  { name: 'Fri', xp: 500, active: 22 },
  { name: 'Sat', xp: 900, active: 25 },
  { name: 'Sun', xp: 700, active: 20 },
];

const students = [
  { id: 1, name: "Sarah Miller", level: 4, xp: 1250, progress: 85, status: "Active", lastActive: "2m ago" },
  { id: 2, name: "James Wilson", level: 3, xp: 980, progress: 62, status: "Struggling", lastActive: "1h ago" },
  { id: 3, name: "Leo Garcia", level: 5, xp: 2100, progress: 95, status: "Active", lastActive: "10m ago" },
  { id: 4, name: "Emma Thompson", level: 2, xp: 450, progress: 30, status: "Inactive", lastActive: "2d ago" },
];

export const MentorDashboard = () => {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#1CB0F6] rounded-xl flex items-center justify-center text-white">
            <BookOpen size={24} />
          </div>
          <span className="text-xl font-bold text-gray-900">MentorHub</span>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon={TrendingUp} label="Overview" active />
          <NavItem icon={Users} label="Students" />
          <NavItem icon={BookOpen} label="Curriculum" />
          <NavItem icon={Calendar} label="Schedule" />
          <div className="pt-8 pb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Insights</span>
          </div>
          <NavItem icon={AlertCircle} label="Risk Alerts" />
          <NavItem icon={Bell} label="Notifications" badge="3" />
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1544972917-3529b113a469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFjaGVyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcwNzg1NTY5fDA" 
            className="w-10 h-10 rounded-full object-cover" 
            alt="Mentor"
          />
          <div>
            <p className="text-sm font-bold text-gray-900">Prof. Anderson</p>
            <p className="text-xs text-gray-500">Class 5A • Admin</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Class Performance</h1>
            <p className="text-gray-500 font-medium">Monitoring 24 students across 3 coding paths.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
              <Filter size={18} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1CB0F6] rounded-xl font-bold text-white hover:bg-[#1899D6] transition-all shadow-md">
              Export Report
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Avg. XP" value="1,450" change="+12%" icon={TrendingUp} color="blue" />
          <StatCard title="Completion Rate" value="78%" change="+5%" icon={CheckCircle2} color="green" />
          <StatCard title="Struggling Students" value="3" change="-1" icon={AlertCircle} color="red" />
          <StatCard title="Avg. Session" value="24m" change="+2m" icon={Clock} color="yellow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Chart */}
          <Card className="lg:col-span-2 p-8 border-none shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-gray-900">Learning Activity (Last 7 Days)</h3>
              <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none">
                <option>Total XP Gained</option>
                <option>Lessons Completed</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1CB0F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1CB0F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#1CB0F6" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Weak Topics */}
          <Card className="p-8 border-none shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Topic Mastery</h3>
            <div className="space-y-6 flex-1">
              <TopicStat label="Basic Syntax" progress={92} color="#58CC02" />
              <TopicStat label="Loops & Iteration" progress={65} color="#FFC800" />
              <TopicStat label="Conditional Logic" progress={42} color="#FF4B4B" />
              <TopicStat label="Variables" progress={88} color="#1CB0F6" />
            </div>
            <button className="mt-8 text-[#1CB0F6] font-bold text-sm hover:underline flex items-center gap-1">
              View Detailed Curriculum Analysis <ChevronRight size={16} />
            </button>
          </Card>
        </div>

        {/* Student Table */}
        <Card className="p-0 border-none shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h3 className="text-xl font-bold text-gray-900">Student Progress</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                placeholder="Search students..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1CB0F6] w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Curriculum Progress</th>
                  <th className="px-6 py-4">Level / XP</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white overflow-hidden shadow-sm">
                          <img src={`https://i.pravatar.cc/100?u=${student.id}`} alt={student.name} />
                        </div>
                        <span className="font-bold text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        student.status === 'Active' ? 'bg-green-100 text-green-600' :
                        student.status === 'Struggling' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-gray-400">
                          <span>{student.progress}%</span>
                        </div>
                        <ProgressBar progress={student.progress} color={student.status === 'Struggling' ? '#FF4B4B' : '#58CC02'} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">Level {student.level}</div>
                      <div className="text-xs text-gray-400">{student.xp} total XP</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.lastActive}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active = false, badge }: any) => (
  <div className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-50 text-[#1CB0F6]' : 'text-gray-500 hover:bg-gray-50'}`}>
    <div className="flex items-center gap-3">
      <Icon size={20} className={active ? 'text-[#1CB0F6]' : 'text-gray-400'} />
      <span className="font-bold text-sm">{label}</span>
    </div>
    {badge && <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{badge}</span>}
  </div>
);

const StatCard = ({ title, value, change, icon: Icon, color }: any) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };
  return (
    <Card className="p-6 border-none shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl ${colors[color as keyof typeof colors]}`}>
          <Icon size={24} />
        </div>
        <span className={`text-xs font-bold ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
      </div>
      <h4 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</h4>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </Card>
  );
};

const TopicStat = ({ label, progress, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <span className="text-xs font-black" style={{ color }}>{progress}%</span>
    </div>
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: color }} />
    </div>
  </div>
);
