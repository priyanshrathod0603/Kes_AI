import {
  LayoutDashboard,
  Bot,
  BookOpen,
  FolderOpen,
  BarChart2,
  Settings,
  User,
  GraduationCap,
  HelpCircle,
  FileText,
  FileQuestion,
} from 'lucide-react'

export const APP_NAME = 'KES'
export const APP_TAGLINE = 'An AI-powered student learning platform by Krishna Software Solution'
export const COMPANY_NAME = 'Krishna Software Solution'

export const ROUTES = {
  DASHBOARD: '/dashboard',
  AI_TUTOR: '/ai-tutor',
  STUDY_MATERIAL: '/study-material',
  WORKSHEET_GENERATOR: '/worksheet-generator',
  QUESTION_PAPER_GENERATOR: '/question-paper-generator',
  CLASSES: '/classes',
  SUBJECTS: '/subjects',
  QUIZZES: '/quizzes',
  PROGRESS: '/progress',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const

export const SIDEBAR_GROUPS = [
  {
    title: 'Learning',
    items: [
      { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
      { label: 'AI Tutor', href: ROUTES.AI_TUTOR, icon: Bot },
    ],
  },
  {
    title: 'Worksheets & Exams',
    items: [
      { label: 'Worksheet Generator', href: ROUTES.WORKSHEET_GENERATOR, icon: FileText },
      { label: 'Question Paper Generator', href: ROUTES.QUESTION_PAPER_GENERATOR, icon: FileQuestion },
    ],
  },
  {
    title: 'Academic Management',
    items: [
      { label: 'Classes', href: ROUTES.CLASSES, icon: GraduationCap },
      { label: 'Subjects', href: ROUTES.SUBJECTS, icon: BookOpen },
      { label: 'Quizzes', href: ROUTES.QUIZZES, icon: HelpCircle },
      { label: 'Progress', href: ROUTES.PROGRESS, icon: BarChart2 },
    ],
  },
  {
    title: 'Document Management',
    items: [
      { label: 'Study Material', href: ROUTES.STUDY_MATERIAL, icon: FolderOpen },
    ],
  },
] as const


export const SIDEBAR_NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'AI Tutor', href: ROUTES.AI_TUTOR, icon: Bot },
  { label: 'Study Material', href: ROUTES.STUDY_MATERIAL, icon: FolderOpen },
  { label: 'Subjects', href: ROUTES.SUBJECTS, icon: BookOpen },
  { label: 'Classes', href: ROUTES.CLASSES, icon: GraduationCap },
  { label: 'Quizzes', href: ROUTES.QUIZZES, icon: HelpCircle },
  { label: 'Progress', href: ROUTES.PROGRESS, icon: BarChart2 },
] as const

export const SIDEBAR_BOTTOM_ITEMS = [
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
  { label: 'Profile', href: ROUTES.PROFILE, icon: User },
] as const

export const QUICK_PROMPTS = [
  { label: 'Explain Simply', prompt: 'Explain this in simple terms' },
  { label: 'Give Example', prompt: 'Give me a practical example' },
  { label: 'Quiz Me', prompt: 'Create a quiz on this topic' },
  { label: 'Summarize', prompt: 'Summarize this for me' },
  { label: 'Help Solve', prompt: 'Help me solve this problem step by step' },
] as const

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

export const STORAGE_KEYS = {
  THEME: 'kes_theme',
} as const
