'use client'

import { useEffect, useRef, useState, useCallback, type FormEvent, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  RefreshCcw,
  Trash2,
  Bot,
  User as UserIcon,
  AlertCircle,
  Lightbulb,
  GraduationCap,
  BookOpen,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader, ErrorState, EmptyState } from '@/components/feedback/States'
import { useAIChat, useClasses, useSubjects, useChapters, useTopics } from '@/hooks'
import { cn } from '@/lib/utils'
import { QUICK_PROMPTS } from '@/lib/constants'
import type { ApiError } from '@/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  pending?: boolean
  error?: string
}

const STORAGE_KEY = 'kes.ai.messages.v1'

function loadMessages(): Message[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed as Message[]
  } catch {
    return null
  }
}

function saveMessages(messages: Message[]) {
  try {
    // Don't persist pending/error states
    const cleaned = messages.filter((m) => !m.pending && !m.error)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
  } catch {
    /* ignore quota errors */
  }
}

function newId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function getErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error'
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null) {
    const apiErr = err as ApiError
    return apiErr.message || 'Unknown error'
  }
  return String(err)
}

export function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    return (
      loadMessages() ?? [
        {
          id: 'welcome',
          role: 'assistant',
          content:
            "Hi, I'm KES — your AI tutor.\n\nAsk me to explain a concept, give examples, create a practice quiz, or summarise a topic. Pick a class, subject, chapter, or topic for a more relevant answer, then type your question below.",
          timestamp: Date.now(),
        },
      ]
    )
  })
  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [topicId, setTopicId] = useState('')

  const { data: classes = [], isLoading: classesLoading, error: classesError } = useClasses()
  const { data: subjects = [] } = useSubjects(classId ? { classId } : undefined)
  const { data: chapters = [] } = useChapters(subjectId ? { subjectId } : undefined)
  const { data: topics = [] } = useTopics(chapterId ? { chapterId } : undefined)

  const ai = useAIChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    saveMessages(messages)
    // Scroll to bottom on update
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }, [messages])

  const buildSystemPrompt = useCallback(() => {
    const className = classes.find((c) => c.id === classId)?.name
    const subjectName = subjects.find((s) => s.id === subjectId)?.name
    const chapterName = chapters.find((c) => c.id === chapterId)?.name
    const topicName = topics.find((t) => t.id === topicId)?.name
    const bits: string[] = []
    if (className) bits.push(`Class: ${className}`)
    if (subjectName) bits.push(`Subject: ${subjectName}`)
    if (chapterName) bits.push(`Chapter: ${chapterName}`)
    if (topicName) bits.push(`Topic: ${topicName}`)
    const context = bits.length ? `Current focus — ${bits.join(' • ')}.` : ''
    return `You are KES, an AI tutor for school students built by Krishna Software Solution. Use simple, age-appropriate language, give examples, and keep answers focused. ${context}`.trim()
  }, [classes, subjects, chapters, topics, classId, subjectId, chapterId, topicId])

  const send = useCallback(
    async (overridePrompt?: string) => {
      const text = (overridePrompt ?? input).trim()
      if (!text || ai.isSending) return

      const userMsg: Message = {
        id: newId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      }
      const pendingId = newId()
      const pending: Message = {
        id: pendingId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        pending: true,
      }
      setMessages((prev) => [...prev, userMsg, pending])
      setInput('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'

      try {
        const data = await ai.sendMessage(text)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? { ...m, content: data.response, pending: false }
              : m
          )
        )
      } catch (err) {
        const msg = getErrorMessage(err)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? { ...m, pending: false, error: msg }
              : m
          )
        )
      }
    },
    [ai, input]
  )

  const retry = useCallback(
    (failedId: string) => {
      const failed = messages.find((m) => m.id === failedId)
      if (!failed) return
      // Find the user message right before this failed assistant message
      const idx = messages.findIndex((m) => m.id === failedId)
      const prev = messages[idx - 1]
      if (!prev || prev.role !== 'user') return
      // Remove the failed assistant message
      setMessages((m) => m.filter((x) => x.id !== failedId))
      send(prev.content)
    },
    [messages, send]
  )

  const regenerate = useCallback(() => {
    // Find the last user message
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    // Drop the last assistant message if any
    setMessages((prev) => {
      const idx = [...prev].reverse().findIndex((m) => m.role === 'assistant')
      if (idx === -1) return prev
      const realIdx = prev.length - 1 - idx
      return [...prev.slice(0, realIdx), ...prev.slice(realIdx + 1)]
    })
    send(lastUser.content)
  }, [messages, send])

  const clearConversation = () => {
    if (!confirm('Clear the current conversation?')) return
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Conversation cleared. How can I help you?',
        timestamp: Date.now(),
      },
    ])
  }

  const copy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500)
    } catch {
      /* ignore */
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const onInput = (e: FormEvent<HTMLTextAreaElement>) => {
    setInput(e.currentTarget.value)
    // auto-grow
    e.currentTarget.style.height = 'auto'
    e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 200) + 'px'
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-9rem)]">
      <PageHeader
        title="AI Tutor"
        description="Ask anything about your studies. Pick a context for more relevant answers."
        actions={
          <Button variant="outline" size="sm" onClick={clearConversation}>
            <Trash2 className="h-4 w-4 mr-1" /> Clear
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr] flex-1 min-h-0">
        {/* Context panel */}
        <Card className="hidden lg:flex flex-col p-4 gap-4 overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Learning context
            </h3>
            <p className="text-xs text-foreground-muted">
              Optional. Helps KES tailor its response.
            </p>
          </div>

          {classesError ? (
            <ErrorState
              title="Couldn't load classes"
              description={getErrorMessage(classesError)}
              className="py-4"
            />
          ) : (
            <Field
              label="Class"
              value={classId}
              onChange={(v) => {
                setClassId(v)
                setSubjectId('')
                setChapterId('')
                setTopicId('')
              }}
              options={classes}
              disabled={classesLoading}
              placeholder={classesLoading ? 'Loading…' : 'Select class'}
            />
          )}
          <Field
            label="Subject"
            value={subjectId}
            onChange={(v) => {
              setSubjectId(v)
              setChapterId('')
              setTopicId('')
            }}
            options={subjects}
            disabled={!classId}
            placeholder={classId ? 'Select subject' : 'Pick a class first'}
          />
          <Field
            label="Chapter"
            value={chapterId}
            onChange={(v) => {
              setChapterId(v)
              setTopicId('')
            }}
            options={chapters}
            disabled={!subjectId}
            placeholder={subjectId ? 'Select chapter' : 'Pick a subject first'}
          />
          <Field
            label="Topic"
            value={topicId}
            onChange={setTopicId}
            options={topics}
            disabled={!chapterId}
            placeholder={chapterId ? 'Select topic' : 'Pick a chapter first'}
          />

          {messages.length > 1 && (
            <Button variant="ghost" size="sm" onClick={regenerate} disabled={ai.isSending}>
              <RotateCcw className="h-4 w-4 mr-1" /> Regenerate last
            </Button>
          )}
        </Card>

        {/* Chat area */}
        <Card className="flex flex-col min-h-0 overflow-hidden">
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <EmptyState
                title="Start a conversation"
                description="Ask a question or pick a quick prompt below."
              />
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    copied={copiedId === m.id}
                    onCopy={() => copy(m.id, m.content)}
                    onRetry={() => retry(m.id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Quick prompts */}
          <div className="px-4 sm:px-6 pb-2 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => send(p.prompt)}
                disabled={ai.isSending}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground-muted hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Sparkles className="h-3 w-3" />
                {p.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="border-t border-border p-3 sm:p-4 bg-surface"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onInput={onInput}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Ask KES anything…  (Enter to send · Shift+Enter for newline)"
                className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 max-h-[200px]"
                disabled={ai.isSending}
              />
              <Button type="submit" disabled={ai.isSending || !input.trim()}>
                {ai.isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { id: string; name: string }[]
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 w-full h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
      >
        <option value="">{placeholder ?? 'Select…'}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function MessageBubble({
  message,
  copied,
  onCopy,
  onRetry,
}: {
  message: Message
  copied: boolean
  onCopy: () => void
  onRetry: () => void
}) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-violet-600 text-white">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className={cn('max-w-[85%] sm:max-w-[75%]')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words',
            isUser
              ? 'bg-primary-600 text-white'
              : 'bg-muted text-foreground',
            message.error && 'bg-error-50 border border-error-200'
          )}
        >
          {message.pending ? (
            <span className="inline-flex items-center gap-1 text-foreground-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted animate-bounce [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted animate-bounce [animation-delay:240ms]" />
            </span>
          ) : message.error ? (
            <div className="flex items-start gap-2 text-error-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Could not get a response</p>
                <p className="text-xs mt-1 opacity-80">{message.error}</p>
              </div>
            </div>
          ) : (
            message.content
          )}
        </div>
        <div
          className={cn(
            'mt-1 flex items-center gap-2 text-[11px] text-foreground-muted',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          <span>{formatTime(message.timestamp)}</span>
          {!isUser && !message.pending && !message.error && (
            <>
              <button
                onClick={onCopy}
                className="inline-flex items-center gap-1 hover:text-foreground"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 hover:text-foreground"
                aria-label="Regenerate response"
              >
                <RefreshCcw className="h-3 w-3" />
                Retry
              </button>
            </>
          )}
          {message.error && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 text-error-600 hover:text-error-700"
            >
              <RefreshCcw className="h-3 w-3" /> Retry
            </button>
          )}
        </div>
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  )
}
