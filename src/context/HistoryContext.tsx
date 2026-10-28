import React, { createContext, useContext, useEffect, useState } from 'react';
import { Submission, Language } from '../types';
import { useAuth } from './AuthContext';
import { INITIAL_SUBMISSIONS } from '../services/analyzer';

interface HistoryContextType {
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'id' | 'timestamp' | 'userId'>) => Submission;
  deleteSubmission: (id: string) => void;
  clearHistory: () => void;
  activeSolveCode: { code: string; language: Language; expectedOutput: string; title?: string } | null;
  loadIntoSolve: (submission: Submission) => void;
  loadCodeIntoSolve: (code: string, language: Language, expectedOutput?: string, title?: string) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeSolveCode, setActiveSolveCode] = useState<{
    code: string;
    language: Language;
    expectedOutput: string;
    title?: string;
  } | null>(null);

  // Load submissions whenever user changes
  useEffect(() => {
    if (user) {
      // Authenticated user: load persistent history
      const storageKey = `bugslayer_history_${user.id}`;
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setSubmissions(JSON.parse(stored));
        } else {
          // If demo user without saved history yet, seed with initial demo submissions
          const seeded = INITIAL_SUBMISSIONS.map((s) => ({
            ...s,
            userId: user.id,
          }));
          setSubmissions(seeded);
          localStorage.setItem(storageKey, JSON.stringify(seeded));
        }
      } catch (e) {
        console.error('Failed to load user history', e);
        setSubmissions([]);
      }
    } else {
      // Unauthenticated / Guest: Every time they enter the website, start with an EMPTY history
      setSubmissions([]);
      try {
        localStorage.removeItem('bugslayer_history_guest');
      } catch {
        // ignore
      }
    }
  }, [user]);

  const saveSubmissions = (newItems: Submission[]) => {
    setSubmissions(newItems);
    if (user) {
      try {
        localStorage.setItem(`bugslayer_history_${user.id}`, JSON.stringify(newItems));
      } catch (e) {
        console.error('Failed to save history', e);
      }
    }
  };

  const addSubmission = (
    data: Omit<Submission, 'id' | 'timestamp' | 'userId'>
  ): Submission => {
    const newSubmission: Submission = {
      ...data,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user ? user.id : 'guest',
      timestamp: new Date().toISOString(),
    };

    const updated = [newSubmission, ...submissions];
    saveSubmissions(updated);
    return newSubmission;
  };

  const deleteSubmission = (id: string) => {
    const updated = submissions.filter((s) => s.id !== id);
    saveSubmissions(updated);
  };

  const clearHistory = () => {
    saveSubmissions([]);
  };

  const loadIntoSolve = (submission: Submission) => {
    setActiveSolveCode({
      code: submission.code,
      language: submission.language,
      expectedOutput: submission.expectedOutput,
      title: submission.title,
    });
  };

  const loadCodeIntoSolve = (
    code: string,
    language: Language,
    expectedOutput: string = '',
    title?: string
  ) => {
    setActiveSolveCode({
      code,
      language,
      expectedOutput,
      title: title || `${language === 'cpp' ? 'C++' : 'Python'} Bug Challenge`,
    });
  };

  return (
    <HistoryContext.Provider
      value={{
        submissions,
        addSubmission,
        deleteSubmission,
        clearHistory,
        activeSolveCode,
        loadIntoSolve,
        loadCodeIntoSolve,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
};
