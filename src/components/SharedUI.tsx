import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Lock, 
  Star, 
  Flame, 
  Trophy, 
  ChevronRight, 
  Play, 
  Info, 
  Send, 
  MessageCircle, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings,
  HelpCircle,
  Code,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

// --- Types & Constants ---
export type UserRole = 'student' | 'mentor' | null;
export type AppState = 'auth' | 'onboarding' | 'student_dashboard' | 'lesson' | 'quiz' | 'result' | 'mentor_dashboard';

export const COLORS = {
  primary: '#58CC02', // Duolingo Green
  primaryDark: '#46A302',
  secondary: '#1CB0F6', // Soft Blue
  accent: '#FFC800', // Warm Yellow
  background: '#F7F7F7',
  cardBg: '#FFFFFF',
  text: '#4B4B4B',
  textLight: '#777777',
  error: '#FF4B4B',
  success: '#58CC02',
};

// --- Shared Components ---

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  fullWidth = false 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost',
  className?: string,
  disabled?: boolean,
  fullWidth?: boolean
  type?: "button" | "submit" | "reset";
}) => {
  const baseStyles = "px-6 py-3 rounded-2xl font-bold transition-all active:translate-y-1 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-center";
  const variants = {
    primary: `bg-[#58CC02] text-white shadow-[#46A302]`,
    secondary: `bg-[#1CB0F6] text-white shadow-[#1899D6]`,
    accent: `bg-[#FFC800] text-white shadow-[#E5B400]`,
    outline: `bg-white border-2 border-[#E5E5E5] text-[#1CB0F6] shadow-none`,
    ghost: `bg-transparent shadow-none text-[#777777] hover:bg-gray-100`,
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 ${className}`}>
    {children}
  </div>
);

export const Badge = ({ children, icon: Icon, color = "primary" }: { children: React.ReactNode, icon?: any, color?: string }) => (
  <div className="flex items-center gap-2 bg-white border-2 border-[#E5E5E5] rounded-xl px-3 py-1.5 shadow-sm">
    {Icon && <Icon className={`w-5 h-5 ${color === 'primary' ? 'text-[#58CC02]' : color === 'accent' ? 'text-[#FFC800]' : 'text-[#1CB0F6]'}`} />}
    <span className="font-bold text-sm text-[#4B4B4B]">{children}</span>
  </div>
);

export const ProgressBar = ({ progress, color = '#58CC02' }: { progress: number, color?: string }) => (
  <div className="w-full h-4 bg-[#E5E5E5] rounded-full overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      className="h-full" 
      style={{ backgroundColor: color }}
    />
  </div>
);

// --- AI Mentor Character ---
export const AIMentor = ({ message, isTyping = false }: { message: string, isTyping?: boolean }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 rounded-full bg-[#1CB0F6] flex-shrink-0 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1685360798969-395cf93b7d2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcm9ib3QlMjBtYXNjb3QlMjAzZHxlbnwxfHx8fDE3NzA4MTQzMTF8MA&ixlib=rb-4.1.0&q=80&w=1080" 
          alt="AI Mentor"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative bg-white border-2 border-[#E5E5E5] rounded-3xl rounded-tl-none p-4 shadow-sm max-w-[280px]">
        <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-transparent border-r-[10px] border-r-white border-b-[10px] border-b-transparent" />
        <p className="text-[#4B4B4B] text-sm leading-relaxed">
          {isTyping ? "..." : message}
        </p>
      </div>
    </div>
  );
};
