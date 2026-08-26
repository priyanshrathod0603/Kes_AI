import { 
  LayoutDashboard, 
  Bot, 
  BookOpen, 
  FolderOpen, 
  FileText, 
  BarChart2, 
  History, 
  Settings, 
  User, 
  Calculator, 
  FlaskConical, 
  BookOpen as BookOpenIcon, 
  Globe, 
  Languages, 
  Cpu, 
  Copy, 
  RotateCcw, 
  Lightbulb, 
  Sparkles, 
  HelpCircle as HelpCircleIcon, 
  FileText as FileTextIcon,
  GraduationCap,
  HelpCircle
} from 'lucide-react'

export const APP_NAME = 'KESH AI'
export const APP_TAGLINE = 'Your AI Learning Companion'
export const COMPANY_NAME = 'Krishna Software Solution'

export const ROUTES = {
  DASHBOARD: '/dashboard',
  AI_TUTOR: '/ai-tutor',
  STUDY_MATERIAL: '/study-material',
  CLASSES: '/classes',
  SUBJECTS: '/subjects',
  QUIZZES: '/quizzes',
  PROGRESS: '/progress',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const

export const SIDEBAR_NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'AI Tutor', href: ROUTES.AI_TUTOR, icon: Bot },
  { label: 'Study Material', href: ROUTES.STUDY_MATERIAL, icon: FolderOpen },
  { label: 'PDF Library', href: ROUTES.STUDY_MATERIAL, icon: FileText },
  { label: 'Subjects', href: ROUTES.SUBJECTS, icon: BookOpen },
  { label: 'Classes', href: ROUTES.CLASSES, icon: GraduationCap },
  { label: 'Quizzes', href: ROUTES.QUIZZES, icon: HelpCircle },
  { label: 'Progress', href: ROUTES.PROGRESS, icon: BarChart2 },
  { label: 'AI History', href: ROUTES.PROGRESS, icon: History },
] as const

export const SIDEBAR_BOTTOM_ITEMS = [
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
  { label: 'Profile', href: ROUTES.PROFILE, icon: User },
] as const

export const SUBJECTS = [
  { id: 'math', name: 'Mathematics', icon: Calculator, color: 'blue', gradient: 'from-blue-500 to-blue-600', description: 'Master algebra, geometry, calculus, and more with interactive lessons.' },
  { id: 'science', name: 'Science', icon: FlaskConical, color: 'green', gradient: 'from-green-500 to-green-600', description: 'Explore physics, chemistry, and biology through experiments and simulations.' },
  { id: 'english', name: 'English', icon: BookOpenIcon, color: 'purple', gradient: 'from-purple-500 to-purple-600', description: 'Improve grammar, vocabulary, reading comprehension, and writing skills.' },
  { id: 'social', name: 'Social Science', icon: Globe, color: 'orange', gradient: 'from-orange-500 to-orange-600', description: 'Understand history, geography, civics, and economics.' },
  { id: 'hindi', name: 'Hindi', icon: Languages, color: 'red', gradient: 'from-red-500 to-red-600', description: 'Learn Hindi grammar, literature, and composition.' },
  { id: 'computer', name: 'Computer Science', icon: Cpu, color: 'indigo', gradient: 'from-indigo-500 to-indigo-600', description: 'Programming fundamentals, data structures, and algorithms.' },
] as const

export const QUICK_PROMPTS = [
  { label: 'Explain Simply', prompt: 'Explain this in simple terms' },
  { label: 'Give Example', prompt: 'Give me a practical example' },
  { label: 'Quiz Me', prompt: 'Create a quiz on this topic' },
  { label: 'Summarize', prompt: 'Summarize this for me' },
  { label: 'Help Solve', prompt: 'Help me solve this problem step by step' },
] as const

export const AI_RESPONSE_ACTIONS = [
  { label: 'Copy', icon: Copy, action: 'copy' },
  { label: 'Regenerate', icon: RotateCcw, action: 'regenerate' },
  { label: 'Explain Simpler', icon: Lightbulb, action: 'simplify' },
  { label: 'Give Example', icon: Sparkles, action: 'example' },
  { label: 'Make Quiz', icon: HelpCircleIcon, action: 'quiz' },
  { label: 'Summarize', icon: FileTextIcon, action: 'summarize' },
] as const

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const

export const TOAST_DURATION = 5000

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const STORAGE_KEYS = {
  THEME: 'kesh_theme',
} as const