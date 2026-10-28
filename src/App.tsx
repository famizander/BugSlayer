/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActivePage } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { HistoryProvider } from './context/HistoryContext';
import { StreakProvider } from './context/StreakContext';
import { LessonProvider } from './context/LessonContext';
import { LocaleProvider, useLocale } from './context/LocaleContext';
import { Navbar } from './components/Navbar';
import { SolvePage } from './components/SolvePage';
import { ForYouPage } from './components/ForYouPage';
import { RecentPage } from './components/RecentPage';
import { AccountPage } from './components/AccountPage';
import { SettingsPage } from './components/SettingsPage';

function BugSlayerApp() {
  const [activePage, setActivePage] = useState<ActivePage>('solve');
  const { t } = useLocale();

  return (
    <div className="min-h-screen flex flex-col transition-colors selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar activePage={activePage} onNavigate={setActivePage} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activePage === 'solve' && (
          <SolvePage
            onNavigateToRecent={() => setActivePage('recent')}
            onNavigateToAccount={() => setActivePage('account')}
            onNavigateToFyp={() => setActivePage('fyp')}
          />
        )}

        {activePage === 'fyp' && (
          <ForYouPage
            onNavigateToSolve={() => setActivePage('solve')}
            onNavigateToAccount={() => setActivePage('account')}
          />
        )}

        {activePage === 'recent' && (
          <RecentPage
            onNavigateToSolve={() => setActivePage('solve')}
            onNavigateToAccount={() => setActivePage('account')}
            onNavigateToFyp={() => setActivePage('fyp')}
          />
        )}

        {activePage === 'account' && (
          <AccountPage
            onNavigateToSolve={() => setActivePage('solve')}
            onNavigateToRecent={() => setActivePage('recent')}
            onNavigateToSettings={() => setActivePage('settings')}
            onNavigateToFyp={() => setActivePage('fyp')}
          />
        )}

        {activePage === 'settings' && (
          <SettingsPage onNavigateToAccount={() => setActivePage('account')} />
        )}
      </main>

      {/* Student Footer with Strivaholics Team Attribution */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-6 px-4 text-center text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-[#020b18] backdrop-blur-xl transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
            <span className="font-bold text-slate-900 dark:text-white tracking-wide text-base">BugSlayer</span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-700 dark:text-white font-semibold">{t('footer.team')}</span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-600 dark:text-slate-300 font-normal">{t('footer.motto')}</span>
          </div>

          <div className="flex items-center gap-5 text-sm font-medium text-slate-700 dark:text-white">
            <button
              onClick={() => setActivePage('solve')}
              className="text-slate-700 hover:text-blue-600 dark:text-white dark:hover:text-blue-200 transition-colors cursor-pointer"
            >
              {t('nav.solve')}
            </button>
            <button
              onClick={() => setActivePage('fyp')}
              className="text-slate-700 hover:text-blue-600 dark:text-white dark:hover:text-blue-200 transition-colors cursor-pointer"
            >
              {t('nav.fyp')}
            </button>
            <button
              onClick={() => setActivePage('recent')}
              className="text-slate-700 hover:text-blue-600 dark:text-white dark:hover:text-blue-200 transition-colors cursor-pointer"
            >
              {t('nav.recent')}
            </button>
            <button
              onClick={() => setActivePage('account')}
              className="text-slate-700 hover:text-blue-600 dark:text-white dark:hover:text-blue-200 transition-colors cursor-pointer"
            >
              {t('nav.account')}
            </button>
            <button
              onClick={() => setActivePage('settings')}
              className="text-slate-700 hover:text-blue-600 dark:text-white dark:hover:text-blue-200 transition-colors cursor-pointer"
            >
              {t('nav.settings')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <HistoryProvider>
            <StreakProvider>
              <LessonProvider>
                <BugSlayerApp />
              </LessonProvider>
            </StreakProvider>
          </HistoryProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
