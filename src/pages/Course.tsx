import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Lock, 
  Play, 
  BookOpen, 
  HelpCircle, 
  Trophy, 
  ChevronLeft,
  X,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';
import { PythonEditor } from '../components/PythonEditor';
import { supabase } from '../supabase';

interface Lesson {
  id: number;
  title: string;
  type: 'theory' | 'mcq' | 'coding';
  content?: string;
  question?: string;
  options?: string[];
  correct?: number;
  initialCode?: string;
  expectedOutput?: string;
}

const COURSE_DATA: Record<string, Lesson[]> = {
  beginner: [
    { id: 1, title: "Introduction to Print", type: 'theory', content: "Python is a language used for apps, AI, and more! The 'print' function displays text on your screen." },
    { id: 2, title: "Quiz: Print", type: 'mcq', question: "Which of these prints text correctly?", options: ["print(Hello)", "print('Hello')", "echo 'Hello'", "write('Hello')"], correct: 1 },
    { id: 3, title: "Practice: Print", type: 'coding', initialCode: "# Print 'I love Python' below\n", expectedOutput: "I love Python\n" },
    { id: 4, title: "Your First Variable", type: 'theory', content: "Variables store data. Think of them as boxes with labels. Example: my_box = 10" },
    { id: 5, title: "Quiz: Variables", type: 'mcq', question: "How do you store the number 5 in 'x'?", options: ["x is 5", "5 = x", "x = 5", "variable x = 5"], correct: 2 },
  ],
  intermediate: [
    { id: 1, title: "Loops 101", type: 'theory', content: "Loops let you repeat actions! A 'for' loop is great for repeating something a specific number of times." },
    { id: 2, title: "Quiz: For Loops", type: 'mcq', question: "What function creates a sequence of numbers for a loop?", options: ["sequence()", "repeat()", "range()", "list()"], correct: 2 },
    { id: 3, title: "Practice: Loops", type: 'coding', initialCode: "# Print numbers 0 to 4 using a for loop\nfor i in range(5):\n    # print i here\n", expectedOutput: "0\n1\n2\n3\n4\n" },
  ],
  advanced: [
    { id: 1, title: "Mastering Functions", type: 'theory', content: "Functions are reusable blocks of code. Use 'def' to define a function!" },
    { id: 2, title: "Practice: Functions", type: 'coding', initialCode: "def greet():\n    print('Hello')\n\n# Call the function greet() below\n", expectedOutput: "Hello\n" },
  ]
};

