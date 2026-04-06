import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

type LessonProgress = {
  completed: boolean; // true = test submitted at least once
};

type UnitProgress = {
  [lessonId: string]: LessonProgress;
};

export type UserProgressType = {
  totalXP: number;
  progress: {
    [unitId: string]: UnitProgress;
  };
  visitedLessons: Set<string>;  // lessonId opened but test not yet taken
  testedLessons:  Set<string>;  // lessonId where test was submitted
};

type ProgressContextType = {
  userProgress: UserProgressType;
  markLessonVisited:  (lessonId: string) => void;
  markLessonTested:   (lessonId: string, unitId: string, xpEarned: number) => void;
  refreshProgress:    () => Promise<void>;
};

// ── Context ───────────────────────────────────────────────────────────────────

const ProgressContext = createContext<ProgressContextType | null>(null);

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProgress, setUserProgress] = useState<UserProgressType>({
    totalXP:        0,
    progress:       {},
    visitedLessons: new Set(),
    testedLessons:  new Set(),
  });

  // ── Load progress from Supabase on mount ────────────
  const refreshProgress = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) return;

    // 1. Pull all user_attempts to build progress + XP
    const { data: attempts, error } = await supabase
      .from("user_attempts")
      .select("question_id, topic_id, is_correct, xp_earned, test_id")
      .eq("user_id", userId);

    if (error) { console.error("ProgressContext fetch error:", error.message); return; }

    // 2. Pull completed test_attempts to know which lesson-tests were finished
    const { data: testAttempts, error: taError } = await supabase
      .from("test_attempts")
      .select("test_id, completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null);

    if (taError) { console.error("test_attempts fetch error:", taError.message); }

    // 3. Pull lessons joined with topics to get unit_id
    // Schema: lessons.topic_id → topics.unit_id
    const { data: lessons, error: lError } = await supabase
      .from("lessons")
      .select(`
          id,
          test_id,
          topic_id,
          topics!inner (
          unit_id
        )`);

    if (lError) { console.error("lessons fetch error:", lError.message); }

    // Build test_id → { lessonId, unitId } map via topics join
    const testToLesson: Record<string, { lessonId: string; unitId: string }> = {};
    (lessons ?? []).forEach((l: any) => {
      const unitId = l.topics?.unit_id;
      if (l.test_id && unitId) testToLesson[l.test_id] = { lessonId: l.id, unitId };
    });

    // 4. Accumulate XP
    let totalXP = 0;
    (attempts ?? []).forEach((a: any) => { totalXP += a.xp_earned ?? 0; });

    // 5. Build progress map: unitId → lessonId → { completed }
    const progressMap: Record<string, Record<string, LessonProgress>> = {};
    const testedLessons = new Set<string>();

    (testAttempts ?? []).forEach((ta: any) => {
      const mapping = testToLesson[ta.test_id];
      if (!mapping) return;
      const { lessonId, unitId } = mapping;

      testedLessons.add(lessonId);

      if (!progressMap[unitId]) progressMap[unitId] = {};
      progressMap[unitId][lessonId] = { completed: true };
    });

    // 6. Restore visitedLessons from localStorage (survives refresh)
    const storedVisited = localStorage.getItem(`visited_${userId}`);
    const visitedLessons = new Set<string>(
      storedVisited ? JSON.parse(storedVisited) : []
    );

    setUserProgress({
      totalXP,
      progress:       progressMap,
      visitedLessons,
      testedLessons,
    });
  };

  useEffect(() => { refreshProgress(); }, []);

  // ── Mark a lesson as visited (opened) ───────────────
  const markLessonVisited = (lessonId: string) => {
    setUserProgress(prev => {
      if (prev.visitedLessons.has(lessonId)) return prev; // no-op

      const next = new Set(prev.visitedLessons);
      next.add(lessonId);

      // Persist to localStorage so it survives page reload
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.id) {
          localStorage.setItem(
            `visited_${data.user.id}`,
            JSON.stringify([...next])
          );
        }
      });

      return { ...prev, visitedLessons: next };
    });
  };

  // ── Mark a lesson's test as completed ───────────────
  const markLessonTested = (lessonId: string, unitId: string, xpEarned: number) => {
    setUserProgress(prev => {
      const testedNext = new Set(prev.testedLessons);
      testedNext.add(lessonId);

      const progressNext = { ...prev.progress };
      if (!progressNext[unitId]) progressNext[unitId] = {};
      progressNext[unitId] = {
        ...progressNext[unitId],
        [lessonId]: { completed: true },
      };

      return {
        ...prev,
        totalXP:       prev.totalXP + xpEarned,
        progress:      progressNext,
        testedLessons: testedNext,
      };
    });
  };

  return (
    <ProgressContext.Provider value={{ userProgress, markLessonVisited, markLessonTested, refreshProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};