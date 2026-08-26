'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Bot,
  ArrowRight,
  FileText,
  Plus,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/feedback/States'
import { CreateClassDialog, CreateSubjectDialog } from '@/components/management'
import { useClasses, useSubjects, useDocuments } from '@/hooks'
import { APP_NAME, COMPANY_NAME } from '@/lib/constants'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

function formatFileSize(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DashboardPage() {
  const [createClassOpen, setCreateClassOpen] = useState(false)
  const [createSubjectOpen, setCreateSubjectOpen] = useState(false)

  const { data: classes = [] } = useClasses()
  const { data: subjects = [] } = useSubjects()
  const { data: docs } = useDocuments({ limit: 5 })
  const totalDocuments = docs?.total ?? 0
  const recentDocs = docs?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${getGreeting()} 👋`}
        description="Welcome to KES — your personalized academic learning management platform."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreateClassOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Class
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCreateSubjectOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Subject
            </Button>
            <Button asChild size="sm">
              <Link to="/study-material">
                <FileText className="h-4 w-4 mr-1.5" /> Upload Material
              </Link>
            </Button>
          </div>
        }
      />

      {/* Snapshot metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/classes" className="block focus:outline-none">
          <Card className="p-5 hover:shadow-md hover:border-primary-200 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                  Academic Classes
                </p>
                <p className="text-3xl font-bold text-foreground mt-1.5">{classes.length}</p>
                <p className="text-xs text-primary-600 font-medium mt-1 inline-flex items-center">
                  Manage classes <ArrowRight className="h-3 w-3 ml-1" />
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950/40">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/subjects" className="block focus:outline-none">
          <Card className="p-5 hover:shadow-md hover:border-primary-200 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                  Active Subjects
                </p>
                <p className="text-3xl font-bold text-foreground mt-1.5">{subjects.length}</p>
                <p className="text-xs text-primary-600 font-medium mt-1 inline-flex items-center">
                  Manage subjects <ArrowRight className="h-3 w-3 ml-1" />
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/study-material" className="block focus:outline-none sm:col-span-2 lg:col-span-1">
          <Card className="p-5 hover:shadow-md hover:border-primary-200 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                  Study Materials
                </p>
                <p className="text-3xl font-bold text-foreground mt-1.5">{totalDocuments}</p>
                <p className="text-xs text-primary-600 font-medium mt-1 inline-flex items-center">
                  Browse document library <ArrowRight className="h-3 w-3 ml-1" />
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/40">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Main dashboard columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Documents */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Recent Study Materials</h2>
                <p className="text-xs text-foreground-muted">Latest resources added to your library</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/study-material">
                  View library <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {recentDocs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-foreground-muted mb-2">No study materials uploaded yet.</p>
                <Button asChild size="sm" variant="outline">
                  <Link to="/study-material">
                    <Plus className="h-4 w-4 mr-1.5" /> Upload first PDF
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentDocs.map((doc) => {
                  const subject = subjects.find((s) => s.id === doc.subjectId)
                  return (
                    <div key={doc.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/study-material/${doc.id}`}
                          className="font-medium text-sm text-foreground truncate hover:text-primary-600 block"
                        >
                          {doc.title}
                        </Link>
                        <p className="text-xs text-foreground-muted truncate">
                          {subject?.name ? `${subject.name} • ` : ''}
                          {formatFileSize(doc.fileSize)}
                          {doc.createdAt && ` • ${formatDate(doc.createdAt)}`}
                        </p>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/study-material/${doc.id}`}>
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open
                        </Link>
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Subjects List */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Subjects Directory</h2>
                <p className="text-xs text-foreground-muted">Explore syllabus and topics</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/subjects">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {subjects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-foreground-muted mb-2">No subjects configured yet.</p>
                <Button size="sm" variant="outline" onClick={() => setCreateSubjectOpen(true)}>
                  <Plus className="h-4 w-4 mr-1.5" /> Add Subject
                </Button>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {subjects.slice(0, 6).map((s) => {
                  const cls = classes.find((c) => c.id === s.classId)
                  return (
                    <Link
                      key={s.id}
                      to={`/subjects/${s.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/40 shrink-0">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{s.name}</p>
                        <p className="text-xs text-foreground-muted truncate">
                          {cls?.name ?? 'Academic Subject'}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-foreground-muted shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right column sidebar */}
        <div className="space-y-6">
          {/* AI Tutor Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-600 text-white p-6 shadow-md">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_50%)]" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">KES AI Tutor</h3>
                  <p className="text-xs text-white/80">AI Learning Companion</p>
                </div>
              </div>
              <p className="text-sm text-white/90 mb-4 leading-relaxed">
                Need help understanding a concept, solving problems, or preparing for tests? Ask KES AI Tutor.
              </p>
              <Button asChild variant="secondary" className="w-full font-semibold shadow-xs">
                <Link to="/ai-tutor">
                  <Sparkles className="h-4 w-4 mr-1.5 text-primary-600" /> Start AI Chat
                </Link>
              </Button>
            </div>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-3 text-sm">Quick Actions</h3>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setCreateClassOpen(true)}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
              >
                <GraduationCap className="h-4 w-4 text-primary-600" />
                <span>Add New Class</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateSubjectOpen(true)}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
              >
                <BookOpen className="h-4 w-4 text-primary-600" />
                <span>Add New Subject</span>
              </button>
              <Link
                to="/study-material"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <FileText className="h-4 w-4 text-primary-600" />
                <span>Upload PDF Document</span>
              </Link>
              <Link
                to="/quizzes"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Clock className="h-4 w-4 text-primary-600" />
                <span>Practice Quizzes</span>
              </Link>
            </div>
          </Card>

          {/* About KES Card */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-1 text-sm">About {APP_NAME}</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              {APP_NAME} is an integrated AI-powered student learning platform by {COMPANY_NAME}.
            </p>
          </Card>
        </div>
      </div>

      <CreateClassDialog
        open={createClassOpen}
        onClose={() => setCreateClassOpen(false)}
      />

      <CreateSubjectDialog
        open={createSubjectOpen}
        onClose={() => setCreateSubjectOpen(false)}
      />
    </div>
  )
}
