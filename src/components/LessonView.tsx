import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Play, 
  ChevronRight, 
  Code, 
  CheckCircle,
  Lightbulb,
  AlertCircle,
  Star
} from 'lucide-react';
import { Button, ProgressBar, Card, AIMentor, COLORS } from './SharedUI';
import { motion, AnimatePresence } from 'motion/react';

interface LessonViewProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

export const LessonView = ({ onComplete, onExit }: LessonViewProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [code, setCode] = useState("robot.moveForward();\nrobot.turnRight();");

  const steps = [
    {
      type: 'concept',
      title: "Meet Your Robot Buddy",
      content: "Coding is like giving a recipe to a robot. Every line of code is a step!",
      image: "https://images.unsplash.com/photo-1616802099190-5a4485319df6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBmb3IlMjBraWRzJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc3MDgxNDMxMnww",
      tip: "Hi! I'm Bolt. I'll follow your instructions perfectly!"
    },
    {
      type: 'mcq',
      question: "What happens if we forget to tell Bolt where to go?",
      options: [
        "He will guess where to go",
        "He will stay perfectly still",
        "He will spin in circles",
        "He will ask for a cookie"
      ],
      correct: 1,
      tip: "Think about how robots follow instructions step-by-step!"
    },
    {
      type: 'coding',
      title: "Your First Command",
      instruction: "Help Bolt reach the star by adding `robot.moveForward();` to the code!",
      targetCode: "robot.moveForward();",
      tip: "Type it exactly as it appears in the instructions!"
    }

  ];

  const current = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleCheck = () => {
    if (current.type === 'mcq') {
      if (selectedOption === current.correct) {
        setFeedback('correct');
      } else {
        setFeedback('incorrect');
      }
    } else if (current.type === 'coding') {
      setFeedback('correct'); // Mock success for demo
    }
  };

  const handleContinue = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setFeedback('none');
      setSelectedOption(null);
    } else {
      onComplete(100);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="max-w-5xl w-full mx-auto px-6 py-6 flex items-center gap-6">
        <button onClick={onExit} className="text-[#777777] hover:text-[#4B4B4B] p-1">
          <X size={28} />
        </button>
        <ProgressBar progress={progress} />
        <div className="flex items-center gap-2 text-[#FFC800]">
          <span className="font-black">3</span>
          <HelpCircle size={24} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            {current.type === 'concept' && (
              <div className="max-w-2xl mx-auto space-y-8 pt-10">
                <h2 className="text-3xl font-black text-[#4B4B4B]">{current.title}</h2>
                <div className="aspect-video rounded-3xl overflow-hidden border-2 border-[#E5E5E5] bg-[#F7F7F7]">
                  <img src={current.image} alt="Robot Concept" className="w-full h-full object-cover" />
                </div>
                <p className="text-xl text-[#4B4B4B] leading-relaxed font-medium">
                  {current.content}
                </p>
              </div>
            )}

            {current.type === 'mcq' && (
              <div className="max-w-2xl mx-auto space-y-8 pt-10">
                <h2 className="text-3xl font-black text-[#4B4B4B]">{current.question}</h2>
                <div className="grid gap-4">
                  {current.options?.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(i)}
                      className={`p-5 rounded-2xl border-2 text-left font-bold text-lg transition-all ${
                        selectedOption === i 
                        ? 'border-[#1CB0F6] bg-[#DDF4FF] text-[#1CB0F6]' 
                        : 'border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#4B4B4B]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-lg border-2 border-inherit flex items-center justify-center text-sm">{i + 1}</span>
                        {option}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {current.type === 'coding' && (
              <div className="grid lg:grid-cols-2 gap-8 h-full">
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-[#4B4B4B]">{current.title}</h2>
                  <Card className="bg-[#DDF4FF] border-[#1CB0F6]">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="text-[#1CB0F6] flex-shrink-0 mt-1" />
                      <p className="text-[#1CB0F6] font-bold">{current.instruction}</p>
                    </div>
                  </Card>
                  
                  {/* Game Preview Mock */}
                  <div className="aspect-square bg-slate-900 rounded-3xl relative overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20">
                      {[...Array(64)].map((_, i) => (
                        <div key={i} className="border-[0.5px] border-white/20" />
                      ))}
                    </div>
                    {/* Robot Sprite */}
                    <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-[#58CC02] rounded-xl flex items-center justify-center text-white">
                      <Code size={24} />
                    </div>
                    {/* Target Sprite */}
                    <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-[#FFC800] rounded-full flex items-center justify-center text-white animate-pulse">
                      <Star size={24} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex-1 bg-[#1E1E1E] rounded-3xl p-6 font-mono text-sm overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-gray-400">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="ml-2">script.js</span>
                    </div>
                    <textarea 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="flex-1 bg-transparent text-white outline-none resize-none leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                  <Button variant="accent" className="flex items-center justify-center gap-2">
                    <Play size={20} fill="currentColor" /> RUN CODE
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer / Feedback Bar */}
      <div className={`border-t-2 py-8 transition-colors ${
        feedback === 'correct' ? 'bg-[#D7FFB8] border-[#A5E571]' : 
        feedback === 'incorrect' ? 'bg-[#FFDFE0] border-[#FFB8B8]' : 
        'bg-white border-[#E5E5E5]'
      }`}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {feedback === 'none' ? (
                <div key="mentor" className="max-w-sm pointer-events-none">
                  <AIMentor message={current.tip || "You got this!"} />
                </div>
              ) : feedback === 'correct' ? (
                <motion.div key="correct" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-4 text-[#46A302]">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <CheckCircle size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Amazing!</h3>
                    <p className="font-bold">You're thinking like a programmer!</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="incorrect" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-4 text-[#EA2B2B]">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <AlertCircle size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Not quite!</h3>
                    <p className="font-bold">Look closely at the instructions.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            {feedback === 'none' ? (
              <Button 
                variant="primary" 
                disabled={current.type === 'mcq' && selectedOption === null}
                onClick={handleCheck}
              >
                CHECK
              </Button>
            ) : (
              <Button 
                variant={feedback === 'correct' ? 'primary' : 'accent'}
                onClick={handleContinue}
              >
                CONTINUE
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
