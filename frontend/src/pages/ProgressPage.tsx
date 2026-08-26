'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProgressStats } from '@/hooks'
import { Flame, Clock, Target, TrendingUp, BarChart2, Calendar, Zap, Award, Sparkles, BookOpen } from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'
import { SUBJECTS } from '@/lib/constants'

const COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#f59e0b', '#22c55e', '#ef4444']

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
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-xs text-foreground-muted mt-1">{subtitle}</p>}
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs text-success-600">
              <TrendingUp className="h-3 w-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={cn('flex h-14 w-14 items-center justify-center rounded-xl', colorClasses[color])}>
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </Card>
  )
}

function WeeklyStudyChart({ data }: { data: Array<{ day: string; minutes: number }> }) {
  if (!data?.length) return <div className="h-64 flex items-center justify-center text-foreground-muted">No study time data yet</div>

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
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
        <Area type="monotone" dataKey="minutes" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#weeklyGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function SubjectPerformanceChart({ data }: { data: Array<{ subjectName: string; progress: number; averageScore: number }> }) {
  if (!data?.length) return <div className="h-64 flex items-center justify-center text-foreground-muted">No subject performance data yet</div>

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} vertical={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
        <YAxis dataKey="subjectName" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          formatter={(value: any, name: any) => value !== undefined ? [name === 'averageScore' ? `${value}%` : `${value}%`, name === 'averageScore' ? 'Avg Score' : 'Progress'] : ['0%', name === 'averageScore' ? 'Avg Score' : 'Progress']}
        />
        <Bar dataKey="progress" radius={[0, 8, 8, 0]}>
          {data.map((_, index) => (
            <Cell key={`progress-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
        <Bar dataKey="averageScore" radius={[0, 8, 8, 0]}>
          {data.map((_, index) => (
            <Cell key={`score-${index}`} fill={COLORS[(index + 3) % COLORS.length]} opacity={0.6} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function QuizTrendChart({ data }: { data: Array<{ date: string; score: number; accuracy: number }> }) {
  if (!data?.length) return <div className="h-64 flex items-center justify-center text-foreground-muted">No quiz performance data yet</div>

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
        <Tooltip
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
          formatter={(value: any, name: any) => value !== undefined ? [name === 'accuracy' ? `${value}%` : `${value}`, name === 'accuracy' ? 'Accuracy' : 'Score'] : ['0', name === 'accuracy' ? 'Accuracy' : 'Score']}
        />
        <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 2 }} name="Score" />
        <Line type="monotone" dataKey="accuracy" stroke="#7c3aed" strokeWidth={2} dot={false} strokeDasharray="5 5" activeDot={{ r: 6, strokeWidth: 2 }} name="Accuracy" />
      </LineChart>
    </ResponsiveContainer>
  )
}

function StreakCalendar({ data }: { data: Array<{ date: string; count: number }> }) {
  if (!data?.length) return <div className="h-64 flex items-center justify-center text-foreground-muted">No activity data yet</div>

  const today = new Date()
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split('T')[0]
  })

  return (
    <div className="h-64 flex items-center justify-center">
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dayData = data.find(d => d.date === day)
          const hasActivity = dayData && dayData.count > 0
          const intensity = hasActivity ? Math.min(dayData.count / 5, 1) : 0
          const bgColor = hasActivity
            ? intensity > 0.7
              ? '#15803d'
              : intensity > 0.4
              ? '#16a34a'
              : intensity > 0.1
              ? '#22c55e'
              : '#4ade80'
            : '#e2e8f0'

          return (
            <div
              key={day}
              className="aspect-square rounded transition-colors"
              style={{ backgroundColor: bgColor }}
              title={`${day}: ${dayData?.count || 0} activities`}
            />
          )
        })}
      </div>
    </div>
  )
}

export function ProgressPage() {
  const { data: stats, isLoading } = useProgressStats()
  const hasProgressData = stats !== null && stats !== undefined

  return (
    <div className="space-y-6 animate-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Progress</h1>
          <p className="text-foreground-muted">Track your learning journey and achievements</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard title="Study Streak" value={hasProgressData ? `${(stats as any).studyStreak || 0} days` : '0 days'} icon={Flame} color="warning" subtitle="Current streak" />
        <StatCard title="Total Study Time" value={hasProgressData ? `${Math.round(((stats as any).totalStudyTime || 0) / 60)}h` : '0h'} icon={Clock} color="primary" subtitle="All time" />
        <StatCard title="Questions Solved" value={hasProgressData ? (stats as any).questionsSolved || 0 : 0} icon={Target} color="success" subtitle="Practice completed" />
        <StatCard title="Quiz Accuracy" value={hasProgressData ? `${Math.round((stats as any).quizAccuracy || 0)}%` : '0%'} icon={TrendingUp} color="violet" subtitle="Overall performance" />
      </motion.div>

      {!hasProgressData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <Card variant="elevated" padding="lg" className="max-w-2xl mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 mx-auto mb-4">
              <BarChart2 className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Your learning journey</h2>
            <p className="text-foreground-muted mt-2">Start studying to see your progress here.</p>
            <div className="mt-6 flex gap-4 justify-center">
              <Button variant="gradient" asChild size="lg">
                <a href="/ai-tutor">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Ask AI Tutor
                </a>
              </Button>
              <Button variant="outline" asChild size="lg">
                <a href="/study-material">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Browse Study Material
                </a>
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {hasProgressData && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Weekly Study Time</h3>
                <Badge variant="outline">Last 7 days</Badge>
              </div>
              <WeeklyStudyChart data={(stats as any).weeklyStudyTime || []} />
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Subject Performance</h3>
                <Badge variant="outline">Progress & Scores</Badge>
              </div>
              <SubjectPerformanceChart data={(stats as any).subjectPerformance || []} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Quiz Performance Trend</h3>
                <Badge variant="outline">Last 30 days</Badge>
              </div>
              <QuizTrendChart data={(stats as any).quizPerformance || []} />
            </Card>

            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Activity Calendar</h3>
                <Badge variant="outline">Last 30 days</Badge>
              </div>
              <StreakCalendar data={(stats as any).learningStreak || []} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-100 mx-auto mb-4">
                <Flame className="h-8 w-8 text-warning-600" />
              </div>
              <h3 className="font-semibold text-foreground">Longest Streak</h3>
              <p className="text-3xl font-bold text-foreground mt-2 text-warning-600">{Math.max(...((stats as any).learningStreak?.map((d: any) => d.count) || [0]))} days</p>
              <p className="text-foreground-muted text-sm mt-1">Your best streak ever</p>
            </Card>

            <Card variant="elevated" padding="lg" className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 mx-auto mb-4">
                <BarChart2 className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-foreground">Subjects Mastered</h3>
              <p className="text-3xl font-bold text-foreground mt-2 text-primary-600">{(stats as any).subjectPerformance?.filter((s: any) => s.progress === 100).length || 0}</p>
              <p className="text-foreground-muted text-sm mt-1">100% completion</p>
            </Card>

            <Card variant="elevated" padding="lg" className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 mx-auto mb-4">
                <Award className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="font-semibold text-foreground">Perfect Quizzes</h3>
              <p className="text-3xl font-bold text-foreground mt-2 text-violet-600">{(stats as any).quizPerformance?.filter((q: any) => q.accuracy === 100).length || 0}</p>
              <p className="text-foreground-muted text-sm mt-1">100% accuracy</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <Card variant="elevated" padding="lg">
              <h3 className="font-semibold text-foreground mb-6">Subject Breakdown</h3>
              <div className="space-y-4">
                {SUBJECTS.map((subject) => (
                  <div key={subject.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', `bg-gradient-to-br ${subject.gradient}`)}>
                      <subject.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{subject.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary-600 rounded-full" style={{ width: '0%' }} />
                        </div>
                        <span className="text-sm font-medium text-foreground w-12 text-right">0%</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">0/0</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <h3 className="font-semibold text-foreground mb-6">Achievements</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <AchievementBadge title="First Steps" description="Complete your first lesson" icon={Sparkles} earned={false} />
                <AchievementBadge title="Week Warrior" description="7-day study streak" icon={Flame} earned={false} />
                <AchievementBadge title="Quiz Master" description="Score 100% on a quiz" icon={Target} earned={false} />
                <AchievementBadge title="Speed Learner" description="Complete 5 topics in one day" icon={Zap} earned={false} />
                <AchievementBadge title="Subject Expert" description="Master a subject (100%)" icon={Award} earned={false} />
                <AchievementBadge title="Night Owl" description="Study after 10 PM" icon={Calendar} earned={false} />
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  )
}

function AchievementBadge({ title, description, icon: Icon, earned }: { title: string; description: string; icon: React.ComponentType<{ className?: string }>; earned: boolean }) {
  return (
    <Card variant={earned ? 'elevated' : 'ghost'} className={cn('text-center', earned ? 'border-primary-200' : 'opacity-50')}>
      <div className={cn('mx-auto h-14 w-14 items-center justify-center rounded-xl mb-3', earned ? 'bg-primary-100' : 'bg-muted')}>
        <Icon className={cn('h-7 w-7', earned ? 'text-primary-600' : 'text-foreground-muted')} />
      </div>
      <h4 className="font-medium text-foreground">{title}</h4>
      <p className="text-sm text-foreground-muted mt-1">{description}</p>
      {earned && <Badge variant="success" className="mt-2">Unlocked</Badge>}
    </Card>
  )
}