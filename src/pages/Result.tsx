import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, ArrowRight, BookOpen, ChevronRight, RotateCcw } from 'lucide-react';
import { COURSES } from '../data/courseData';

export const Result = () => {
  const [lastResult, setLastResult] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const results = JSON.parse(localStorage.getItem('evaluationResults') || '[]');
    if (results.length > 0) {
      setLastResult(results[results.length - 1]);
    } else {
      navigate('/evaluation');
    }
  }, [navigate]);

  if (!lastResult) return null;

  const handleStartCourse = (courseId: string) => {
    navigate("/signup");
  };

  const handleExploreCourses = () => {
    navigate("/signup");
  };

  const getPerformanceLevel = (score: number) => {
    if (score <= 40) return { label: 'Beginner', color: 'text-blue-500', bg: 'bg-blue-50', courseId: 'course-1' };
    if (score <= 75) return { label: 'Intermediate', color: 'text-[#FFC800]', bg: 'bg-yellow-50', courseId: 'course-1' };
    return { label: 'Advanced', color: 'text-[#58CC02]', bg: 'bg-green-50', courseId: 'course-2' };
  };

  const level = getPerformanceLevel(lastResult.score);
  const recommendedCourse = COURSES.find(c => c.id === level.courseId);

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] border-2 border-[#E5E5E5] p-12 text-center shadow-sm"
        >
          <div className="inline-block p-6 bg-yellow-50 rounded-full mb-8 relative">
            <Trophy size={80} className="text-[#FFC800]" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
              className="absolute inset-0 border-4 border-dashed border-[#FFC800] rounded-full opacity-30"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#4B4B4B] mb-4">Assessment Complete!</h1>
          <p className="text-xl text-gray-500 font-medium mb-10">You've successfully mapped your Python skills.</p>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <div className="space-y-2">
              <span className="text-6xl font-black text-[#1CB0F6]">{lastResult.score}%</span>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Overall Score</p>
            </div>
            <div className="hidden md:block w-px h-16 bg-gray-100" />
            <div className="space-y-2">
              <span className={`text-4xl font-black ${level.color}`}>{level.label}</span>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Performance Level</p>
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-[#4B4B4B]">Recommended For You</h2>
          
          {recommendedCourse && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[32px] border-2 border-[#E5E5E5] p-8 flex flex-col md:flex-row gap-8 items-center shadow-sm"
            >
              <div className="w-full md:w-64 h-48 bg-[#DDF4FF] rounded-2xl flex items-center justify-center">
                 <BookOpen size={64} className="text-[#1CB0F6]" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-[#1CB0F6] font-black text-xs rounded-full uppercase">Beginner Friendly</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-400 font-black text-xs rounded-full uppercase">{recommendedCourse.duration}</span>
                </div>
                <h3 className="text-2xl font-black text-[#4B4B4B] leading-tight">{recommendedCourse.title}</h3>
                <p className="text-gray-500 font-medium">{recommendedCourse.description}</p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={() => handleStartCourse(recommendedCourse.id)}
                    className="bg-[#58CC02] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-[0_6px_0_0_#46A302] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                  >
                    START COURSE <ArrowRight />
                  </button>
                  <button 
                    onClick={handleExploreCourses}
                    className="text-[#1CB0F6] font-black flex items-center gap-2 hover:gap-3 transition-all px-4"
                  >
                    Explore All Courses <ChevronRight />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => navigate('/evaluation')}
            className="flex items-center gap-2 font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RotateCcw size={18} /> RETAKE EVALUATION
          </button>
        </div>
      </div>
    </div>
  );
};
