'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { SUBJECTS } from '@/lib/constants'
import { BookOpen, ChevronRight, Target, Clock, BarChart2, Sparkles } from 'lucide-react'

export function SubjectsPage() {
  return (
    <div className="space-y-6 animate-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subjects</h1>
          <p className="text-foreground-muted">Explore all your subjects and track progress</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {SUBJECTS.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.08 }}
          >
            <Card variant="elevated" padding="lg" className="h-full flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl', `bg-gradient-to-br ${subject.gradient}`)}>
                  <subject.icon className="h-8 w-8 text-white" />
                </div>
                <Badge variant="secondary">{subject.chaptersCompleted}/{subject.totalChapters} chapters</Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{subject.name}</h3>
              <p className="text-foreground-muted text-sm mb-6 flex-1">{subject.description || `Learn ${subject.name} with interactive lessons, practice problems, and AI-powered guidance.`}</p>
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-foreground-muted">Overall Progress</span>
                    <span className="font-semibold text-foreground">{subject.progress}%</span>
                  </div>
                  <Progress value={subject.progress} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <Target className="mx-auto h-5 w-5 text-foreground-muted mb-1" />
                    <p className="text-2xl font-bold text-foreground">{subject.chaptersCompleted}</p>
                    <p className="text-xs text-foreground-muted">Chapters done</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <Clock className="mx-auto h-5 w-5 text-foreground-muted mb-1" />
                    <p className="text-2xl font-bold text-foreground">12h</p>
                    <p className="text-xs text-foreground-muted">Study time</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <BarChart2 className="mx-auto h-5 w-5 text-foreground-muted mb-1" />
                    <p className="text-2xl font-bold text-foreground">85%</p>
                    <p className="text-xs text-foreground-muted">Quiz avg</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="default" className="flex-1" asChild>
                  <a href={`/subjects/${subject.id}`}>Continue Learning</a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`/subjects/${subject.id}/practice`}>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Practice
                  </a>
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <a href="/ai-tutor">
                <Sparkles className="h-6 w-6" />
                <span>Ask AI Tutor</span>
                <span className="text-xs text-foreground-muted">Get instant help</span>
              </a>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <a href="/study-material">
                <BookOpen className="h-6 w-6" />
                <span>Study Material</span>
                <span className="text-xs text-foreground-muted">Browse resources</span>
              </a>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <a href="/practice">
                <Target className="h-6 w-6" />
                <span>Practice Problems</span>
                <span className="text-xs text-foreground-muted">Test your skills</span>
              </a>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <a href="/quizzes">
                <BarChart2 className="h-6 w-6" />
                <span>Take a Quiz</span>
                <span className="text-xs text-foreground-muted">Check knowledge</span>
              </a>
            </Button>
          </div>
        </Card>

        <Card variant="gradient" padding="lg" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-indigo-500/10 to-violet-500/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600/20">
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI-Powered Learning</h3>
                <p className="text-sm text-foreground-muted">Personalized recommendations</p>
              </div>
            </div>
            <p className="text-foreground-muted mb-6">Get personalized study plans, adaptive quizzes, and instant explanations tailored to your learning style.</p>
            <Button variant="default" size="lg" className="w-full" asChild>
              <a href="/ai-tutor">
                <Sparkles className="h-4 w-4 mr-2" />
                Try AI Tutor Now
              </a>
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}