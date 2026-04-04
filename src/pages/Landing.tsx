import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Target, Code, Star } from "lucide-react";
import logo from "../assets/8443babb0dd67ee3ebd39b55554989e03b362ce3.png";

const features = [
  { icon: Target, label: "Skill Evaluation",  desc: "Find your level instantly",  bg: "bg-[#DDF4FF]", color: "text-[#1CB0F6]" },
  { icon: Code,   label: "Live Coding",        desc: "Write real Python in-browser", bg: "bg-[#D7FFB8]", color: "text-[#58CC02]" },
  { icon: Zap,    label: "Adaptive AI Path",   desc: "Lessons that grow with you",  bg: "bg-yellow-50",  color: "text-[#FFC800]" },
];

const card = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: "easeOut" as const },
});

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">

      {/* ── top bar ── */}
      <div className="bg-white border-b-2 border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} className="w-8 h-8 object-contain" alt="PyAi" />
          <span className="text-xl font-black text-[#4B4B4B] tracking-tight">
            Py<span className="text-[#58CC02]">Ai</span>
          </span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-[#1CB0F6] font-black text-sm uppercase tracking-widest hover:underline"
        >
          Log In
        </button>
      </div>

      {/* ── hero ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 max-w-lg mx-auto w-full gap-8">

        {/* mascot / icon blob */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="w-28 h-28 bg-[#DDF4FF] rounded-full flex items-center justify-center shadow-[0_6px_0_0_#B8E8FB]"
        >
          <img src={logo} className="w-16 h-16 object-contain" alt="PyAi mascot" />
        </motion.div>

        {/* headline */}
        <motion.div {...card(0.08)} className="text-center space-y-3">
          <h1 className="text-4xl font-black text-[#4B4B4B] leading-tight">
            Learn Python &amp; AI<br />
            <span className="text-[#58CC02]">The Fun Way 🚀</span>
          </h1>
          <p className="text-gray-400 font-bold text-base">
            Personalized lessons powered by AI — built for the next generation of coders.
          </p>
        </motion.div>

        {/* feature pills */}
        <motion.div {...card(0.15)} className="w-full space-y-3">
          {features.map(({ icon: Icon, label, desc, bg, color }) => (
            <div
              key={label}
              className="bg-white rounded-[20px] border-2 border-[#E5E5E5] p-4 flex items-center gap-4 shadow-sm"
            >
              <div className={`w-11 h-11 ${bg} rounded-2xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="font-black text-[#4B4B4B] text-sm">{label}</p>
                <p className="text-gray-400 font-bold text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div {...card(0.22)} className="w-full space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/evaluation")}
            className="w-full py-4 rounded-2xl font-black text-lg bg-[#58CC02] text-white
                       shadow-[0_6px_0_0_#46A302] active:translate-y-1 active:shadow-none
                       transition-all flex items-center justify-center gap-2"
          >
            Take Evaluation <ArrowRight size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="w-full py-4 rounded-2xl font-black text-lg bg-white text-[#1CB0F6]
                       border-2 border-[#E5E5E5] shadow-[0_6px_0_0_#E5E5E5]
                       active:translate-y-1 active:shadow-none transition-all"
          >
            Create Free Account
          </motion.button>
        </motion.div>

        {/* trust nudge */}
        <motion.p {...card(0.28)} className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
          <Star size={13} className="text-[#FFC800]" fill="currentColor" />
          No signup required to try · Free forever
        </motion.p>

      </div>
    </div>
  );
};
