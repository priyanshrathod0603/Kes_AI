'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Bot, Send, Copy, RotateCcw, Lightbulb, Sparkles, HelpCircle, FileText, X, ChevronLeft, ChevronRight, Loader2, Paperclip, Mic, Settings, BookOpen, GraduationCap, Layers, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAIChat, useAIConversation, useDeleteConversation } from '@/hooks'
import { QUICK_PROMPTS, AI_RESPONSE_ACTIONS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'
import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true,
})

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  actions?: string[]
}

const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: `Hello! I'm your AI Tutor 👋 I'm here to help you learn and understand any topic you're studying.

**What can I help you with?**
- 📚 **Explain concepts** - "Explain photosynthesis in simple terms"
- 💡 **Give examples** - "Show me a real-world example of quadratic equations"
- 🎯 **Practice & quiz** - "Quiz me on fractions" or "Give me practice problems"
- 📝 **Summarize** - "Summarize Chapter 3 of Science"
- 🔍 **Step-by-step help** - "Help me solve this math problem"

**Quick tips:**
- Select your class, subject, and topic above for more relevant answers
- Use the quick prompts below for common tasks
- Click actions on my responses to copy, simplify, or create quizzes

What would you like to learn today?`,
    timestamp: new Date(),
  },
]

const contextOptions = {
  class: [
    { value: '', label: 'Select Class' },
    { value: '5', label: 'Class 5' },
    { value: '6', label: 'Class 6' },
    { value: '7', label: 'Class 7' },
    { value: '8', label: 'Class 8' },
    { value: '9', label: 'Class 9' },
    { value: '10', label: 'Class 10' },
    { value: '11', label: 'Class 11' },
    { value: '12', label: 'Class 12' },
  ],
  subject: [
    { value: '', label: 'Select Subject' },
    { value: 'math', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'english', label: 'English' },
    { value: 'social', label: 'Social Science' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'computer', label: 'Computer Science' },
  ],
  chapter: [
    { value: '', label: 'Select Chapter' },
    { value: '1', label: 'Chapter 1' },
    { value: '2', label: 'Chapter 2' },
    { value: '3', label: 'Chapter 3' },
    { value: '4', label: 'Chapter 4' },
  ],
  topic: [
    { value: '', label: 'Select Topic' },
    { value: '1', label: 'Topic 1' },
    { value: '2', label: 'Topic 2' },
    { value: '3', label: 'Topic 3' },
  ],
}

