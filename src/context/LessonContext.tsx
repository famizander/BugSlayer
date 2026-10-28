import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useStreak } from './StreakContext';
import { LESSONS } from '../data/lessons';
import { Lesson, LessonCategory } from '../types';

interface ChallengeState {
  selectedOption: number;
  isCorrect: boolean;
}

interface LessonContextType {
  lessons: Lesson[];
  completedLessonIds: string[];
  bookmarkedLessonIds: string[];
  challengeSubmissions: Record<string, ChallengeState>;
  isCompleted: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  toggleLessonCompleted: (id: string, title?: string) => void;
  toggleBookmark: (id: string) => void;
  submitChallenge: (lessonId: string, optionIndex: number) => boolean;
  completedCount: number;
  bookmarkedCount: number;
  getCategoryProgress: (category: LessonCategory) => { completed: number; total: number };
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

export const LessonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { recordBugSlayed } = useStreak();

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [bookmarkedLessonIds, setBookmarkedLessonIds] = useState<string[]>([]);
  const [challengeSubmissions, setChallengeSubmissions] = useState<Record<string, ChallengeState>>({});

  // Storage key is scoped to current user or guest
  const storageKey = user ? `bugslayer_lessons_${user.id}` : 'bugslayer_lessons_guest';

  // Load state when user changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCompletedLessonIds(Array.isArray(parsed.completed) ? parsed.completed : []);
        setBookmarkedLessonIds(Array.isArray(parsed.bookmarked) ? parsed.bookmarked : []);
        setChallengeSubmissions(parsed.challenges || {});
      } else {
        // If guest or new account, give a clean start or seed first beginner lesson as completed for Alex demo user
        if (user && user.id === 'user-demo-1') {
          setCompletedLessonIds(['lesson-cpp-missing-semicolon']);
          setBookmarkedLessonIds(['lesson-py-incorrect-indentation']);
        } else {
          setCompletedLessonIds([]);
          setBookmarkedLessonIds([]);
          setChallengeSubmissions({});
        }
      }
    } catch (e) {
      console.error('Failed to load lesson storage', e);
    }
  }, [user, storageKey]);

  // Persist state
  const saveState = (
    completed: string[],
    bookmarked: string[],
    challenges: Record<string, ChallengeState>
  ) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          completed,
          bookmarked,
          challenges,
        })
      );
    } catch (e) {
      console.error('Failed to persist lesson progress', e);
    }
  };

  const isCompleted = (id: string) => completedLessonIds.includes(id);
  const isBookmarked = (id: string) => bookmarkedLessonIds.includes(id);

  const toggleLessonCompleted = (id: string, title?: string) => {
    let updated: string[];
    if (completedLessonIds.includes(id)) {
      updated = completedLessonIds.filter((item) => item !== id);
    } else {
      updated = [...completedLessonIds, id];
      // Reward the student with streak/bug progress when mastering a new mistake
      recordBugSlayed(title || 'Completed Bug Lesson');
    }
    setCompletedLessonIds(updated);
    saveState(updated, bookmarkedLessonIds, challengeSubmissions);
  };

  const toggleBookmark = (id: string) => {
    let updated: string[];
    if (bookmarkedLessonIds.includes(id)) {
      updated = bookmarkedLessonIds.filter((item) => item !== id);
    } else {
      updated = [...bookmarkedLessonIds, id];
    }
    setBookmarkedLessonIds(updated);
    saveState(completedLessonIds, updated, challengeSubmissions);
  };

  const submitChallenge = (lessonId: string, optionIndex: number): boolean => {
    const lesson = LESSONS.find((l) => l.id === lessonId);
    if (!lesson || !lesson.challenge) return false;

    const isCorrect = optionIndex === lesson.challenge.correctIndex;
    const updatedChallenges = {
      ...challengeSubmissions,
      [lessonId]: {
        selectedOption: optionIndex,
        isCorrect,
      },
    };

    setChallengeSubmissions(updatedChallenges);
    saveState(completedLessonIds, bookmarkedLessonIds, updatedChallenges);

    // If correct, optionally complete the lesson as well if not already completed
    if (isCorrect && !completedLessonIds.includes(lessonId)) {
      const updatedCompleted = [...completedLessonIds, lessonId];
      setCompletedLessonIds(updatedCompleted);
      recordBugSlayed(lesson.title);
      saveState(updatedCompleted, bookmarkedLessonIds, updatedChallenges);
    }

    return isCorrect;
  };

  const getCategoryProgress = (category: LessonCategory) => {
    const totalInCategory = LESSONS.filter((l) => l.category === category).length;
    const completedInCategory = LESSONS.filter(
      (l) => l.category === category && completedLessonIds.includes(l.id)
    ).length;
    return { completed: completedInCategory, total: totalInCategory };
  };

  return (
    <LessonContext.Provider
      value={{
        lessons: LESSONS,
        completedLessonIds,
        bookmarkedLessonIds,
        challengeSubmissions,
        isCompleted,
        isBookmarked,
        toggleLessonCompleted,
        toggleBookmark,
        submitChallenge,
        completedCount: completedLessonIds.length,
        bookmarkedCount: bookmarkedLessonIds.length,
        getCategoryProgress,
      }}
    >
      {children}
    </LessonContext.Provider>
  );
};

export const useLessons = () => {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error('useLessons must be used within a LessonProvider');
  }
  return context;
};
