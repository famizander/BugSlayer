import React, { useState, useRef, useEffect } from 'react';
import { useStreak } from '../context/StreakContext';
import { useLocale } from '../context/LocaleContext';
import { ActivePage } from '../types';
import {
  Flame,
  Target,
  Trophy,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  X,
  Zap,
  Calendar,
  Award,
} from 'lucide-react';

interface StreakTrackerProps {
  onNavigate: (page: ActivePage) => void;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ onNavigate }) => {
  const {
    streak,
    longestStreak,
    dailyGoal,
    todaySolved,
    totalBugsSlayed,
    hasCompletedDailyGoal,
    weeklyActivity,
    setDailyGoal,
    celebrationTriggered,
    dismissCelebration,
  } = useStreak();

  const { t } = useLocale();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const percentProgress = Math.min(100, Math.round((todaySolved / Math.max(1, dailyGoal)) * 100));

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button in Navigation Bar */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (celebrationTriggered) dismissCelebration();
        }}
        className={`flex items-center gap-2 py-1 px-2.5 sm:px-3 rounded-full border transition-all cursor-pointer backdrop-blur-md shadow-sm ${
          hasCompletedDailyGoal
            ? 'bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:border-emerald-400'
            : 'bg-slate-100/80 dark:bg-slate-900/60 border-slate-300 dark:border-white/10 hover:border-amber-400/50 text-slate-800 dark:text-slate-200'
        }`}
        title={`Streak: ${streak} days | Daily Goal: ${todaySolved}/${dailyGoal}`}
        aria-label="View daily streak and goal tracker"
      >
        {/* Streak Flame Badge */}
        <div className="flex items-center gap-1">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              streak > 0
                ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-400'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 fill-current ${streak > 0 ? 'animate-bounce' : ''}`} />
          </div>
          <span className="text-xs sm:text-sm font-bold text-black dark:text-white">
            {streak}
            <span className="hidden sm:inline font-semibold text-[11px] text-slate-600 dark:text-slate-400 ml-0.5">
              {t('nav.streakDays', 'd')}
            </span>
          </span>
        </div>

        <span className="text-slate-300 dark:text-slate-600 font-light hidden sm:inline">|</span>

        {/* Daily Goal Mini Progress Ring / Label */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-black dark:text-slate-200">
            {todaySolved}/{dailyGoal}
          </span>

          {/* Mini Progress Bar on desktop */}
          <div className="hidden md:block w-8 h-1.5 bg-slate-300/70 dark:bg-slate-700/80 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                hasCompletedDailyGoal ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-blue-500'
              }`}
              style={{ width: `${percentProgress}%` }}
            />
          </div>

          {hasCompletedDailyGoal && (
            <span className="hidden sm:inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              ✓
            </span>
          )}
        </div>
      </button>

      {/* Floating Popover / Gamification Dashboard */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl glass-panel border border-slate-300 dark:border-white/20 p-5 shadow-2xl z-50 animate-in fade-in zoom-in-95 text-slate-900 dark:text-white bg-white dark:bg-[#07162e]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">{t('streak.title', 'Learning Habit Tracker')}</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{t('streak.subtitle', 'Daily practice builds code intuition')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Streak Hero Card */}
          <div className="mt-4 p-4 rounded-2xl glass-card border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-transparent to-blue-500/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {t('streak.activeStreak', 'Active Streak')}
              </span>
              <div className="text-2xl font-black text-black dark:text-white flex items-center gap-1.5 mt-0.5">
                <span>{streak} {t('streak.days', 'Days')}</span>
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                {streak >= 3
                  ? t('streak.onFire', '🔥 You are on fire! Keep the momentum going.')
                  : t('streak.startDaily', 'Start solving daily to build an unstoppable streak!')}
              </p>
            </div>
            <div className="text-right pl-3 border-l border-black/10 dark:border-white/10">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">{t('streak.bestStreak', 'Best Streak')}</span>
              <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                {longestStreak} {t('streak.days', 'Days')}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold mt-1">{t('streak.slayed', 'Slayed')}</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                {totalBugsSlayed} {t('streak.bugs', 'Bugs')}
              </span>
            </div>
          </div>

          {/* Daily Goal Progress Bar */}
          <div className="mt-4 p-4 rounded-2xl glass-card border border-black/10 dark:border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-black dark:text-white">{t('streak.todaysGoal', "Today's Goal")}</span>
              </div>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                {todaySolved} / {dailyGoal} {t('streak.bugs', 'Bugs')} ({percentProgress}%)
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-black/5 dark:border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  hasCompletedDailyGoal
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-amber-500 via-blue-500 to-indigo-500'
                }`}
                style={{ width: `${percentProgress}%` }}
              />
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
              {hasCompletedDailyGoal ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('streak.goalAchieved', "Daily goal achieved! You're mastering debugging.")}
                </span>
              ) : (
                <span>
                  {dailyGoal - todaySolved} {t('streak.moreBugsNeeded', "more bug(s) to reach today's goal.")}
                </span>
              )}
            </div>
          </div>

          {/* 7-Day Weekly Activity Strip */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>{t('streak.last7Days', 'Last 7 Days')}</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {weeklyActivity.filter((d) => d.active).length} {t('streak.activeDays', 'of 7 active')}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {weeklyActivity.map((day) => (
                <div
                  key={day.dateKey}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border transition-all ${
                    day.active
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300 shadow-sm'
                      : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-400 dark:text-slate-500'
                  } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-[10px] font-bold uppercase">{day.dayName}</span>
                  <div className="mt-1">
                    {day.active ? (
                      <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 my-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Goal Target Adjustment */}
          <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('streak.changeGoal', 'Change Daily Goal:')}</span>
            <div className="flex items-center gap-1.5">
              {[1, 3, 5].map((target) => (
                <button
                  key={target}
                  onClick={() => setDailyGoal(target)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dailyGoal === target
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'glass-input text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {target} {t('streak.bugs', 'Bugs')}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="mt-4 pt-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('solve');
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t('streak.practiceCta', 'Practice & Slay Bugs in Solve')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