export const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();;
  const [activeLessonIdx, setActiveLessonIdx] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const navigate = useNavigate();

  // const lessons = COURSE_DATA[level || 'beginner'] || COURSE_DATA['beginner'];
  const [lessons, setLessons] = useState<Lesson[]>([]);
  useEffect(() => {
  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId);

    if (error) {
      console.log(error);
      return;
    }

    setLessons(data || []);
  };

  if (courseId) fetchLessons();
}, [courseId]);

  const handleComplete = () => {
    if (activeLessonIdx === null) return;
    const lessonId = lessons[activeLessonIdx].id;
    if (!completedLessons.includes(lessonId)) {
      const newCompleted = [...completedLessons, lessonId];
      setCompletedLessons(newCompleted);
      localStorage.setItem(`pyai_completed_${courseId}`, JSON.stringify(newCompleted));
    }
    setFeedback('none');
    setActiveLessonIdx(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Course Header */}
      <div className="sticky top-0 z-40 bg-white border-b-2 border-gray-100 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/result')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-black text-[#4B4B4B] capitalize">{courseId} Course</h1>
              <div className="h-2 w-32 bg-gray-100 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-[#58CC02] transition-all duration-500"
                  style={{ width: `${(completedLessons.length / lessons.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <Star className="text-yellow-400" fill="currentColor" size={20} />
                <span className="font-black text-[#4B4B4B]">{completedLessons.length * 10}</span>
             </div>
             <div className="flex items-center gap-2">
                <Flame className="text-[#FF4B4B]" fill="currentColor" size={20} />
                <span className="font-black text-[#4B4B4B]">3</span>
             </div>
          </div>
        </div>
      </div>

      {/* Path */}
      <div className="max-w-xl mx-auto py-12 px-6 flex flex-col items-center gap-12">
        {lessons.map((lesson, idx) => {
          const isLocked = idx > 0 && !completedLessons.includes(lessons[idx - 1].id);
          const isCompleted = completedLessons.includes(lesson.id);
          const isActive = idx === completedLessons.length;

          return (
            <motion.button
              key={lesson.id}
              whileHover={!isLocked ? { scale: 1.1 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
              disabled={isLocked}
              onClick={() => setActiveLessonIdx(idx)}
              className={`relative group
                ${idx % 2 === 0 ? 'translate-x-0' : idx % 4 === 1 ? 'translate-x-12' : 'translate-x-[-48px]'}`}
            >
              {isActive && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl border-2 border-[#E5E5E5] shadow-sm whitespace-nowrap z-10 animate-bounce">
                  <span className="font-black text-[#58CC02] text-xs uppercase tracking-widest">Start!</span>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-[#E5E5E5] rotate-45" />
                </div>
              )}
              
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-b-[6px] transition-all
                ${isCompleted ? 'bg-[#58CC02] border-[#46A302]' : 
                  isActive ? 'bg-[#1CB0F6] border-[#1899D6]' : 
                  'bg-[#E5E5E5] border-[#D0D0D0]'}`}>
                {isCompleted ? <CheckCircle2 className="text-white" size={32} /> :
                 isLocked ? <Lock className="text-gray-400" size={28} /> :
                 lesson.type === 'theory' ? <BookOpen className="text-white" size={32} /> :
                 lesson.type === 'mcq' ? <HelpCircle className="text-white" size={32} /> :
                 <Play className="text-white ml-1" size={32} fill="currentColor" />}
              </div>
              
              <p className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 font-bold text-sm whitespace-nowrap uppercase tracking-tighter
                ${isLocked ? 'text-gray-300' : 'text-gray-500'}`}>
                {lesson.title}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Lesson Modal */}
      <AnimatePresence>
        {activeLessonIdx !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveLessonIdx(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={32} />
                </button>
                <div className="h-4 w-64 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#58CC02]" style={{ width: '50%' }} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-yellow-500 font-bold">
                <Star size={24} fill="currentColor" />
                <span>+10 XP</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-12">
              <div className="max-w-3xl mx-auto space-y-12">
                {lessons[activeLessonIdx].type === 'theory' && (
                  <div className="text-center space-y-12">
                    <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                      <BookOpen size={64} className="text-[#1CB0F6]" />
                    </div>
                    <div className="space-y-6">
                      <h2 className="text-4xl font-black text-[#4B4B4B]">{lessons[activeLessonIdx].title}</h2>
                      <p className="text-2xl text-gray-500 font-medium leading-relaxed">
                        {lessons[activeLessonIdx].content}
                      </p>
                    </div>
                  </div>
                )}

                {lessons[activeLessonIdx].type === 'mcq' && (
                  <div className="space-y-10">
                    <h2 className="text-3xl font-black text-[#4B4B4B] text-center">
                      {lessons[activeLessonIdx].question}
                    </h2>
                    <div className="grid gap-4">
                      {lessons[activeLessonIdx].options?.map((opt, i) => (
                        <button 
                          key={i}
                          onClick={() => setFeedback(i === lessons[activeLessonIdx].correct ? 'correct' : 'incorrect')}
                          className={`p-6 rounded-2xl border-2 font-bold text-lg text-left transition-all
                            ${feedback === 'correct' && i === lessons[activeLessonIdx].correct ? 'border-[#58CC02] bg-[#D7FFB8] text-[#46A302]' :
                              feedback === 'incorrect' && i !== lessons[activeLessonIdx].correct ? 'border-[#FF4B4B] bg-[#FFDFE0] text-[#EA2B2B]' :
                              'border-[#E5E5E5] hover:bg-gray-50 text-gray-500'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {lessons[activeLessonIdx].type === 'coding' && (
                  <div className="h-[500px] flex flex-col gap-6">
                    <div className="text-center">
                      <h2 className="text-3xl font-black text-[#4B4B4B] mb-2">{lessons[activeLessonIdx].title}</h2>
                      <p className="text-gray-500 font-bold italic">"Reach the expected output to move forward!"</p>
                    </div>
                    <PythonEditor 
                      initialCode={lessons[activeLessonIdx].initialCode}
                      expectedOutput={lessons[activeLessonIdx].expectedOutput}
                      onSuccess={() => setFeedback('correct')}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className={`p-8 border-t-2 transition-colors duration-300
              ${feedback === 'correct' ? 'bg-[#D7FFB8] border-[#A5E571]' : 
                feedback === 'incorrect' ? 'bg-[#FFDFE0] border-[#FFB8B8]' : 
                'bg-white border-gray-100'}`}>
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {feedback === 'correct' && (
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-full"><CheckCircle2 className="text-[#58CC02]" size={32} /></div>
                      <div>
                        <h4 className="font-black text-[#46A302] text-xl">Correct!</h4>
                        <p className="font-bold text-[#46A302]">You're doing great!</p>
                      </div>
                    </div>
                  )}
                  {feedback === 'incorrect' && (
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-full"><X className="text-[#FF4B4B]" size={32} /></div>
                      <div>
                        <h4 className="font-black text-[#EA2B2B] text-xl">Not quite...</h4>
                        <p className="font-bold text-[#EA2B2B]">Try again, you can do it!</p>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => {
                    if (lessons[activeLessonIdx].type === 'theory') {
                      handleComplete();
                    } else if (feedback === 'correct') {
                      handleComplete();
                    } else if (feedback === 'incorrect') {
                      setFeedback('none');
                    }
                  }}
                  className={`px-12 py-4 rounded-2xl font-black text-lg shadow-[0_6px_0_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none transition-all
                    ${feedback === 'correct' ? 'bg-[#58CC02] text-white' : 
                      feedback === 'incorrect' ? 'bg-[#FF4B4B] text-white' : 
                      'bg-[#1CB0F6] text-white'}`}
                >
                  {feedback === 'correct' ? 'CONTINUE' : feedback === 'incorrect' ? 'GOT IT' : 'I UNDERSTAND'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
