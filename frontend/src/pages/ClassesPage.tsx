'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useClasses } from '@/hooks'
import { SUBJECTS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { GraduationCap, BookOpen, Users, ArrowRight, ChevronRight, Sparkles, Calculator, FlaskConical, Globe, Languages, Cpu } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  calculator: Calculator,
  'flask-conical': FlaskConical,
  'book-open': BookOpen,
  globe: Globe,
  languages: Languages,
  cpu: Cpu,
}

function getSubjectIcon(iconName: string) {
  return iconMap[iconName] || BookOpen
}

export function ClassesPage() {
  const { data: classes, isLoading } = useClasses()

  return (
    <div className="space-y-6 animate-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
          <p className="text-foreground-muted">Manage your classes and subjects</p>
        </div>
        <Button variant="gradient">
          <GraduationCap className="h-4 w-4 mr-2" />
          Join Class
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} variant="elevated" padding="lg" className="h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </Card>
          ))}
        </div>
      ) : classes?.length === 0 ? (
        <Card variant="elevated" padding="lg" className="text-center py-12">
          <GraduationCap className="mx-auto h-16 w-16 text-foreground-muted mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No classes yet</h3>
          <p className="text-foreground-muted mt-2">Join a class to start learning with your peers</p>
          <Button variant="gradient" className="mt-4">
            <GraduationCap className="h-4 w-4 mr-2" />
            Join a Class
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes?.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card variant="elevated" padding="lg" className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-500">
                      <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{cls.name}</h3>
                      <p className="text-sm text-foreground-muted">Grade {cls.grade} • Section {cls.section}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{cls.studentCount} students</Badge>
                </div>
                <div className="flex-1 space-y-3 mb-6">
                  {cls.subjects.slice(0, 3).map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', `bg-gradient-to-br ${subject.gradient}`)}>
                          <subject.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{subject.name}</p>
                          <p className="text-xs text-foreground-muted">{subject.chaptersCompleted}/{subject.totalChapters} chapters</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{subject.progress}%</p>
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-primary-600 rounded-full" style={{ width: `${subject.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {cls.subjects.length > 3 && (
                    <Badge variant="outline" className="w-fit mx-auto">+{cls.subjects.length - 3} more subjects</Badge>
                  )}
                </div>
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`/classes/${cls.id}`}>View Class</a>
                  </Button>
                  <Button variant="default" className="flex-1" asChild>
                    <a href={`/classes/${cls.id}/subjects`}>Subjects</a>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}