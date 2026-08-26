'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useClasses } from '@/hooks'
import { GraduationCap, BookOpen, Users, ArrowRight, ChevronRight, Sparkles } from 'lucide-react'

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
                      <p className="text-sm text-foreground-muted">Class</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-3 mb-6">
                  <p className="text-foreground-muted text-sm">Subjects will appear here once added</p>
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