import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHistory } from '../context/HistoryContext';
import { useLessons } from '../context/LessonContext';
import { useLocale } from '../context/LocaleContext';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Calendar,
  ArrowRight,
} from 'lucide-react';

import { BugSlayerLogo } from './BugSlayerLogo';

interface AccountPageProps {
  onNavigateToSolve: () => void;
  onNavigateToRecent: () => void;
  onNavigateToSettings: () => void;
  onNavigateToFyp?: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onNavigateToSolve,
  onNavigateToRecent,
  onNavigateToSettings,
  onNavigateToFyp,
}) => {
  const { user, login, register, logout, resetPassword, isLoading } = useAuth();
  const { submissions } = useHistory();
  const { completedCount, lessons } = useLessons();
  const { locale, t } = useLocale();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Status and Validation Alerts
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password modal
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const resetFormAlerts = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormAlerts();

    if (!email.trim() || !password) {
      setErrorMessage(
        locale === 'ms'
          ? 'Sila masukkan emel dan kata laluan anda.'
          : 'Please enter both your email and password.'
      );
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setErrorMessage(
        res.error ||
          (locale === 'ms'
            ? 'Gagal log masuk. Sila semak kelayakan anda.'
            : 'Failed to sign in. Please verify your credentials.')
      );
    } else {
      setSuccessMessage(
        locale === 'ms'
          ? 'Berjaya log masuk! Selamat kembali ke BugSlayer.'
          : 'Successfully signed in! Welcome back to BugSlayer.'
      );
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormAlerts();

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage(
        locale === 'ms'
          ? 'Sila lengkapkan semua maklumat pendaftaran.'
          : 'Please fill in all registration fields.'
      );
      return;
    }

    if (username.trim().length < 2) {
      setErrorMessage(
        locale === 'ms'
          ? 'Nama pengguna mestilah sekurang-kurangnya 2 aksara.'
          : 'Username must be at least 2 characters long.'
      );
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage(
        locale === 'ms'
          ? 'Sila berikan alamat emel yang sah.'
          : 'Please provide a valid email address.'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        locale === 'ms'
          ? 'Kata laluan mestilah sekurang-kurangnya 6 aksara.'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        locale === 'ms' ? 'Kata laluan tidak sepadan. Sila semak semula.' : 'Passwords do not match. Please verify.'
      );
      return;
    }

    const res = await register(username, email, password);
    if (!res.success) {
      setErrorMessage(
        res.error || (locale === 'ms' ? 'Pendaftaran gagal. Sila cuba lagi.' : 'Registration failed. Please try again.')
      );
    } else {
      setSuccessMessage(
        locale === 'ms'
          ? 'Akaun berjaya dicipta! Selamat datang ke BugSlayer.'
          : 'Account created successfully! Welcome to BugSlayer.'
      );
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotStatus(
        locale === 'ms' ? 'Sila masukkan emel akaun anda.' : 'Please enter your account email.'
      );
      return;
    }
    setIsResetting(true);
    const res = await resetPassword(forgotEmail);
    setIsResetting(false);
    setForgotStatus(res.message);
  };

  const handleFillDemo = () => {
    setEmail('student@bugslayer.dev');
    setPassword('student123');
    resetFormAlerts();
  };

  // If already logged in: State B
  if (user) {
    const formattedJoinDate = (() => {
      try {
        return new Date(user.createdAt).toLocaleDateString(locale === 'ms' ? 'ms-MY' : 'en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      } catch {
        return locale === 'ms' ? 'Ahli Baharu' : 'Recent Member';
      }
    })();

    const userSubmissions = submissions.filter((s) => s.userId === user.id);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* State B: Profile Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-400 shadow-lg shadow-blue-500/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 border-2 border-blue-400">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.username}</h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-400 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {locale === 'ms' ? 'Log Masuk' : 'Logged In'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  {user.email}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  {t('account.memberSince', 'Member Since')} {formattedJoinDate}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl glass-button hover:bg-rose-100 dark:hover:bg-rose-950/50 hover:border-rose-400 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-300 transition-all text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('account.logout', 'Log Out')}</span>
            </button>
          </div>

          {/* Account Metrics and Learning Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
            <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/20">
              <span className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                {t('settings.yourPlan', 'Current Plan')}
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-blue-700 dark:text-blue-300 uppercase">
                  {t('settings.freePlan')}
                </span>
                <button
                  onClick={onNavigateToSettings}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  {locale === 'ms' ? 'Urus' : 'Manage'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/20">
              <span className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                {t('account.totalSubmissions', 'Saved Submissions')}
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {userSubmissions.length}
                </span>
                <button
                  onClick={onNavigateToRecent}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  {locale === 'ms' ? 'Lihat Semua' : 'View All'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/20">
              <span className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                {t('account.lessonsCompleted', 'Lessons Completed')}
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {completedCount} <span className="text-xs text-slate-500 font-normal">/ {lessons.length}</span>
                </span>
                {onNavigateToFyp && (
                  <button
                    onClick={onNavigateToFyp}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                  >
                    {t('nav.feed', 'Feed')}
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/20">
              <span className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                {locale === 'ms' ? 'Bahasa Dilatih' : 'Languages Practiced'}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-black dark:text-blue-200 text-xs font-black border border-blue-300 dark:border-blue-400/30 backdrop-blur-md">
                  C++
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-black dark:text-amber-200 text-xs font-black border border-amber-300 dark:border-amber-400/30 backdrop-blur-md">
                  Python
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-700 dark:text-slate-300">
              {locale === 'ms' ? 'Sedia untuk belajar dan menyelesaikan lebih banyak kod?' : 'Ready to learn and debug more code?'}
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {onNavigateToFyp && (
                <button
                  onClick={onNavigateToFyp}
                  className="px-4 py-2 rounded-xl glass-button text-xs font-bold text-blue-600 dark:text-blue-400 hover:border-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('solve.browseFyp', 'Browse "For You" Feed')}</span>
                </button>
              )}
              <button
                onClick={onNavigateToRecent}
                className="px-4 py-2 rounded-xl glass-button text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                {t('recent.title', 'Recent Submissions')}
              </button>
              <button
                onClick={onNavigateToSolve}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('account.jumpToSolve', 'Open Solve Editor')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State A: User is NOT logged in -> Login & Create Account Forms
  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-[#071933] border border-blue-500/40 items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-1 logo-dark-bg">
          <BugSlayerLogo size="lg" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          {locale === 'ms' ? 'Selamat Datang ke BugSlayer' : 'Welcome to BugSlayer'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
          {locale === 'ms'
            ? 'Fahami kesilapan anda. Perbaiki kod anda. Jadi pengaturcara yang lebih mahir.'
            : 'Understand your mistakes. Improve your coding. Become a better programmer.'}
        </p>
      </div>

      {/* Auth Card Container */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/20">
        {/* Tab switch between Login and Create Account */}
        <div className="grid grid-cols-2 p-1.5 glass-input rounded-2xl mb-6 bg-slate-100 dark:bg-transparent">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              resetFormAlerts();
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('account.loginBtn', 'Log In')}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              resetFormAlerts();
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('account.registerBtn', 'Create Account')}
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-100 text-rose-950 dark:bg-rose-950/60 dark:text-rose-300 backdrop-blur-md border border-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-100 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-300 backdrop-blur-md border border-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* State A - Login Form */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span>{t('account.email', 'Email Address')}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@bugslayer.dev"
                required
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span>{t('account.password', 'Password')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 font-bold"
                >
                  {t('account.forgotPassword', 'Forgot password?')}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 glass-input rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('account.loggingIn', 'Signing In...')}</span>
                </>
              ) : (
                <>
                  <span>{t('account.loginBtn', 'Log In')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Fill button */}
            <div className="pt-3 border-t border-black/10 dark:border-white/10 text-center">
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs text-blue-600 dark:text-blue-300 hover:underline font-bold cursor-pointer"
              >
                {t('account.fillDemo', 'Use Student Demo Account')}
              </button>
            </div>
          </form>
        ) : (
          /* State A - Create Account Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span>{t('account.username', 'Username')}</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Alex Dev"
                required
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span>{t('account.email', 'Email Address')}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@university.edu"
                required
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span>{t('account.password', 'Password')}</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 glass-input rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span>{t('account.confirmPassword', 'Confirm Password')}</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 glass-input rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('account.creating', 'Creating Account...')}</span>
                </>
              ) : (
                <>
                  <span>{t('account.registerBtn', 'Create Account')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#092244] border border-slate-300 dark:border-[#1c4b87] rounded-2xl max-w-sm w-full p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#184277]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('account.resetPassword', 'Reset Password')}</h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotStatus(null);
                }}
                className="text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white text-xs px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {locale === 'ms'
                ? 'Masukkan alamat emel berdaftar anda untuk menerima panduan pemulihan kata laluan.'
                : 'Enter your registered email address and we will provide password recovery guidance.'}
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="your.email@university.edu"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#040e1f] border border-slate-300 dark:border-[#173a69] rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {forgotStatus && (
                <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 border border-blue-400 dark:border-blue-500/40 text-blue-900 dark:text-blue-200 text-xs">
                  {forgotStatus}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotStatus(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white bg-slate-100 dark:bg-[#0c2a55] cursor-pointer"
                >
                  {t('recent.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md cursor-pointer"
                >
                  {isResetting ? (locale === 'ms' ? 'Menghantar...' : 'Sending...') : t('account.sendResetLink', 'Send Reset Link')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
