import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../supabase";

import {
  Flame,
  Star,
  Trophy,
  BookOpen,
  Zap,
  ChevronRight,
  Target,
  ArrowRight,
} from "lucide-react";

// ─── tiny helpers ─────────────────────────────────────────────────────────────

const StatPill = ({
  icon: Icon,
  value,
  label,
  color,
  bg,
}: {
  icon: any;
  value: string | number;
  label: string;
  color: string;
  bg: string;
}) => (
  <motion.div
    whileHover={{ y: -3 }}
    className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl ${bg}`}
  >
    <Icon size={22} className={color} />
    <span className={`font-black text-xl ${color}`}>{value}</span>
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
      {label}
    </span>
  </motion.div>
);

const card = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: "easeOut" as const },
});

// ─── component ────────────────────────────────────────────────────────────────

export const Home = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  // 🔥 Supabase user fetch (replaces Firebase)
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setUserData(data);
      }
    };

    fetchUser();
  }, [user]);

  // ── logged-out splash ──────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-[#DDF4FF] rounded-full flex items-center justify-center"
        >
          <Zap size={48} className="text-[#1CB0F6]" />
        </motion.div>

        <motion.div {...card(0.1)} className="space-y-3">
          <h1 className="text-5xl font-black text-[#4B4B4B]">
            Welcome to <span className="text-[#58CC02]">PyAi</span>
          </h1>
          <p className="text-gray-400 font-bold text-lg">
            Learn coding the smart way with AI
          </p>
        </motion.div>

        <motion.div {...card(0.2)} className="flex gap-4">
          <button onClick={() => navigate("/login")} className="btn-primary">
            LOG IN
          </button>
          <button onClick={() => navigate("/signup")} className="btn-secondary">
            SIGN UP
          </button>
        </motion.div>
      </div>
    );
  }

  // ── logged-in home ─────────────────────────────────────────────────────────

  const xp = userData?.totalXP ?? 0;
  const streak = userData?.streak ?? 0;
  const name = userData?.name ?? "Learner";

  const dailyGoal = 20;
  const todayXP = Math.min(xp % dailyGoal, dailyGoal);
  const goalPct = Math.round((todayXP / dailyGoal) * 100);

  return (
    <div className="min-h-screen bg-[#F7F7F7]">

      {/* Top bar */}
      <div className="sticky top-0 bg-white px-6 py-3 border-b">
        <div className="max-w-2xl mx-auto flex justify-between">
          <span className="text-2xl font-black">
            Py<span className="text-[#58CC02]">Ai</span>
          </span>

          <div className="flex gap-2">
            <StatPill icon={Flame} value={streak} label="Streak" color="text-red-500" bg="bg-red-50" />
            <StatPill icon={Star} value={xp} label="XP" color="text-yellow-500" bg="bg-yellow-50" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-5 space-y-6">

        {/* Greeting */}
        <motion.div {...card(0)}>
          <h1 className="text-3xl font-black">Hey, {name} 👋</h1>
          <p className="text-gray-400">
            {streak > 0
              ? `You're on a ${streak}-day streak`
              : "Start your streak today"}
          </p>
        </motion.div>

        {/* Goal */}
        <motion.div {...card(0.1)} className="bg-white p-5 rounded-xl">
          <div className="flex justify-between mb-2">
            <span>Daily Goal</span>
            <span>{goalPct}%</span>
          </div>

          <div className="h-3 bg-gray-200 rounded">
            <div
              className="h-full bg-yellow-400 rounded"
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          {...card(0.2)}
          onClick={() => navigate("/courses")}
          className="bg-blue-500 text-white p-6 rounded-xl cursor-pointer"
        >
          Continue Learning 🚀
        </motion.div>

      </div>
    </div>
  );
};