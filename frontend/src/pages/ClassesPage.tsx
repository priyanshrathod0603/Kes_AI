'use client'

import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { useClasses, useSubjects } from '@/hooks'

export function ClassesPage() {
  const { data: classes = [], isLoading, error, refetch } = useClasses()
  const { data: subjects = [] } = useSubjects()

  const errorMessage =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : 'Could not load classes.'

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Browse your school classes and dive into subjects"
      />

      {isLoading ? (
        <LoadingState label="Loading classes…" />
      ) : error ? (
        <ErrorState description={errorMessage} onRetry={() => refetch()} />
      ) : classes.length === 0 ? (
        <EmptyState
          title="No classes yet"
          description="Once classes are added on the backend, they'll appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => {
            const classSubjects = subjects.filter((s) => s.classId === cls.id)
            return (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground">{cls.name}</h3>
                      <p className="text-xs text-foreground-muted">Class</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground-muted mb-4">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {classSubjects.length} subject{classSubjects.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {classSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {classSubjects.slice(0, 4).map((s) => (
                        <Badge key={s.id} variant="secondary" className="text-xs">
                          {s.name}
                        </Badge>
                      ))}
                      {classSubjects.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{classSubjects.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="mt-auto">
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/classes/${cls.id}`}>
                        View class <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
