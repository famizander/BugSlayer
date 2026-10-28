import React, { useState, useMemo } from 'react';
import { Language, Lesson, LessonCategory, LessonDifficulty } from '../types';
import { useLessons } from '../context/LessonContext';
import { useHistory } from '../context/HistoryContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Bookmark,
  Play,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  HelpCircle,
  X,
  Code2,
  Flame,
  Info,
  GraduationCap,
  Layers,
  Award,
} from 'lucide-react';

interface ForYouPageProps {
  onNavigateToSolve: () => void;
  onNavigateToAccount: () => void;
}

export const ForYouPage: React.FC<ForYouPageProps> = ({
  onNavigateToSolve,
  onNavigateToAccount,
}) => {
  const { user } = useAuth();
  const { submissions, loadCodeIntoSolve } = useHistory();
  const { t } = useLocale();
  const {
    lessons,
    completedLessonIds,
    bookmarkedLessonIds,
    challengeSubmissions,
    isCompleted,
    isBookmarked,
    toggleLessonCompleted,
    toggleBookmark,
    submitChallenge,
    completedCount,
    bookmarkedCount,
  } = useLessons();

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | Language>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | LessonCategory>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | LessonDifficulty>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'newest' | 'difficulty-asc' | 'difficulty-desc'>('recommended');
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState<boolean>(false);
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);

  // Divide between Learned and Not Learned section view mode
  const [learningSection, setLearningSection] = useState<'all' | 'not-learned' | 'learned'>('all');

  // Expanded cards state for explanations & solutions
  const [expandedLessonIds, setExpandedLessonIds] = useState<Record<string, boolean>>({});

  // Copied code feedback toast { [lessonId + type]: boolean }
  const [copiedKeys, setCopiedKeys] = useState<Record<string, boolean>>({});

  // Active challenge feedback
  const [challengeFeedback, setChallengeFeedback] = useState<Record<string, { revealed: boolean; selectedIndex: number | null }>>({});

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeys((prev) => ({ ...prev, [key]: true }));
    showToast(t('fyp.toastCopied', 'Code copied to clipboard!'));
    setTimeout(() => {
      setCopiedKeys((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const toggleExpand = (lessonId: string) => {
    setExpandedLessonIds((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  // Analyze user's history to identify frequent mistake categories and language
  const userHistoryAnalysis = useMemo(() => {
    if (!submissions || submissions.length === 0) {
      return {
        hasHistory: false,
        topLanguage: null as Language | null,
        frequentCategories: [] as LessonCategory[],
        reasonMap: {} as Record<string, string>,
      };
    }

    let cppCount = 0;
    let pyCount = 0;
    const categoryHits: Record<string, number> = {};
    const reasonMap: Record<string, string> = {};

    submissions.forEach((sub) => {
      if (sub.language === 'cpp') cppCount++;
      if (sub.language === 'python') pyCount++;

      const text = `${sub.title} ${sub.errorSummary} ${sub.compilerOutput}`.toLowerCase();

      if (text.includes('semicolon') || text.includes("expected ';'") || text.includes('syntax')) {
        categoryHits['Syntax'] = (categoryHits['Syntax'] || 0) + 2;
        reasonMap['Syntax'] = 'Recent missing semicolon or syntax errors in Solve';
      }
      if (text.includes('not declared') || text.includes('nameerror') || text.includes('unbound') || text.includes('variable')) {
        categoryHits['Variables'] = (categoryHits['Variables'] || 0) + 2;
        reasonMap['Variables'] = 'Recent variable scope or declaration errors in Solve';
      }
      if (text.includes('indent') || text.includes('indentation')) {
        categoryHits['Syntax'] = (categoryHits['Syntax'] || 0) + 2;
        reasonMap['Syntax'] = 'Recent Python indentation errors in Solve';
      }
      if (text.includes('type') || text.includes('cannot convert') || text.includes('typeerror')) {
        categoryHits['Data Types'] = (categoryHits['Data Types'] || 0) + 2;
        reasonMap['Data Types'] = 'Recent data type mismatch or concatenation errors';
      }
      if (text.includes('bounds') || text.includes('index') || text.includes('indexerror') || text.includes('segmentation')) {
        categoryHits['Arrays & Indexing'] = (categoryHits['Arrays & Indexing'] || 0) + 2;
        reasonMap['Arrays & Indexing'] = 'Recent array index or list boundary issues';
      }
      if (text.includes('loop') || text.includes('infinite') || text.includes('while')) {
        categoryHits['Loops'] = (categoryHits['Loops'] || 0) + 2;
        reasonMap['Loops'] = 'Recent loop counter or termination issues';
      }
      if (text.includes('assignment') || text.includes('==') || text.includes('truth value')) {
        categoryHits['Conditionals'] = (categoryHits['Conditionals'] || 0) + 2;
        reasonMap['Conditionals'] = 'Recent = vs == conditional assignment issues';
      }
      if (text.includes('return') || text.includes('non-void')) {
        categoryHits['Functions'] = (categoryHits['Functions'] || 0) + 2;
        reasonMap['Functions'] = 'Recent function return value or scope issues';
      }
    });

    const topLanguage: Language = cppCount >= pyCount ? 'cpp' : 'python';
    const sortedCategories = Object.entries(categoryHits)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat as LessonCategory);

    return {
      hasHistory: true,
      topLanguage,
      frequentCategories: sortedCategories,
      reasonMap,
    };
  }, [submissions]);

  // Determine if a lesson is recommended for the current user
  const getRecommendationReason = (lesson: Lesson): string | null => {
    if (!userHistoryAnalysis.hasHistory) {
      return null;
    }

    if (userHistoryAnalysis.frequentCategories.includes(lesson.category)) {
      return userHistoryAnalysis.reasonMap[lesson.category] || `Recommended for your recent ${lesson.category} mistakes`;
    }

    if (lesson.language === userHistoryAnalysis.topLanguage && lesson.difficulty === 'Beginner') {
      return `Recommended: Core ${lesson.language === 'cpp' ? 'C++' : 'Python'} essential`;
    }

    return null;
  };

  // Filter and sort lessons
  const filteredLessons = useMemo(() => {
    return lessons
      .filter((lesson) => {
        // Language filter
        if (selectedLanguage !== 'all' && lesson.language !== selectedLanguage) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && lesson.category !== selectedCategory) {
          return false;
        }

        // Difficulty filter
        if (selectedDifficulty !== 'all' && lesson.difficulty !== selectedDifficulty) {
          return false;
        }

        // Bookmarked only
        if (showOnlyBookmarked && !isBookmarked(lesson.id)) {
          return false;
        }

        // Hide completed
        if (hideCompleted && isCompleted(lesson.id)) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = lesson.title.toLowerCase().includes(q);
          const matchDesc = lesson.description.toLowerCase().includes(q);
          const matchCat = lesson.category.toLowerCase().includes(q);
          const matchLang = (lesson.language === 'cpp' ? 'c++ cpp' : 'python py').includes(q);
          const matchErr = (lesson.commonErrorMessage || '').toLowerCase().includes(q);
          const matchTags = (lesson.tags || []).some((tTag) => tTag.toLowerCase().includes(q));
          const matchCode = lesson.buggyCode.toLowerCase().includes(q) || lesson.correctedCode.toLowerCase().includes(q);

          if (!matchTitle && !matchDesc && !matchCat && !matchLang && !matchErr && !matchTags && !matchCode) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recommended') {
          const recA = getRecommendationReason(a) ? 1 : 0;
          const recB = getRecommendationReason(b) ? 1 : 0;
          if (recA !== recB) return recB - recA;

          const compA = isCompleted(a.id) ? 1 : 0;
          const compB = isCompleted(b.id) ? 1 : 0;
          if (compA !== compB) return compA - compB;

          const diffRank = { Beginner: 1, Intermediate: 2, Advanced: 3 };
          return diffRank[a.difficulty] - diffRank[b.difficulty];
        }

        if (sortBy === 'newest') {
          return (b.dateAdded || '').localeCompare(a.dateAdded || '');
        }

        if (sortBy === 'difficulty-asc') {
          const diffRank = { Beginner: 1, Intermediate: 2, Advanced: 3 };
          return diffRank[a.difficulty] - diffRank[b.difficulty];
        }

        if (sortBy === 'difficulty-desc') {
          const diffRank = { Beginner: 1, Intermediate: 2, Advanced: 3 };
          return diffRank[b.difficulty] - diffRank[a.difficulty];
        }

        return 0;
      });
  }, [
    lessons,
    selectedLanguage,
    selectedCategory,
    selectedDifficulty,
    showOnlyBookmarked,
    hideCompleted,
    searchQuery,
    sortBy,
    userHistoryAnalysis,
    bookmarkedLessonIds,
    completedLessonIds,
  ]);

  // Divided arrays: Not Learned Yet vs Learned
  const notLearnedLessons = useMemo(
    () => filteredLessons.filter((l) => !isCompleted(l.id)),
    [filteredLessons, completedLessonIds]
  );
  const learnedLessons = useMemo(
    () => filteredLessons.filter((l) => isCompleted(l.id)),
    [filteredLessons, completedLessonIds]
  );

  // Categories list
  const categories: LessonCategory[] = [
    'Syntax',
    'Variables',
    'Data Types',
    'Logic',
    'Conditionals',
    'Loops',
    'Functions',
    'Arrays & Indexing',
    'Input/Output',
    'Language Quirks',
  ];

  const handleTryInSolve = (lesson: Lesson) => {
    loadCodeIntoSolve(
      lesson.buggyCode,
      lesson.language,
      lesson.expectedOutput || '',
      `Debugging: ${lesson.title}`
    );
    showToast(t('fyp.toastLoadedSolve', 'Loaded into Solve editor!'));
    onNavigateToSolve();
  };

  const handleChallengeGuess = (lessonId: string, optionIndex: number) => {
    const isCorrect = submitChallenge(lessonId, optionIndex);
    setChallengeFeedback((prev) => ({
      ...prev,
      [lessonId]: { revealed: true, selectedIndex: optionIndex },
    }));

    if (isCorrect) {
      showToast(t('fyp.toastCorrectSpot', 'Correct! Great bug spotting!'));
    } else {
      showToast(t('fyp.toastIncorrectSpot', 'Not quite. Review the explanation below!'));
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setShowOnlyBookmarked(false);
    setHideCompleted(false);
    setLearningSection('all');
    setSortBy('recommended');
  };

  const completionPercentage = Math.round((completedCount / (lessons.length || 1)) * 100);

  // Reusable card renderer
  const renderLessonCard = (lesson: Lesson) => {
    const isExpanded = !!expandedLessonIds[lesson.id];
    const completed = isCompleted(lesson.id);
    const bookmarked = isBookmarked(lesson.id);
    const recommendation = getRecommendationReason(lesson);
    const challengeState = challengeSubmissions[lesson.id];
    const hasGuessedChallenge = !!challengeState || !!challengeFeedback[lesson.id]?.revealed;

    return (
      <article
        key={lesson.id}
        className={`rounded-2xl sm:rounded-3xl glass-card border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
          completed
            ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/10'
            : 'border-slate-200 dark:border-white/10 hover:border-blue-500/40'
        }`}
      >
        {/* Header: Badges and Action Buttons */}
        <div className="p-4 sm:p-5 pb-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Language Badge: Always black text in light mode */}
              <span
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                  lesson.language === 'cpp'
                    ? 'bg-blue-100 dark:bg-blue-500/20 text-black dark:text-blue-200 border border-blue-400 dark:border-blue-400/40 shadow-xs'
                    : 'bg-amber-100 dark:bg-amber-500/20 text-black dark:text-amber-200 border border-amber-400 dark:border-amber-400/40 shadow-xs'
                }`}
              >
                {lesson.language === 'cpp' ? 'C++' : 'Python'}
              </span>

              {/* Category Badge */}
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                {lesson.category}
              </span>

              {/* Difficulty Badge */}
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  lesson.difficulty === 'Beginner'
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300'
                    : lesson.difficulty === 'Intermediate'
                    ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-900 dark:text-yellow-300'
                    : 'bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300'
                }`}
              >
                {lesson.difficulty === 'Beginner'
                  ? t('fyp.beginner', 'Beginner')
                  : lesson.difficulty === 'Intermediate'
                  ? t('fyp.intermediate', 'Intermediate')
                  : t('fyp.advanced', 'Advanced')}
              </span>

              {/* Recommendation Badge if matched */}
              {recommendation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-400/30">
                  <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span>{recommendation}</span>
                </span>
              )}
            </div>

            {/* Top Right Actions: Bookmark & Completed indicator */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toggleBookmark(lesson.id);
                  showToast(
                    bookmarked
                      ? t('fyp.toastRemovedBookmark', 'Removed from saved')
                      : t('fyp.toastSavedBookmark', 'Saved to your bookmarks!')
                  );
                }}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  bookmarked
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300'
                    : 'glass-button text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
                title={bookmarked ? 'Saved to bookmarks' : 'Save bookmark'}
                aria-label="Bookmark lesson"
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => {
                  toggleLessonCompleted(lesson.id, lesson.title);
                  showToast(
                    completed
                      ? t('fyp.toastMarkedUnlearned', 'Marked as unlearned')
                      : t('fyp.toastMarkedLearned', 'Marked as learned! Streak updated! 🔥')
                  );
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  completed
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'glass-button text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
                title={completed ? 'Completed' : 'Mark as learned'}
              >
                {completed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('fyp.learned', 'Learned')}</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 text-slate-400" />
                    <span>{t('fyp.markLearned', 'Mark Learned')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Lesson Title & Description */}
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
            {lesson.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3 line-clamp-2 hover:line-clamp-none transition-all">
            {lesson.description}
          </p>

          {/* Common Error / Traceback snippet banner if available */}
          {lesson.commonErrorMessage && (
            <div className="mb-3 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-mono flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="break-all">{lesson.commonErrorMessage}</span>
            </div>
          )}

          {/* Buggy Code Box: Adaptive light/dark styling with NO forced black */}
          <div className="rounded-xl overflow-hidden border border-rose-300 dark:border-rose-500/30 mb-3.5 shadow-xs">
            <div className="bg-rose-50 dark:bg-[#030814] px-3.5 py-1.5 border-b border-rose-200 dark:border-rose-500/20 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
                <span>{t('fyp.buggyCode', 'Buggy Code')}</span> ({lesson.language === 'cpp' ? 'C++' : 'Python'})
              </span>

              <button
                onClick={() => copyToClipboard(lesson.buggyCode, `${lesson.id}-buggy`)}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Copy buggy code"
              >
                {copiedKeys[`${lesson.id}-buggy`] ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t('solve.copied', 'Copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t('solve.copy', 'Copy')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Snippet with Line Numbers */}
            <div className="bg-white dark:bg-[#040e20] p-3 font-mono text-xs overflow-x-auto leading-relaxed max-h-48 overflow-y-auto border-t border-rose-100 dark:border-transparent">
              <table className="w-full border-collapse">
                <tbody>
                  {lesson.buggyCode.split('\n').map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-100/60 dark:hover:bg-white/5">
                      <td className="pr-3 text-right select-none text-slate-400 dark:text-slate-500 w-6 align-top text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="text-slate-900 dark:text-slate-100 whitespace-pre">
                        {line || ' '}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Challenge: "Spot the Bug" - Adaptive light/dark styling */}
          {lesson.challenge && (
            <div className="mb-3.5 p-3 rounded-xl bg-blue-50/80 dark:bg-[#07172e] border border-blue-200 dark:border-blue-500/20">
              <div className="flex items-center gap-1.5 mb-2">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  {t('fyp.spotMistake', 'Spot the Mistake')}
                </h4>
              </div>

              <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 mb-2">
                {lesson.challenge.question}
              </p>

              {/* Quiz Options */}
              <div className="grid grid-cols-1 gap-1.5">
                {lesson.challenge.options.map((option, optIdx) => {
                  const isSelected = challengeState?.selectedOption === optIdx || challengeFeedback[lesson.id]?.selectedIndex === optIdx;
                  const isCorrectOption = optIdx === lesson.challenge?.correctIndex;
                  const hasAttempted = hasGuessedChallenge;

                  let buttonStyle = 'bg-white dark:bg-white/5 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-white/10 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-white/10 shadow-2xs';
                  if (hasAttempted) {
                    if (isCorrectOption) {
                      buttonStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 dark:bg-emerald-500/20 dark:text-emerald-200 font-bold';
                    } else if (isSelected && !isCorrectOption) {
                      buttonStyle = 'bg-rose-100 border-rose-500 text-rose-950 dark:bg-rose-500/20 dark:text-rose-200';
                    } else {
                      buttonStyle = 'opacity-50 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={hasAttempted}
                      onClick={() => handleChallengeGuess(lesson.id, optIdx)}
                      className={`p-2 rounded-lg text-xs text-left transition-all border flex items-center justify-between cursor-pointer ${buttonStyle}`}
                    >
                      <span>{option}</span>
                      {hasAttempted && isCorrectOption && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5" />
                      )}
                      {hasAttempted && isSelected && !isCorrectOption && (
                        <X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 ml-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Challenge Reasoning Feedback */}
              {hasGuessedChallenge && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-white dark:bg-black/40 text-[11px] text-slate-900 dark:text-slate-300 border border-slate-200 dark:border-white/10 leading-relaxed shadow-xs">
                  <strong className="text-blue-700 dark:text-blue-400 block mb-0.5 font-bold">
                    {t('fyp.bugReason', 'Bug Reason:')}
                  </strong>
                  {lesson.challenge.reasoning}
                </div>
              )}
            </div>
          )}

          {/* Primary Card Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200/50 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              {/* TRY IT IN SOLVE BUTTON */}
              <button
                onClick={() => handleTryInSolve(lesson)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{t('fyp.solveBug', 'Solve Bug')}</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              {/* Copy Buggy Code */}
              <button
                onClick={() => copyToClipboard(lesson.buggyCode, `${lesson.id}-btn`)}
                className="px-2.5 py-1.5 rounded-xl glass-button text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedKeys[`${lesson.id}-btn`] ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('solve.copied', 'Copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t('solve.copy', 'Copy')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Accordion Toggle for Explanation & Corrected Solution */}
            <button
              onClick={() => toggleExpand(lesson.id)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{isExpanded ? t('fyp.hideSolution', 'Hide Solution') : t('fyp.showSolution', 'Show Solution')}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Expanded Content: Corrected Code, Explanation, Tips, Language Quirks */}
        {isExpanded && (
          <div className="border-t border-slate-200 dark:border-white/10 p-4 bg-slate-50 dark:bg-[#020b18]/60 space-y-3.5 animate-in fade-in duration-200">
            {/* Corrected Code Box - Adaptive light/dark styling (NO MORE BLACK BOX in light mode) */}
            <div>
              <div className="rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-500/40 shadow-xs">
                <div className="bg-emerald-50 dark:bg-[#030814] px-3.5 py-1.5 border-b border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('fyp.correctedCode', 'Corrected Code')}</span> ({lesson.language === 'cpp' ? 'C++' : 'Python'})
                  </span>

                  <button
                    onClick={() => copyToClipboard(lesson.correctedCode, `${lesson.id}-corrected`)}
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Copy corrected code"
                  >
                    {copiedKeys[`${lesson.id}-corrected`] ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t('solve.copied', 'Copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{t('solve.copy', 'Copy')}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-emerald-50/40 dark:bg-[#040e20] p-3 font-mono text-xs overflow-x-auto leading-relaxed max-h-48 overflow-y-auto">
                  <table className="w-full border-collapse">
                    <tbody>
                      {lesson.correctedCode.split('\n').map((line, idx) => (
                        <tr key={idx} className="hover:bg-emerald-100/50 dark:hover:bg-white/5">
                          <td className="pr-3 text-right select-none text-slate-400 dark:text-slate-500 w-6 align-top text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="text-emerald-950 dark:text-emerald-100 whitespace-pre font-semibold">
                            {line || ' '}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Why the code failed (In-depth explanation) */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xs">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{t('fyp.whyFailed', 'Why This Happens & How to Fix It')}</span>
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {lesson.explanation}
              </p>
            </div>

            {/* Practical Learning Tip */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 shadow-xs">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t('fyp.learningTip', 'Practical Learning Tip')}</span>
              </h4>
              <p className="text-xs text-amber-950 dark:text-slate-200 leading-relaxed font-medium">
                {lesson.learningTip}
              </p>
            </div>

            {/* Language Difference Note (C++ vs Python) if provided */}
            {lesson.languageDiffNote && (
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 shadow-xs">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
                  <Code2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{t('fyp.langDiff', 'C++ vs Python Perspective')}</span>
                </h4>
                <p className="text-xs text-indigo-950 dark:text-slate-200 leading-relaxed">
                  {lesson.languageDiffNote}
                </p>
              </div>
            )}

            {/* Tags */}
            {lesson.tags && lesson.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">
                  {t('fyp.topics', 'Topics:')}
                </span>
                {lesson.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-200/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-500/30 text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero / Page Header */}
      <div className="relative mb-8 p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
        {/* Subtle ambient lighting */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-100 dark:bg-blue-500/20 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
              <span>{t('fyp.badge', 'Bite-Sized Programming Lessons')}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex flex-wrap items-center gap-2.5">
              <span>{t('fyp.title', 'BugSlayer - For You Page. ')}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {t(
                'fyp.desc',
                'Explore common mistakes made by beginner and intermediate programmers in C++ and Python. Study buggy code, test your bug-hunting instincts with interactive challenges, and send mistakes straight into BugSlayer’s Solve editor.'
              )}
            </p>

            {/* Recommendation Status Pill */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              {userHistoryAnalysis.hasHistory ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40 text-xs font-semibold">
                  <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{t('fyp.personalizedBanner', 'Personalized based on your recent debugging in the Solve page')}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-medium">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>
                    {t(
                      'fyp.curatedBanner',
                      'Curated Beginner Essentials — debug your own code in Solve to unlock personalized error recommendations'
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Mastery & Learning Stats Card */}
          <div className="shrink-0 lg:w-72 p-5 rounded-2xl glass-card border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {t('fyp.mastery', 'Lesson Mastery')}
              </span>
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                {completedCount} / {lessons.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-white/10">
              <span className="font-semibold">{completionPercentage}% {t('fyp.masteredLessons', 'mastered')}</span>
              {bookmarkedCount > 0 && (
                <button
                  onClick={() => setShowOnlyBookmarked((prev) => !prev)}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Bookmark className="w-3 h-3 fill-current" />
                  <span>{bookmarkedCount} {t('fyp.saved', 'Saved')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-4">
        {/* Search Bar & Primary Language Filter */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('fyp.searchPlaceholder', 'Search mistakes (e.g. semicolon, indentation, index out of range, logic)...')}
              className="w-full pl-11 pr-10 py-3 rounded-2xl glass-input text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-white/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Language Filter Buttons: Black text in light mode as requested */}
          <div className="flex items-center p-1 rounded-2xl glass-input border border-slate-200 dark:border-white/10 self-start md:self-auto shrink-0 bg-white/70 dark:bg-transparent">
            <button
              onClick={() => setSelectedLanguage('all')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedLanguage === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-black dark:text-slate-300 hover:text-blue-600 dark:hover:text-white'
              }`}
            >
              {t('fyp.allLanguages', 'All Languages')}
            </button>
            <button
              onClick={() => setSelectedLanguage('cpp')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedLanguage === 'cpp'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-black dark:text-slate-300 hover:text-blue-600 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              <span className={selectedLanguage === 'cpp' ? 'text-white' : 'text-black dark:text-slate-200'}>C++</span>
            </button>
            <button
              onClick={() => setSelectedLanguage('python')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedLanguage === 'python'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-black dark:text-slate-300 hover:text-amber-600 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span className={selectedLanguage === 'python' ? 'text-white' : 'text-black dark:text-slate-200'}>Python</span>
            </button>
          </div>
        </div>

        {/* Secondary Filters: Difficulty, Sort, Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-1 text-xs font-medium">
              <span className="text-slate-600 dark:text-slate-400 mr-1 hidden sm:inline font-bold">
                {t('fyp.difficulty', 'Difficulty:')}
              </span>
              {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'glass-button text-black dark:text-slate-300 hover:text-blue-600 dark:hover:text-white'
                  }`}
                >
                  {diff === 'all'
                    ? t('fyp.all', 'All')
                    : diff === 'Beginner'
                    ? t('fyp.beginner', 'Beginner')
                    : diff === 'Intermediate'
                    ? t('fyp.intermediate', 'Intermediate')
                    : t('fyp.advanced', 'Advanced')}
                </button>
              ))}
            </div>

            {/* Quick Toggles */}
            <button
              onClick={() => setShowOnlyBookmarked((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showOnlyBookmarked
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'glass-button text-black dark:text-slate-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showOnlyBookmarked ? 'fill-current' : ''}`} />
              <span>{t('fyp.saved', 'Saved')} ({bookmarkedCount})</span>
            </button>

            <button
              onClick={() => setHideCompleted((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                hideCompleted
                  ? 'bg-blue-600 text-white font-bold'
                  : 'glass-button text-black dark:text-slate-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('fyp.hideLearned', 'Hide Learned')}</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs font-medium self-end sm:self-auto">
            <span className="text-slate-600 dark:text-slate-400 font-bold">{t('fyp.sortBy', 'Sort by:')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1.5 px-3 rounded-xl glass-input text-xs font-bold text-black dark:text-slate-200 border border-slate-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white dark:bg-slate-900"
            >
              <option value="recommended" className="bg-slate-900 text-white">
                {t('fyp.recSort', 'Recommended for You')}
              </option>
              <option value="newest" className="bg-slate-900 text-white">
                {t('fyp.newSort', 'Newest Lessons')}
              </option>
              <option value="difficulty-asc" className="bg-slate-900 text-white">
                {t('fyp.diffAsc', 'Difficulty: Beginner First')}
              </option>
              <option value="difficulty-desc" className="bg-slate-900 text-white">
                {t('fyp.diffDesc', 'Difficulty: Advanced First')}
              </option>
            </select>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'glass-button text-black dark:text-slate-300 hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            {t('fyp.allCategories', 'All Categories')} ({lessons.length})
          </button>
          {categories.map((cat) => {
            const count = lessons.filter((l) => l.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'glass-button text-black dark:text-slate-300 hover:text-blue-600 dark:hover:text-white'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DIVISION TABS: Learned vs Not Learned Yet */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 shadow-sm bg-white/70 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLearningSection('all')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              learningSection === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'glass-button text-black dark:text-slate-300 hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t('fyp.allSection', 'All Lessons')}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${learningSection === 'all' ? 'bg-white/20 dark:bg-black/20' : 'bg-slate-200 dark:bg-white/10'}`}>
              {filteredLessons.length}
            </span>
          </button>

          <button
            onClick={() => setLearningSection('not-learned')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              learningSection === 'not-learned'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'glass-button text-black dark:text-slate-300 hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            <Circle className="w-4 h-4 text-blue-500" />
            <span>{t('fyp.notLearnedYet', 'Not Learned Yet')}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${learningSection === 'not-learned' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300'}`}>
              {notLearnedLessons.length}
            </span>
          </button>

          <button
            onClick={() => setLearningSection('learned')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              learningSection === 'learned'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                : 'glass-button text-black dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{t('fyp.learned', 'Learned')}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${learningSection === 'learned' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
              {learnedLessons.length}
            </span>
          </button>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <span>
            {t('fyp.showing', 'Showing')} <strong className="text-black dark:text-white font-bold">{filteredLessons.length}</strong> {t('fyp.ofMistakes', 'of programming mistakes')}
          </span>
          {(searchQuery ||
            selectedLanguage !== 'all' ||
            selectedCategory !== 'all' ||
            selectedDifficulty !== 'all' ||
            showOnlyBookmarked ||
            hideCompleted) && (
            <button
              onClick={resetAllFilters}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
            >
              {t('fyp.resetFilters', 'Reset all filters')}
            </button>
          )}
        </div>
      </div>

      {/* Empty State if no cards match */}
      {filteredLessons.length === 0 && (
        <div className="py-16 px-6 text-center rounded-3xl glass-panel border border-slate-200 dark:border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {t('fyp.noMatchesTitle', 'No programming mistakes matched your filters')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
            {t('fyp.noMatchesDesc', 'Try adjusting your search keywords, switching between C++ and Python, or resetting the difficulty and category filters.')}
          </p>
          <button
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            {t('fyp.clearFilters', 'Clear All Filters')}
          </button>
        </div>
      )}

      {/* SECTION 1: NOT LEARNED YET (Rendered if 'all' or 'not-learned') */}
      {(learningSection === 'all' || learningSection === 'not-learned') && (
        <section className="mb-10">
          {/* Section Heading Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-blue-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-300 dark:border-blue-400/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-black dark:text-white flex items-center gap-2">
                  <span>{t('fyp.notLearnedYet', 'Not Learned Yet')}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-300 dark:border-blue-400/30">
                    {notLearnedLessons.length} {t('fyp.lessonsToMaster', 'lessons to master')}
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t('fyp.notLearnedDesc', 'Practice and solve these common coding mistakes to level up your skills.')}
                </p>
              </div>
            </div>
          </div>

          {notLearnedLessons.length === 0 ? (
            <div className="p-8 rounded-2xl glass-panel border border-emerald-400/40 text-center bg-emerald-50/40 dark:bg-emerald-950/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {t('fyp.allMastered', 'All caught up! You have learned all lessons matching your current filters.')}
              </h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {notLearnedLessons.map((lesson) => renderLessonCard(lesson))}
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: LEARNED & MASTERED (Rendered if 'all' or 'learned') */}
      {(learningSection === 'all' || learningSection === 'learned') && (
        <section className="mb-10">
          {/* Section Heading Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-emerald-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-300 dark:border-emerald-400/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-black dark:text-white flex items-center gap-2">
                  <span>{t('fyp.learned', 'Learned')}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-400/30">
                    {learnedLessons.length} {t('fyp.masteredLessons', 'mastered')}
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t('fyp.learnedDesc', 'Review previously mastered concepts to keep your memory sharp.')}
                </p>
              </div>
            </div>
          </div>

          {learnedLessons.length === 0 ? (
            <div className="p-8 rounded-2xl glass-panel border border-slate-300 dark:border-white/10 text-center">
              <Award className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-md mx-auto">
                {t(
                  'fyp.noLearnedYet',
                  'No lessons marked as learned yet. Click "Mark Learned" on any lesson or solve its challenge to track your mastery!'
                )}
              </h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {learnedLessons.map((lesson) => renderLessonCard(lesson))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
