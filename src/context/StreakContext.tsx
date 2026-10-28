import React, { createContext, useContext, useEffect, useState } from 'react';

export interface DayActivity {
  dayName: string;
  dateKey: string;
  active: boolean;
  isToday: boolean;
}

export interface StreakContextType {
  streak: number;
  longestStreak: number;
  dailyGoal: number;
  todaySolved: number;
  totalBugsSlayed: number;
  hasCompletedDailyGoal: boolean;
  weeklyActivity: DayActivity[];
  recordBugSlayed: (title?: string) => boolean; // returns true if goal was completed by this action
  setDailyGoal: (goal: number) => void;
  celebrationTriggered: boolean;
  dismissCelebration: () => void;
}

const STORAGE_KEY = 'bugslayer_gamification_streak_v1';

const getTodayDateKey = (date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getYesterdayDateKey = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getTodayDateKey(d);
};

const getTwoDaysAgoKey = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return getTodayDateKey(d);
};

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export const StreakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayKey = getTodayDateKey();
  const yesterdayKey = getYesterdayDateKey();
  const twoDaysAgoKey = getTwoDaysAgoKey();

  const [streak, setStreak] = useState<number>(3);
  const [longestStreak, setLongestStreak] = useState<number>(5);
  const [dailyGoal, setDailyGoalState] = useState<number>(3);
  const [todaySolved, setTodaySolved] = useState<number>(2);
  const [totalBugsSlayed, setTotalBugsSlayed] = useState<number>(14);
  const [activeDates, setActiveDates] = useState<string[]>([twoDaysAgoKey, yesterdayKey, todayKey]);
  const [celebrationTriggered, setCelebrationTriggered] = useState<boolean>(false);

  // Initialize and check daily rollover
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedTodayDate = parsed.todayDate || '';
        const storedLastActive = parsed.lastActiveDate || '';
        let currentStreakVal = parsed.streak ?? 3;
        let todaySolvedVal = parsed.todaySolved ?? 0;
        let storedActiveDates: string[] = Array.isArray(parsed.activeDates) ? parsed.activeDates : [];

        if (storedTodayDate !== todayKey) {
          // New day rollover
          todaySolvedVal = 0;
          if (storedLastActive === yesterdayKey) {
            // Maintained consecutive streak from yesterday
            currentStreakVal = Math.max(currentStreakVal, 1);
          } else if (storedLastActive === todayKey) {
            // Already active today
          } else {
            // Missed more than 1 day
            currentStreakVal = 0;
          }
        }

        setStreak(currentStreakVal);
        setLongestStreak(parsed.longestStreak ?? Math.max(currentStreakVal, 5));
        setDailyGoalState(parsed.dailyGoal ?? 3);
        setTodaySolved(todaySolvedVal);
        setTotalBugsSlayed(parsed.totalBugsSlayed ?? 14);
        setActiveDates(storedActiveDates.length > 0 ? storedActiveDates : [twoDaysAgoKey, yesterdayKey, todayKey]);
      } else {
        // Initial setup for engaging student gamification
        const initial = {
          streak: 3,
          longestStreak: 5,
          dailyGoal: 3,
          todayDate: todayKey,
          lastActiveDate: todayKey,
          todaySolved: 2,
          totalBugsSlayed: 14,
          activeDates: [twoDaysAgoKey, yesterdayKey, todayKey],
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch (e) {
      console.error('Failed to parse streak gamification state', e);
    }
  }, [todayKey, yesterdayKey, twoDaysAgoKey]);

  // Persist state
  const saveState = (
    newStreak: number,
    newTodaySolved: number,
    newTotal: number,
    newDates: string[],
    newGoal = dailyGoal,
    newLongest = longestStreak
  ) => {
    setStreak(newStreak);
    setTodaySolved(newTodaySolved);
    setTotalBugsSlayed(newTotal);
    setActiveDates(newDates);
    setDailyGoalState(newGoal);
    setLongestStreak(newLongest);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          streak: newStreak,
          longestStreak: newLongest,
          dailyGoal: newGoal,
          todayDate: todayKey,
          lastActiveDate: todayKey,
          todaySolved: newTodaySolved,
          totalBugsSlayed: newTotal,
          activeDates: newDates,
        })
      );
    } catch (e) {
      console.error('Failed to save streak data', e);
    }
  };

  const recordBugSlayed = (): boolean => {
    const updatedTodaySolved = todaySolved + 1;
    const updatedTotal = totalBugsSlayed + 1;

    let updatedDates = [...activeDates];
    if (!updatedDates.includes(todayKey)) {
      updatedDates.push(todayKey);
    }

    // Ensure streak is counted for today
    let updatedStreak = streak;
    if (updatedStreak === 0) {
      updatedStreak = 1;
    }
    const updatedLongest = Math.max(longestStreak, updatedStreak);

    const justCompleted = updatedTodaySolved === dailyGoal;
    if (justCompleted) {
      setCelebrationTriggered(true);
    }

    saveState(updatedStreak, updatedTodaySolved, updatedTotal, updatedDates, dailyGoal, updatedLongest);
    return justCompleted;
  };

  const setDailyGoal = (goal: number) => {
    const safeGoal = Math.max(1, goal);
    setDailyGoalState(safeGoal);
    saveState(streak, todaySolved, totalBugsSlayed, activeDates, safeGoal, longestStreak);
  };

  const dismissCelebration = () => {
    setCelebrationTriggered(false);
  };

  // Generate 7-day activity array for the weekly strip
  const weeklyActivity: DayActivity[] = React.useMemo(() => {
    const days: DayActivity[] = [];
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Last 7 days ending with today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateKey = getTodayDateKey(d);
      const dayName = dayNames[d.getDay()];
      const isToday = i === 0;
      const active = activeDates.includes(dateKey) || (isToday && todaySolved > 0);

      days.push({
        dayName,
        dateKey,
        active,
        isToday,
      });
    }

    return days;
  }, [activeDates, todaySolved]);

  const hasCompletedDailyGoal = todaySolved >= dailyGoal;

  return (
    <StreakContext.Provider
      value={{
        streak,
        longestStreak,
        dailyGoal,
        todaySolved,
        totalBugsSlayed,
        hasCompletedDailyGoal,
        weeklyActivity,
        recordBugSlayed,
        setDailyGoal,
        celebrationTriggered,
        dismissCelebration,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = (): StreakContextType => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};
