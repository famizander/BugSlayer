export type Language = 'cpp' | 'python';

export type SubmissionStatus = 'Error Found' | 'Fixed' | 'No Errors';

export interface DetectedBug {
  id: string;
  line?: number;
  errorSummary: string;
  compilerOutput: string;
  hints: string[]; // exactly 3 hints per bug
  explanation?: string;
  learningTips?: string[];
}

export interface Submission {
  id: string;
  userId: string;
  title: string;
  language: Language;
  code: string;
  status: SubmissionStatus;
  timestamp: string; // ISO date or formatted
  compilerOutput: string;
  expectedOutput: string;
  actualOutput?: string;
  errorSummary: string;
  bugs?: DetectedBug[];
  hints: string[];
  explanation: string;
  correctedCode: string;
  learningTips: string[];
  progressPercent?: number; // e.g. for progress bar in Recent page
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  plan: 'free' | 'premium';
  avatar?: string;
}

export type Theme = 'dark' | 'light';

export type ActivePage = 'solve' | 'fyp' | 'recent' | 'account' | 'settings';

export type LessonDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type LessonCategory =
  | 'Syntax'
  | 'Variables'
  | 'Data Types'
  | 'Logic'
  | 'Conditionals'
  | 'Loops'
  | 'Functions'
  | 'Arrays & Indexing'
  | 'Input/Output'
  | 'Language Quirks';

export interface LessonChallenge {
  question: string;
  options: string[];
  correctIndex: number;
  reasoning: string;
}

export interface Lesson {
  id: string;
  title: string;
  language: Language;
  difficulty: LessonDifficulty;
  category: LessonCategory;
  description: string;
  buggyCode: string;
  correctedCode: string;
  explanation: string;
  learningTip: string;
  expectedOutput?: string;
  challenge?: LessonChallenge;
  languageDiffNote?: string;
  dateAdded?: string;
  tags?: string[];
  commonErrorMessage?: string;
}
