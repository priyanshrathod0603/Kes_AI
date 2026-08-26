'use client'

import { motion } from 'framer-motion'
import { formatDate, cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks'
import { useProgressStats, useActivity } from '@/hooks'
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
  if (!data?.length) return <Skeleton className="h-48 w-full" variant="rectangular" />

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
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          formatter={(value: number) => [`${value}h`, 'Study time']}
        />
        <Area
          type="monotone"
          dataKey="minutes"
          stroke="#2563eb"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#studyGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function SubjectPerformanceChart({ data }: { data: Array<{ subjectName: string; progress: number }> }) {
  if (!data?.length) return <Skeleton className="h-48 w-full" variant="rectangular" />

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} vertical={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
        <YAxis dataKey="subjectName" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          formatter={(value: number) => [`${value}%`, 'Progress']}
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
  if (!data?.length) return <Skeleton className="h-48 w-full" variant="rectangular" />

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          formatter={(value: number, name: string) => [name === 'accuracy' ? `${value}%` : `${value}`, name === 'accuracy' ? 'Accuracy' : 'Score']}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="accuracy"
          stroke="#7c3aed"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary', subtitle }: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  color?: 'primary' | 'success' | 'warning' | 'violet' | 'indigo'
  subtitle?: string
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
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1 text-xs text-success-600">
          <TrendingUp className="h-3 w-3" />
          <span>{trend}</span>
        </div>
      )}
    </Card>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading } = useProgressStats()
  const { data: activity } = useActivity({ limit: 5 })

  const greeting = getGreeting()
  const studentName = user?.fullName?.split(' ')[0] || 'Student'

  return (
    <div className="space-y-6 animate-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting}, {studentName} 👋</h1>
          <p className="text-foreground-muted mt-1">Ready to learn something new today?</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/study-material">View all</a>
          </Button>
          <Button variant="gradient" asChild>
            <a href="/ai-tutor">
              <Bot className="h-4 w-4 mr-2" />
              Ask AI Tutor
            </a>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard title="Study Streak" value={`${stats?.studyStreak || 0} days`} icon={Flame} color="warning" trend="+2 this week" />
        <StatCard title="Total Study Time" value={`${Math.round((stats?.totalStudyTime || 0) / 60)}h`} icon={Clock} color="primary" subtitle="This month" />
        <StatCard title="Questions Solved" value={stats?.questionsSolved || 0} icon={Target} color="success" />
        <StatCard title="Quiz Accuracy" value={`${Math.round(stats?.quizAccuracy || 0)}%`} icon={TrendingUp} color="violet" />
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
              <Button variant="ghost" size="sm" asChild>
                <a href="/subjects">View all <ArrowRight className="h-4 w-4 ml-1" /></a>
              </Button>
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
                    <p className="text-sm text-foreground-muted">Chapter 3: {getChapterName(subject.id, 3)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.progress}%` }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
                          className="h-full bg-primary-600 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">{subject.progress}%</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Continue</Button>
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
                    <p className="text-3xl font-bold text-primary-900">{Math.round((stats?.totalStudyTime || 0) / 60)}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary-300" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-violet-700">Topics Completed</p>
                    <p className="text-3xl font-bold text-violet-900">{stats?.subjectPerformance?.reduce((a, b) => a + b.chaptersCompleted, 0) || 0}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-violet-300" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-success-50 to-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-success-700">Quizzes Completed</p>
                    <p className="text-3xl font-bold text-success-900">{stats?.subjectPerformance?.reduce((a, b) => a + b.quizzesCompleted, 0) || 0}</p>
                  </div>
                  <Target className="h-8 w-8 text-success-300" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-warning-50 to-amber-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-warning-700">Current Streak</p>
                    <p className="text-3xl font-bold text-warning-900">{stats?.studyStreak || 0} days</p>
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
              <Button variant="default" size="lg" className="w-full" asChild>
                <a href="/ai-tutor">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ask AI Tutor
                </a>
              </Button>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Explain photosynthesis', 'Help me solve this math problem', 'Give me a quiz on fractions', 'Summarize this chapter'].map((prompt, i) => (
                  <Button key={i} variant="ghost" size="sm" className="text-xs" asChild>
                    <a href={`/ai-tutor?prompt=${encodeURIComponent(prompt)}`}>{prompt}</a>
                  </Button>
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
                          animate={{ width: `${subject.progress}%` }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                          className="h-full bg-primary-600 rounded-full"
                        />
                      </div>
                      <span className="text-xs text-foreground-muted">{subject.progress}%</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{subject.chaptersCompleted}/{subject.totalChapters} chapters</Badge>
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
          <WeeklyStudyTimeChart data={stats?.weeklyStudyTime || []} />
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Subject Performance</h3>
            <Badge variant="outline">Overall</Badge>
          </div>
          <SubjectPerformanceChart data={stats?.subjectPerformance || []} />
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
            <h3 className="font-semibold text-foreground">Quiz Performance</h3>
            <Badge variant="outline">Last 30 days</Badge>
          </div>
          <QuizPerformanceChart data={stats?.quizPerformance || []} />
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <Button variant="ghost" size="sm" asChild>
              <a href="/progress">View all <ArrowRight className="h-4 w-4 ml-1" /></a>
            </Button>
          </div>
          <ScrollArea className="h-64">
            <div className="space-y-4">
              {activity?.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {(() => {
                      const Icon = getActivityIcon(item.type)
                      return <Icon className="h-5 w-5 text-foreground-muted" />
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-foreground-muted">{item.description || ''}</p>
                    <p className="text-xs text-foreground-subtle mt-1">{formatDate(item.timestamp)}</p>
                  </div>
                </motion.div>
              ))}
              {!activity?.length && (
                <div className="text-center py-8 text-foreground-muted">
                  <p>No recent activity</p>
                </div>
              )}
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