export function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [context, setContext] = useState({ class: '', subject: '', chapter: '', topic: '' })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { sendMessage, regenerate, simplify, example, quiz, summarize, isSending, isRegenerating } = useAIChat()
  const deleteConversation = useDeleteConversation()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { message: '' },
  })

  const message = watch('message', '')

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = async (customMessage?: string | { message: string }) => {
    const text = typeof customMessage === 'string' ? customMessage : customMessage?.message || message.trim()
    if (!text || isSending) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setShowQuickPrompts(false)
    reset()

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await sendMessage({
        prompt: text,
        context: Object.values(context).some(v => v) ? {
          classId: context.class || undefined,
          subjectId: context.subject || undefined,
          chapterId: context.chapter || undefined,
          topicId: context.topic || undefined,
        } : undefined,
        conversationHistory: messages.slice(-10).map(m => ({ 
          id: m.id, 
          role: m.role, 
          content: m.content, 
          timestamp: m.timestamp 
        })),
      })

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: response.data?.response || 'Sorry, I encountered an error.', isStreaming: false }
            : m
        )
      )
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false }
            : m
        )
      )
    }
  }

  const handleAction = async (action: string, messageId: string) => {
    const msg = messages.find(m => m.id === messageId)
    if (!msg) return

    let response: string
    try {
      switch (action) {
        case 'regenerate':
          response = (await regenerate(messageId)).data?.response || 'Error'
          break
        case 'simplify':
          response = (await simplify(messageId)).data?.response || 'Error'
          break
        case 'example':
          response = (await example(messageId)).data?.response || 'Error'
          break
        case 'quiz':
          response = (await quiz(messageId)).data?.response || 'Error'
          break
        case 'summarize':
          response = (await summarize(messageId)).data?.response || 'Error'
          break
        default:
          return
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: response } : m
        )
      )
    } catch (error) {
      console.error('Action failed:', error)
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const renderMarkdown = (content: string) => {
    const html = marked.parse(content)
    return <div dangerouslySetInnerHTML={{ __html: html }} className="prose prose-sm max-w-none text-foreground" />
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-20 bg-surface/80 backdrop-blur-sm border-b border-border">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">AI Tutor</h1>
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuItem>Clear conversation</DropdownMenuItem>
                <DropdownMenuItem>Export chat</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Report issue</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden" onClick={() => setIsContextPanelOpen(!isContextPanelOpen)}>
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-4 pb-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={context.class}
              onChange={(e) => setContext({ ...context, class: e.target.value })}
              className="flex h-9 w-auto items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              aria-label="Select class"
            >
              {contextOptions.class.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={context.subject}
              onChange={(e) => setContext({ ...context, subject: e.target.value })}
              className="flex h-9 w-auto items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              aria-label="Select subject"
              disabled={!context.class}
            >
              {contextOptions.subject.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={context.chapter}
              onChange={(e) => setContext({ ...context, chapter: e.target.value })}
              className="flex h-9 w-auto items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              aria-label="Select chapter"
              disabled={!context.subject}
            >
              {contextOptions.chapter.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={context.topic}
              onChange={(e) => setContext({ ...context, topic: e.target.value })}
              className="flex h-9 w-auto items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              aria-label="Select topic"
              disabled={!context.chapter}
            >
              {contextOptions.topic.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {Object.values(context).some(v => v) && (
              <Button variant="ghost" size="sm" onClick={() => setContext({ class: '', subject: '', chapter: '', topic: '' })}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside
          className={cn(
            'hidden lg:block w-72 border-r border-border bg-surface flex flex-col',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <h3 className="font-semibold text-foreground">History</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSidebarOpen(false)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              <p className="text-xs text-foreground-muted px-2">No conversations yet</p>
            </div>
          </ScrollArea>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}
                  >
                    <Avatar
                      size="md"
                      className="flex-shrink-0 mt-1"
                      src={msg.role === 'assistant' ? undefined : undefined}
                      fallback={msg.role === 'assistant' ? 'AI' : 'You'}
                    >
                      {msg.role === 'assistant' && <Bot className="h-5 w-5" />}
                    </Avatar>
                    <div
                      className={cn(
                        'max-w-[70%] lg:max-w-[60%] rounded-2xl p-4',
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-tr-sm'
                          : 'bg-surface border border-border rounded-tl-sm'
                      )}
                    >
                      {msg.isStreaming ? (
                        <div className="flex items-center gap-2 text-foreground-muted">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      ) : (
                        <>
                          <div className="markdown">{renderMarkdown(msg.content)}</div>
                          {!msg.isStreaming && msg.role === 'assistant' && (
                            <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-3 border-t border-border/50">
                              {AI_RESPONSE_ACTIONS.map((action) => (
                                <Button
                                  key={action.action}
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 h-8 px-2 text-xs"
                                  onClick={() => handleAction(action.action, msg.id)}
                                  disabled={isRegenerating}
                                >
                                  <action.icon className="h-3.5 w-3.5" />
                                  <span>{action.label}</span>
                                </Button>
                              ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 h-8 px-2 text-xs"
                                onClick={() => handleCopy(msg.content)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                      <div className="mt-2 flex items-center justify-end gap-2 text-xs text-foreground-muted">
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {showQuickPrompts && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-t border-border bg-surface/50"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">Quick prompts</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowQuickPrompts(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt.label}
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => handleSendMessage(prompt.prompt)}
                  >
                    {prompt.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="p-4 border-t border-border bg-surface">
            <form onSubmit={handleSubmit(handleSendMessage)} className="relative">
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-xl"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Textarea
                  {...register('message')}
                  placeholder="Ask anything about your studies..."
                  className="flex-1 min-h-[52px] max-h-48 pr-12 resize-none"
                  ref={textareaRef}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={isSending}
                />
                <div className="flex items-end gap-1 pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    aria-label="Voice input"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    disabled={isSending || !message.trim()}
                    aria-label="Send message"
                  >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isContextPanelOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setIsContextPanelOpen(false)}
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 z-50 h-full w-80 lg:w-96 bg-surface border-l border-border flex flex-col lg:hidden"
              >
                <div className="flex h-16 items-center justify-between px-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Learning Context</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsContextPanelOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto">
                  <div>
                    <label className="text-sm font-medium text-foreground">Class</label>
                    <select
                      value={context.class}
                      onChange={(e) => setContext({ ...context, class: e.target.value })}
                      className="mt-1.5 w-full h-10 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      {contextOptions.class.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Subject</label>
                    <select
                      value={context.subject}
                      onChange={(e) => setContext({ ...context, subject: e.target.value })}
                      className="mt-1.5 w-full h-10 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      disabled={!context.class}
                    >
                      {contextOptions.subject.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Chapter</label>
                    <select
                      value={context.chapter}
                      onChange={(e) => setContext({ ...context, chapter: e.target.value })}
                      className="mt-1.5 w-full h-10 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      disabled={!context.subject}
                    >
                      {contextOptions.chapter.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Topic</label>
                    <select
                      value={context.topic}
                      onChange={(e) => setContext({ ...context, topic: e.target.value })}
                      className="mt-1.5 w-full h-10 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      disabled={!context.chapter}
                    >
                      {contextOptions.topic.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {Object.values(context).some(v => v) && (
                    <Button variant="outline" className="w-full" onClick={() => setContext({ class: '', subject: '', chapter: '', topic: '' })}>
                      Clear context
                    </Button>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}