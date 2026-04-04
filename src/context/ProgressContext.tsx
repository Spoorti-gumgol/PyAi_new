import React, { createContext, useContext, useState, useEffect } from 'react';

export type MasteryLevel = "Mastered" | "Developing" | "Needs Improvement";

export interface LessonProgress {
  completed: boolean;
  score: number;
  masteryLevel: MasteryLevel;
  // Adaptive fields
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  rollingAccuracy?: number[]; 
}

export interface UserProgress {
  progress: {
    [unitId: string]: {
      [lessonId: string]: LessonProgress;
    };
  };
  totalXP: number;
}

const defaultProgress: UserProgress = {
  progress: {},
  totalXP: 0,
};

interface ProgressContextType {
  userProgress: UserProgress;
  updateLessonProgress: (unitId: string, lessonId: string, score: number, completed: boolean, accuracy?: number) => void;
  getLessonProgress: (unitId: string, lessonId: string) => LessonProgress | null;
  isLessonLocked: (unitId: string, lessonId: string, previousLessonId: string | null) => boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('pyai-progress-v3');
      return saved ? JSON.parse(saved) : defaultProgress;
    } catch (e) {
      console.error("Failed to parse progress", e);
      return defaultProgress;
    }
  });

  useEffect(() => {
    localStorage.setItem('pyai-progress-v3', JSON.stringify(userProgress));
  }, [userProgress]);

  const updateLessonProgress = (unitId: string, lessonId: string, score: number, completed: boolean, accuracy?: number) => {
    setUserProgress(prev => {
      const newProgress = { ...prev };
      
      if (!newProgress.progress[unitId]) {
        newProgress.progress[unitId] = {};
      }

      const existingLesson = newProgress.progress[unitId][lessonId] || { 
        completed: false, 
        score: 0, 
        masteryLevel: 'Needs Improvement',
        difficultyLevel: 'easy',
        rollingAccuracy: []
      };
      
      // Determine mastery level
      let mastery: MasteryLevel = 'Needs Improvement';
      if (score >= 80) mastery = 'Mastered';
      else if (score >= 50) mastery = 'Developing';

      // Adaptive Logic
      let newDifficulty: 'easy' | 'medium' | 'hard' = existingLesson.difficultyLevel || 'easy';
      let newRolling = existingLesson.rollingAccuracy || [];

      if (accuracy !== undefined) {
         newRolling = [...newRolling, accuracy];
         if (newRolling.length > 10) newRolling.shift();
         
         const avg = newRolling.reduce((a, b) => a + b, 0) / newRolling.length;
         
         if (avg > 0.75 && newDifficulty === 'easy') newDifficulty = 'medium';
         else if (avg > 0.75 && newDifficulty === 'medium') newDifficulty = 'hard';
         else if (avg < 0.40 && newDifficulty === 'hard') newDifficulty = 'medium';
         else if (avg < 0.40 && newDifficulty === 'medium') newDifficulty = 'easy';
      }

      // Calculate XP gain
      let xpGain = 0;
      if (completed && !existingLesson.completed) {
         if (newDifficulty === 'easy') xpGain = 10;
         else if (newDifficulty === 'medium') xpGain = 20;
         else xpGain = 30;
      }

      newProgress.progress[unitId][lessonId] = {
        completed: completed || existingLesson.completed,
        score: Math.max(score, existingLesson.score),
        masteryLevel: mastery,
        difficultyLevel: newDifficulty,
        rollingAccuracy: newRolling
      };
      
      newProgress.totalXP += xpGain;

      return newProgress;
    });
  };

  const getLessonProgress = (unitId: string, lessonId: string) => {
    return userProgress.progress[unitId]?.[lessonId] || null;
  };

  const isLessonLocked = (unitId: string, lessonId: string, previousLessonId: string | null) => {
    if (!previousLessonId) return false;
    // Special handling for the very first lesson of the first unit? 
    // Assuming logic is handled by caller or defaults.
    const prevProgress = userProgress.progress[unitId]?.[previousLessonId];
    return !prevProgress?.completed;
  };

  return (
    <ProgressContext.Provider value={{ userProgress, updateLessonProgress, getLessonProgress, isLessonLocked }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
