'use client'

import { motion } from 'framer-motion'
import { formatDate, cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useProgressStats } from '@/hooks'
import { ArrowRight, BookOpen, Clock, Target, Flame, TrendingUp, Bot, Sparkles, Zap } from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { SUBJECTS } from '@/lib/constants'

const COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#f59e0b', '#22c55e', '#ef4444']

function WeeklyStudyTimeChart({ data }: { data: Array<{ day: string; minutes: number }> }) {
  if (!data?.length) return <div className="h-48 flex items-center justify-center text-foreground-muted">No study time data yet</div>

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}h`} />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          formatter={(value: any) => value !== undefined ? [`${value}h`, 'Study time'] : ['0h', 'Study time']}
        />
        <Area type="monotone" dataKey="minutes" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#studyGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function SubjectPerformanceChart({ data }: { data: Array<{ subjectName: string; progress: number }> }) {
  if (!data?.length) return <div className="h-48 flex items-center justify-center text-foreground-muted">No subject performance data yet</div>

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} vertical={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
        <YAxis dataKey="subjectName" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          formatter={(value: any) => value !== undefined ? [`${value}%`, 'Progress'] : ['0%', 'Progress']}
        />
        <Bar dataKey="progress" radius={[0, 8, 8, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function QuizPerformanceChart({ data }: { data: Array<{ date: string; score: number; accuracy: number }> }) {
  if (!data?.length) return <div className="h-48 flex items-center justify-center text-foreground-muted">No quiz performance data yet</div>

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          formatter={(value: any, name: any) => value !== undefined ? [name === 'accuracy' ? `${value}%` : `${value}`, name === 'accuracy' ? 'Accuracy' : 'Score'] : ['0', name === 'accuracy' ? 'Accuracy' : 'Score']}
        />
        <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 2 }} />
        <Line type="monotone" dataKey="accuracy" stroke="#7c3aed" strokeWidth={2} dot={false} strokeDasharray="5 5" activeDot={{ r: 6, strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend }: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color?: 'primary' | 'success' | 'warning' | 'violet' | 'indigo'
  subtitle?: string
  trend?: string
}) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    violet: 'bg-violet-100 text-violet-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  }

  return (
    <Card variant="elevated" className="h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground-muted">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-xs text-foreground-muted mt-1">{subtitle}</p>}
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs text-success-600">
              <TrendingUp className="h-3 w-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  )
}

export function DashboardPage() {
  const { data: stats, isLoading } = useProgressStats()
  const hasProgressData = stats !== null && stats !== undefined

  return (
    <div className="space-y-6 animate-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good morning, Student 👋</h1>
          <p className="text-foreground-muted mt-1">Ready to learn something new today?</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/study-material" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] h-11 px-4 py-2 border-2 border-border bg-transparent hover:bg-muted hover:border-border-strong">
            View all
          </a>
          <a href="/ai-tutor" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] h-11 px-4 py-2 bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600 text-white hover:from-primary-700 hover:via-indigo-700 hover:to-violet-700 shadow-lg hover:shadow-xl">
            <Bot className="h-4 w-4 mr-2" />
            Ask AI Tutor
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard title="Study Streak" value={hasProgressData ? `${(stats as any).studyStreak || 0} days` : '0 days'} icon={Flame} color="warning" subtitle={hasProgressData ? 'Current streak' : 'Start studying'} />
        <StatCard title="Total Study Time" value={hasProgressData ? `${Math.round(((stats as any).totalStudyTime || 0) / 60)}h` : '0h'} icon={Clock} color="primary" subtitle={hasProgressData ? 'All time' : 'Start studying'} />
        <StatCard title="Questions Solved" value={hasProgressData ? (stats as any).questionsSolved || 0 : 0} icon={Target} color="success" subtitle={hasProgressData ? 'Practice completed' : 'Start practicing'} />
        <StatCard title="Quiz Accuracy" value={hasProgressData ? `${Math.round((stats as any).quizAccuracy || 0)}%` : '0%'} icon={TrendingUp} color="violet" subtitle={hasProgressData ? 'Overall performance' : 'Take a quiz'} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Continue Learning</h2>
                <p className="text-sm text-foreground-muted">Pick up where you left off</p>
              </div>
              <a href="/subjects" className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] h-9 px-3 text-xs hover:bg-muted hover:text-foreground" aria-label="View all subjects">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </div>
            <div className="space-y-3">
              {SUBJECTS.slice(0, 3).map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', `bg-gradient-to-br ${subject.gradient}`)}>
                    <subject.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{subject.name}</p>
                    <p className="text-sm text-foreground-muted">No chapters started yet</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '0%' }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
                          className="h-full bg-primary-600 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">0%</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Start Learning</Button>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Today's Learning</h2>
                <p className="text-sm text-foreground-muted">Your progress so far</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-700">Study Time</p>
                    <p className="text-3xl font-bold text-primary-900">{hasProgressData ? `${Math.round(((stats as any).totalStudyTime || 0) / 60)}h` : '0h'}</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary-300" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-violet-700">Topics Completed</p>
                    <p className="text-3xl font-bold text-violet-900">0</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-violet-300" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-success-50 to-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-success-700">Quizzes Completed</p>
                    <p className="text-3xl font-bold text-success-900">0</p>
                  </div>
                  <Target className="h-8 w-8 text-success-300" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-warning-50 to-amber-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-warning-700">Current Streak</p>
                    <p className="text-3xl font-bold text-warning-900">{hasProgressData ? `${(stats as any).studyStreak || 0} days` : '0 days'}</p>
                  </div>
                  <Flame className="h-8 w-8 text-warning-300" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-6"
        >
          <Card variant="gradient" padding="lg" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-indigo-500/10 to-violet-500/10" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600/20">
                  <Bot className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">AI Tutor Quick Start</h3>
                  <p className="text-sm text-foreground-muted">Your personal learning companion</p>
                </div>
              </div>
              <p className="text-foreground-muted mb-4">Ask anything about your studies - explanations, examples, quizzes, and more.</p>
              <a href="/ai-tutor" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] h-12 px-8 text-base bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Ask AI Tutor
              </a>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Explain photosynthesis', 'Help me solve this math problem', 'Give me a quiz on fractions', 'Summarize this chapter'].map((prompt, i) => (
                  <a key={i} href={`/ai-tutor?prompt=${encodeURIComponent(prompt)}`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] h-9 px-3 hover:bg-muted hover:text-foreground">
                    {prompt}
                  </a>
                ))}
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Subjects</h3>
              <Button variant="ghost" size="sm" asChild>
                <a href="/subjects">View all <ArrowRight className="h-4 w-4 ml-1" /></a>
              </Button>
            </div>
            <div className="space-y-3">
              {SUBJECTS.map((subject) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', `bg-gradient-to-br ${subject.gradient}`)}>
                    <subject.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{subject.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '0%' }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                          className="h-full bg-primary-600 rounded-full"
                        />
                      </div>
                      <span className="text-xs text-foreground-muted">0%</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">0/0 chapters</Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Weekly Study Time</h3>
            <Badge variant="outline">This week</Badge>
          </div>
          <WeeklyStudyTimeChart data={hasProgressData && (stats as any).weeklyStudyTime ? (stats as any).weeklyStudyTime : []} />
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Subject Performance</h3>
            <Badge variant="outline">Overall</Badge>
          </div>
          <SubjectPerformanceChart data={hasProgressData && (stats as any).subjectPerformance ? (stats as any).subjectPerformance : []} />
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Quiz Performance Trend</h3>
            <Badge variant="outline">Last 30 days</Badge>
          </div>
          <QuizPerformanceChart data={hasProgressData && (stats as any).quizPerformance ? (stats as any).quizPerformance : []} />
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <a href="/progress" className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] h-9 px-3 text-xs hover:bg-muted hover:text-foreground" aria-label="View all progress">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
          <ScrollArea className="h-64">
            <div className="space-y-4">
              <div className="text-center py-8 text-foreground-muted">
                <p>No recent activity yet. Start learning to see your activity here!</p>
              </div>
            </div>
          </ScrollArea>
        </Card>
      </motion.div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getChapterName(subjectId: string, chapterNum: number): string {
  const chapters: Record<string, string[]> = {
    math: ['Algebra Basics', 'Linear Equations', 'Quadratic Equations', 'Geometry'],
    science: ['Cells', 'Photosynthesis', 'Ecosystems', 'Chemical Reactions'],
    english: ['Grammar', 'Reading Comprehension', 'Essay Writing', 'Literature'],
    social: ['Ancient Civilizations', 'World Wars', 'Geography', 'Economics'],
    hindi: ['व्याकरण', 'कहानी', 'कविता', 'निबंध'],
    computer: ['Programming Basics', 'Data Structures', 'Algorithms', 'Web Development'],
  }
  return chapters[subjectId]?.[chapterNum - 1] || `Chapter ${chapterNum}`
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'ai_question': return Bot
    case 'quiz': return Target
    case 'note': return BookOpen
    case 'material': return Sparkles
    case 'practice': return Zap
    default: return Bot
  }
}