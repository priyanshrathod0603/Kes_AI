'use client'

import { Link, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, EmptyState, ErrorState, LoadingState } from '@/components/feedback/States'
import { useClasses, useSubjects } from '@/hooks'

export function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: classes = [], isLoading: classesLoading, error: classesError } = useClasses()
  const { data: subjects = [], isLoading: subjectsLoading, error: subjectsError } = useSubjects(
    id ? { classId: id } : undefined
  )

  const cls = classes.find((c) => c.id === id)

  if (classesLoading || subjectsLoading) return <LoadingState label="Loading class…" />

  if (classesError || subjectsError) {
    const msg =
      (classesError as { message?: string } | null)?.message ||
      (subjectsError as { message?: string } | null)?.message ||
      'Could not load class.'
    return <ErrorState description={msg} />
  }

  if (!cls) {
    return (
      <EmptyState
        title="Class not found"
        description="This class does not exist or has been removed."
      />
    )
  }

  return (
    <div>
      <PageHeader
        title={cls.name}
        description="Subjects in this class"
        back={{ to: '/classes' }}
      />

      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          description="This class has no subjects yet."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{s.name}</h3>
                    <p className="text-xs text-foreground-muted">Subject</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/subjects/${s.id}`}>
                      Open subject <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
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
