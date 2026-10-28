import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import {
  Sun,
  Moon,
  Check,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  Globe,
} from 'lucide-react';

interface SettingsPageProps {
  onNavigateToAccount: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateToAccount }) => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { locale, setLocale, t } = useLocale();

  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header in Glassmorphism Container */}
      <div className="glass-panel rounded-2xl p-5 border border-black/10 dark:border-white/10 shadow-lg bg-white/70 dark:bg-black/20">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white flex items-center gap-2">
          <span>{t('settings.title')}</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-1.5">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* 1. Appearance Settings Section */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-white space-y-5 border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500 dark:text-amber-300" />
            <span>{t('settings.appearance')}</span>
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
            {t('settings.appearanceDesc')}
          </p>
        </div>

        {/* Theme Selectable Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Theme Card */}
          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              theme === 'dark'
                ? 'glass-card border-blue-500 shadow-xl shadow-blue-500/20'
                : 'glass-input border-transparent hover:border-slate-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-950/80 flex items-center justify-center text-blue-300 border border-blue-500/30 backdrop-blur-md">
                    <Moon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-black dark:text-white">{t('settings.dark')}</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{t('settings.darkDesc')}</p>
                  </div>
                </div>
                {theme === 'dark' && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Mini Preview Box */}
              <div className="rounded-xl p-2.5 bg-slate-900 border border-white/10 space-y-1.5 font-mono text-[11px]">
                <div className="h-2 w-12 bg-blue-500 rounded" />
                <div className="h-1.5 w-full bg-slate-700/60 rounded" />
                <div className="h-1.5 w-3/4 bg-slate-700/40 rounded" />
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <span>{t('settings.darkNote')}</span>
            </div>
          </div>

          {/* Light Theme Card */}
          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              theme === 'light'
                ? 'glass-card border-blue-500 shadow-xl shadow-blue-500/20'
                : 'glass-input border-transparent hover:border-slate-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 border border-amber-500/30 backdrop-blur-md">
                    <Sun className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-black dark:text-white">{t('settings.light')}</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{t('settings.lightDesc')}</p>
                  </div>
                </div>
                {theme === 'light' && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Mini Preview Box */}
              <div className="rounded-xl p-2.5 bg-slate-100 border border-slate-300 space-y-1.5 font-mono text-[11px]">
                <div className="h-2 w-12 bg-blue-600 rounded" />
                <div className="h-1.5 w-full bg-slate-300 rounded" />
                <div className="h-1.5 w-3/4 bg-slate-200 rounded" />
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <span>{t('settings.lightNote')}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>{t('settings.themeNote')}</span>
        </div>
      </section>

      {/* 2. Language Preference Section */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-white space-y-5 border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{t('settings.language')}</span>
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
            {t('settings.languageDesc')}
          </p>
        </div>

        {/* Language Selectable Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* English Card */}
          <div
            onClick={() => setLocale('en')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              locale === 'en'
                ? 'glass-card border-blue-500 shadow-xl shadow-blue-500/20'
                : 'glass-input border-transparent hover:border-slate-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-700 dark:text-blue-300 border border-blue-400/30 backdrop-blur-md text-base">
                    🇬🇧
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-black dark:text-white">{t('settings.english')}</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{t('settings.englishNative')}</p>
                  </div>
                </div>
                {locale === 'en' && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('settings.englishDesc')}
              </p>
            </div>
            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
              <span>English (United States / UK / Global)</span>
            </div>
          </div>

          {/* Bahasa Melayu Card */}
          <div
            onClick={() => setLocale('ms')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              locale === 'ms'
                ? 'glass-card border-blue-500 shadow-xl shadow-blue-500/20'
                : 'glass-input border-transparent hover:border-slate-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md text-base">
                    🇲🇾
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-black dark:text-white">{t('settings.malay')}</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{t('settings.malayNative')}</p>
                  </div>
                </div>
                {locale === 'ms' && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('settings.malayDesc')}
              </p>
            </div>
            <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span>Bahasa Melayu untuk pelajar Malaysia</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>
            {locale === 'ms'
              ? 'Bahasa pilihan disimpan secara setempat dalam pelayar web anda.'
              : 'Language preference is automatically saved to your browser.'}
          </span>
        </div>
      </section>

      {/* 3. Subscription Plan Section */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-white space-y-6 border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/10 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>{t('settings.subscription')}</span>
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
              {t('settings.subscriptionDesc')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">{t('settings.yourPlan')}</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-400/40 backdrop-blur-md">
              {t('settings.freePlan')}
            </span>
          </div>
        </div>

        {/* Unauthenticated notice */}
        {!user && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {locale === 'ms'
                  ? 'Anda sedang melihat sebagai tetamu. Sila log masuk untuk mengurus status akaun anda.'
                  : 'You are currently browsing as a guest. Please log in to manage your account-specific subscription status.'}
              </span>
            </div>
            <button
              onClick={onNavigateToAccount}
              className="text-xs font-semibold px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white shrink-0 cursor-pointer shadow-md"
            >
              {t('nav.login')}
            </button>
          </div>
        )}

        {/* Plans Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free Plan Card */}
          <div className="student-plan-box p-5 rounded-2xl glass-card border-2 border-blue-500/40 flex flex-col justify-between space-y-4 relative shadow-lg bg-white/70 dark:bg-black/20">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-400/30 backdrop-blur-md">
                    {locale === 'ms' ? 'Percuma' : 'Free'}
                  </span>
                  <h3 className="text-xl font-bold text-black dark:text-white mt-2">
                    {locale === 'ms' ? 'Pelan Pelajar Percuma' : 'Student Free'}
                  </h3>
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                    RM 0 <span className="text-xs text-slate-600 dark:text-slate-400 font-normal">{locale === 'ms' ? '/ selama-lamanya' : '/ forever'}</span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 backdrop-blur-md">
                  {locale === 'ms' ? 'Pelan Aktif' : 'Active Plan'}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 space-y-2.5 text-xs text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{locale === 'ms' ? 'Pengesanan ralat C++ & Python' : 'C++ & Python error detection'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{locale === 'ms' ? 'Petunjuk Sokrates langkah demi langkah' : 'Socratic hints delivered one at a time'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{locale === 'ms' ? 'Pencari baris diagnostik & penjelasan konsep' : 'Diagnostic line locator & conceptual explanation'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{locale === 'ms' ? 'Simpan sejarah penyerahan terkini secara setempat' : 'Save recent submissions history locally'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="w-full py-2.5 rounded-xl glass-input text-black dark:text-slate-300 text-xs font-bold text-center border border-black/10 dark:border-white/10">
                {locale === 'ms' ? 'Pelan Aktif Semasa' : 'Current Active Plan'}
              </div>
            </div>
          </div>

          {/* Premium Plan Card */}
          <div className="p-5 rounded-2xl glass-card border border-black/10 dark:border-white/10 hover:border-blue-400/50 transition-all flex flex-col justify-between space-y-4 relative shadow-lg bg-white/70 dark:bg-black/20">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-400/30 backdrop-blur-md">
                    Premium
                  </span>
                  <h3 className="text-xl font-bold text-black dark:text-white mt-2">BugSlayer Pro</h3>
                  <div className="premium-price-text text-2xl font-extrabold text-black dark:text-white mt-1">
                    RM 9.99 <span className="text-xs text-slate-600 dark:text-slate-400 font-normal">{locale === 'ms' ? '/ bulan (kad pelajar)' : '/ month (with student ID)'}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-100 dark:bg-blue-600/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-400/40 backdrop-blur-md">
                  {locale === 'ms' ? 'Akan Datang' : 'Coming Soon'}
                </span>
              </div>

              <div className="premium-plan-features mt-4 pt-4 border-t border-black/10 dark:border-white/10 space-y-2.5 text-xs text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{locale === 'ms' ? 'Semua ciri dalam Pelan Percuma' : 'Everything in Free'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{locale === 'ms' ? 'Sejarah tanpa had & sinkronisasi berbilang peranti' : 'Unlimited submission history & multi-device sync'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{locale === 'ms' ? 'Model memori interaktif & visualisasi langkah demi langkah' : 'Interactive memory model & step-by-step visualizer'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{locale === 'ms' ? 'Penjana kes ujian automatik untuk ralat terpencil' : 'Automated test case generator for tricky edge bugs'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{locale === 'ms' ? 'Terokai Peningkatan Premium' : 'Explore Premium Upgrade'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel border border-slate-300 dark:border-white/20 rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-900 dark:text-white space-y-4 bg-white dark:bg-[#07162e]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">BugSlayer Premium</h3>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl glass-input border border-blue-400/30 text-xs text-slate-800 dark:text-blue-200 leading-relaxed space-y-2 bg-blue-50/50 dark:bg-transparent">
              <p className="font-semibold text-slate-900 dark:text-white">
                {locale === 'ms' ? 'Makluman Gerbang Pembayaran:' : 'Payment Gateway Notice:'}
              </p>
              <p>
                {locale === 'ms'
                  ? 'Peningkatan BugSlayer Premium kini dalam fasa ujian rintis peribadi bersama universiti rakan kongsi.'
                  : 'BugSlayer Premium upgrades are currently in private pilot testing with university partners.'}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {locale === 'ms'
                  ? 'Akaun pelajar anda mempunyai akses penuh percuma kepada semua enjin petunjuk Sokrates C++ & Python.'
                  : 'In the meantime, your student account has access to all Socratic C++ & Python hint engines and debugging workflows on the Free tier at zero cost.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {locale === 'ms' ? 'Faham, Terima Kasih!' : 'Got It, Thanks!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
