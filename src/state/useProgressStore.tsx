import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProgressState } from '../types/curriculum';

const STORAGE_KEY = 'agentverse:progress:v1';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_PROGRESS: ProgressState = {
  completedLessons: [],
  completedSteps: {},
  completedChallenges: [],
  quizScores: {},
  completedProjects: [],
  bookmarks: [],
  notes: {},
  streakDays: 1,
  lastActiveDate: todayKey(),
};

function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const today = todayKey();
    let streak = parsed.streakDays ?? 1;
    const last = parsed.lastActiveDate ?? today;
    if (last !== today) {
      const diffMs = new Date(today).getTime() - new Date(last).getTime();
      const diffDays = Math.round(diffMs / 86_400_000);
      if (diffDays === 1) streak += 1;
      else if (diffDays > 1) streak = 1;
    }
    return {
      completedLessons: parsed.completedLessons ?? [],
      completedSteps: parsed.completedSteps ?? {},
      completedChallenges: parsed.completedChallenges ?? [],
      quizScores: parsed.quizScores ?? {},
      completedProjects: parsed.completedProjects ?? [],
      bookmarks: parsed.bookmarks ?? [],
      notes: parsed.notes ?? {},
      streakDays: streak,
      lastActiveDate: today,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

interface ProgressContextValue {
  progress: ProgressState;
  markStepVisited: (lessonId: string, stepId: string, totalSteps: number) => void;
  toggleLessonComplete: (lessonId: string) => void;
  markChallengeComplete: (lessonId: string) => void;
  recordQuizScore: (lessonId: string, pct: number) => void;
  toggleProjectComplete: (projectId: string) => void;
  toggleBookmark: (id: string) => void;
  saveNote: (lessonId: string, text: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(loadProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore storage quota errors
    }
  }, [progress]);

  const markStepVisited = (lessonId: string, stepId: string, totalSteps: number) => {
    setProgress((prev) => {
      const existing = prev.completedSteps[lessonId] ?? [];
      if (existing.includes(stepId)) return prev;
      const nextSteps = [...existing, stepId];
      const shouldCompleteLesson =
        totalSteps > 0 && nextSteps.length >= totalSteps && !prev.completedLessons.includes(lessonId);
      return {
        ...prev,
        lastActiveDate: todayKey(),
        completedSteps: { ...prev.completedSteps, [lessonId]: nextSteps },
        completedLessons: shouldCompleteLesson
          ? [...prev.completedLessons, lessonId]
          : prev.completedLessons,
      };
    });
  };

  const toggleLessonComplete = (lessonId: string) => {
    setProgress((prev) => {
      const exists = prev.completedLessons.includes(lessonId);
      return {
        ...prev,
        lastActiveDate: todayKey(),
        completedLessons: exists
          ? prev.completedLessons.filter((id) => id !== lessonId)
          : [...prev.completedLessons, lessonId],
      };
    });
  };

  const markChallengeComplete = (lessonId: string) => {
    setProgress((prev) => {
      if (prev.completedChallenges.includes(lessonId)) return prev;
      return {
        ...prev,
        lastActiveDate: todayKey(),
        completedChallenges: [...prev.completedChallenges, lessonId],
      };
    });
  };

  const recordQuizScore = (lessonId: string, pct: number) => {
    setProgress((prev) => ({
      ...prev,
      lastActiveDate: todayKey(),
      quizScores: {
        ...prev.quizScores,
        [lessonId]: Math.max(prev.quizScores[lessonId] ?? 0, pct),
      },
    }));
  };

  const toggleProjectComplete = (projectId: string) => {
    setProgress((prev) => {
      const exists = prev.completedProjects.includes(projectId);
      return {
        ...prev,
        lastActiveDate: todayKey(),
        completedProjects: exists
          ? prev.completedProjects.filter((id) => id !== projectId)
          : [...prev.completedProjects, projectId],
      };
    });
  };

  const toggleBookmark = (id: string) => {
    setProgress((prev) => {
      const exists = prev.bookmarks.includes(id);
      return {
        ...prev,
        bookmarks: exists ? prev.bookmarks.filter((b) => b !== id) : [...prev.bookmarks, id],
      };
    });
  };

  const saveNote = (lessonId: string, text: string) => {
    setProgress((prev) => ({
      ...prev,
      notes: { ...prev.notes, [lessonId]: text },
    }));
  };

  const resetProgress = () => {
    setProgress({ ...DEFAULT_PROGRESS, lastActiveDate: todayKey() });
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        markStepVisited,
        toggleLessonComplete,
        markChallengeComplete,
        recordQuizScore,
        toggleProjectComplete,
        toggleBookmark,
        saveNote,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
