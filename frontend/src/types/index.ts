export interface User {
  id: string
  email: string
  fullName: string
  avatar?: string
  class?: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  password: string
  confirmPassword: string
  token: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: Record<string, string[]>
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Subject {
  id: string
  name: string
  icon: string
  color: string
  gradient: string
  progress: number
  chaptersCompleted: number
  totalChapters: number
  description?: string
}

export interface Chapter {
  id: string
  subjectId: string
  name: string
  description?: string
  order: number
  progress: number
  topicsCount: number
  completedTopics: number
  isLocked: boolean
}

export interface Topic {
  id: string
  chapterId: string
  name: string
  description?: string
  order: number
  content?: string
  estimatedTime: number
  isCompleted: boolean
  materials: StudyMaterial[]
}

export interface StudyMaterial {
  id: string
  topicId?: string
  chapterId?: string
  subjectId: string
  title: string
  description?: string
  fileUrl: string
  fileType: 'pdf' | 'doc' | 'ppt' | 'video' | 'link'
  fileSize: number
  uploadedAt: string
  isFavorite: boolean
  tags: string[]
}

export interface Quiz {
  id: string
  topicId?: string
  chapterId?: string
  subjectId: string
  title: string
  description?: string
  questions: QuizQuestion[]
  timeLimit?: number
  passingScore: number
  attempts: number
  maxAttempts: number
  createdAt: string
}

export interface QuizQuestion {
  id: string
  quizId: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'short_answer'
  options?: string[]
  correctAnswer: string | number
  explanation?: string
  points: number
  order: number
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  answers: Record<string, string | number>
  score: number
  accuracy: number
  timeSpent: number
  completedAt: string
  isPassed: boolean
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: AIContext
  actions?: AIAction[]
  provider?: string
  model?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AIContext {
  classId?: string
  subjectId?: string
  chapterId?: string
  topicId?: string
}

export interface AIAction {
  type: 'copy' | 'regenerate' | 'simplify' | 'example' | 'quiz' | 'summarize'
  label: string
  icon: string
}

export interface AIChatRequest {
  prompt: string
  context?: AIContext
  conversationHistory?: AIMessage[]
}

export interface AIChatResponse {
  response: string
  provider: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface ProgressStats {
  studyStreak: number
  totalStudyTime: number
  questionsSolved: number
  quizAccuracy: number
  weeklyStudyTime: WeeklyStudyTime[]
  subjectPerformance: SubjectPerformance[]
  quizPerformance: QuizPerformance[]
  learningStreak: LearningStreak[]
}

export interface WeeklyStudyTime {
  day: string
  minutes: number
}

export interface SubjectPerformance {
  subjectId: string
  subjectName: string
  progress: number
  timeSpent: number
  quizzesCompleted: number
  averageScore: number
}

export interface QuizPerformance {
  date: string
  score: number
  accuracy: number
}

export interface LearningStreak {
  date: string
  count: number
}

export interface ActivityItem {
  id: string
  type: 'ai_question' | 'quiz' | 'note' | 'material' | 'practice'
  title: string
  description?: string
  subjectId?: string
  subjectName?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

export interface Class {
  id: string
  name: string
  grade: number
  section: string
  subjects: Subject[]
  teacherId?: string
  studentCount: number
}

export interface Settings {
  userId: string
  notifications: {
    email: boolean
    push: boolean
    quizReminders: boolean
    studyReminders: boolean
    aiUpdates: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    fontSize: 'small' | 'medium' | 'large'
    reducedMotion: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends'
    showProgress: boolean
    showActivity: boolean
  }
}

export interface ApiError {
  message: string
  code?: string
  status: number
  details?: Record<string, string[]>
}

export type NavItem = {
  label: string
  href: string
  icon: string
  isAction?: boolean
}