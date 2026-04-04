import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Brain, Code, CheckCircle2 } from 'lucide-react';
import { EVALUATION_MCQS, EVALUATION_CODING } from '../data/courseData';
import { PythonEditor } from '../components/PythonEditor';

export const Evaluation = () => {
  const [step, setStep] = useState<'mcq' | 'coding'>('mcq');
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [codingIndex, setCodingIndex] = useState(0);
  const [codingResults, setCodingResults] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();

  const handleMcqSelect = (optionIndex: number) => {
    setMcqAnswers({ ...mcqAnswers, [mcqIndex]: optionIndex });
  };

  const handleCodingSuccess = () => {
    setCodingResults({ ...codingResults, [codingIndex]: true });
  };

  const calculateResults = () => {
    let mcqScore = 0;
    EVALUATION_MCQS.forEach((q, i) => {
      if (mcqAnswers[i] === q.correct) mcqScore += 1;
    });
    
    let codingScore = 0;
    Object.values(codingResults).forEach(res => {
      if (res) codingScore += 1;
    });

    const totalPossible = EVALUATION_MCQS.length + EVALUATION_CODING.length;
    const finalScore = Math.round(((mcqScore + (codingScore * (EVALUATION_MCQS.length / EVALUATION_CODING.length))) / (EVALUATION_MCQS.length * 2)) * 100);
    
    // Weighted score calculation: 50% MCQ, 50% Coding
    const mcqPercentage = (mcqScore / EVALUATION_MCQS.length) * 50;
    const codingPercentage = (codingScore / EVALUATION_CODING.length) * 50;
    const weightedScore = Math.round(mcqPercentage + codingPercentage);

    const result = {
      score: weightedScore,
      date: new Date().toLocaleDateString(),
      mcqScore: mcqScore,
      codingScore: codingScore
    };

    const existingResults = JSON.parse(localStorage.getItem('evaluationResults') || '[]');
    localStorage.setItem('evaluationResults', JSON.stringify([...existingResults, result]));
    
    navigate('/result');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-12">
        {/* Progress Header */}
        <div className="mb-12 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-[#4B4B4B]">Skill Assessment</h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mt-1">
                {step === 'mcq' ? 'Part 1: Fundamentals' : 'Part 2: Coding Practice'}
              </p>
            </div>
            <span className="font-black text-[#1CB0F6]">
              {step === 'mcq' ? `${mcqIndex + 1}/${EVALUATION_MCQS.length}` : `${codingIndex + 1}/${EVALUATION_CODING.length}`}
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#1CB0F6]"
              initial={{ width: 0 }}
              animate={{ 
                width: step === 'mcq' 
                  ? `${((mcqIndex + 1) / EVALUATION_MCQS.length) * 50}%` 
                  : `${50 + ((codingIndex + 1) / EVALUATION_CODING.length) * 50}%` 
              }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'mcq' ? (
            <motion.div 
              key={`mcq-${mcqIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[32px] border-2 border-[#E5E5E5] p-8 md:p-12 shadow-sm">
                <div className="flex items-center gap-4 mb-8 text-[#1CB0F6]">
                  <Brain size={32} />
                  <span className="font-black text-xl">Question {mcqIndex + 1}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#4B4B4B] mb-10 leading-snug">
                  {EVALUATION_MCQS[mcqIndex].question}
                </h2>
                <div className="grid gap-4">
                  {EVALUATION_MCQS[mcqIndex].options.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleMcqSelect(i)}
                      className={`text-left p-6 rounded-2xl border-2 font-bold text-lg transition-all
                        ${mcqAnswers[mcqIndex] === i 
                          ? 'border-[#1CB0F6] bg-[#DDF4FF] text-[#1CB0F6] shadow-[0_4px_0_0_#1899D6]' 
                          : 'border-[#E5E5E5] hover:bg-gray-50 text-gray-500 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-lg border-2 border-inherit flex items-center justify-center text-sm">{i + 1}</span>
                        {opt}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center px-4">
                <button 
                  onClick={() => mcqIndex > 0 && setMcqIndex(mcqIndex - 1)}
                  className={`flex items-center gap-2 font-black text-lg transition-all ${mcqIndex === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <ChevronLeft /> PREVIOUS
                </button>
                <button 
                  disabled={mcqAnswers[mcqIndex] === undefined}
                  onClick={() => {
                    if (mcqIndex < EVALUATION_MCQS.length - 1) {
                      setMcqIndex(mcqIndex + 1);
                    } else {
                      setStep('coding');
                    }
                  }}
                  className={`bg-[#58CC02] text-white px-10 py-4 rounded-2xl font-black text-lg shadow-[0_6px_0_0_#46A302] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 disabled:grayscale`}
                >
                  {mcqIndex === EVALUATION_MCQS.length - 1 ? 'START CODING' : 'NEXT'} <ChevronRight />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={`coding-${codingIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              <div className="space-y-6">
                <div className="bg-white rounded-[32px] border-2 border-[#E5E5E5] p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-6 text-[#FFC800]">
                    <Code size={32} />
                    <span className="font-black text-xl uppercase tracking-tighter">Coding Challenge {codingIndex + 1}</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#4B4B4B] mb-4">{EVALUATION_CODING[codingIndex].title}</h3>
                  <p className="text-gray-600 font-medium text-lg leading-relaxed mb-8">
                    {EVALUATION_CODING[codingIndex].description}
                  </p>
                  <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 mb-8">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Expected Output</p>
                    <code className="text-[#4B4B4B] font-mono font-bold whitespace-pre">{EVALUATION_CODING[codingIndex].expectedOutput}</code>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <button 
                    onClick={() => codingIndex > 0 ? setCodingIndex(codingIndex - 1) : setStep('mcq')}
                    className="flex items-center gap-2 font-black text-lg text-gray-400 hover:text-gray-600 transition-all"
                  >
                    <ChevronLeft /> BACK
                  </button>
                  <button 
                    onClick={() => {
                      if (codingIndex < EVALUATION_CODING.length - 1) {
                        setCodingIndex(codingIndex + 1);
                      } else {
                        calculateResults();
                      }
                    }}
                    className="bg-[#1CB0F6] text-white px-10 py-4 rounded-2xl font-black text-lg shadow-[0_6px_0_0_#1899D6] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                  >
                    {codingIndex === EVALUATION_CODING.length - 1 ? 'SUBMIT ALL' : 'NEXT PROBLEM'} <ChevronRight />
                  </button>
                </div>
              </div>

              <div className="h-[600px]">
                <PythonEditor 
                  key={codingIndex}
                  initialCode={EVALUATION_CODING[codingIndex].initialCode}
                  expectedOutput={EVALUATION_CODING[codingIndex].expectedOutput}
                  onSuccess={handleCodingSuccess}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
