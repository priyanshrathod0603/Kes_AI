import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

const SAFE_URL_RE = /^(https?:\/\/|mailto:|\/|#)/i

function safeHref(href?: string | null): string | undefined {
  if (!href) return undefined
  const trimmed = href.trim()
  if (!SAFE_URL_RE.test(trimmed)) return undefined
  return trimmed
}

export interface MarkdownProps {
  content: string
  className?: string
}

/**
 * Render Markdown strings as safe, KES-themed React elements using react-markdown and remark-gfm.
 * Handles headings, bold, bullet & numbered lists, tables, dividers, blockquotes, and code blocks.
 */
export function Markdown({ content, className }: MarkdownProps) {
  if (!content) return null

  return (
    <div className={cn('markdown-body text-sm text-foreground space-y-3 leading-relaxed', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-bold text-foreground mt-4 mb-2 first:mt-0 tracking-tight" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-bold text-foreground mt-3 mb-2 first:mt-0 tracking-tight" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-semibold text-foreground mt-3 mb-1.5 first:mt-0" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-sm font-semibold text-foreground mt-2 mb-1 first:mt-0" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider mt-2 mb-1" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mt-2 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-2 leading-relaxed first:mt-0 last:mb-0" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic" {...props} />
          ),
          del: ({ node, ...props }) => (
            <del className="line-through text-foreground-muted" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-2 list-disc list-outside pl-5 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-2 list-decimal list-outside pl-5 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed pl-1" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-4 border-border" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="my-3 border-l-4 border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 px-4 py-2 rounded-r-lg text-foreground-muted italic"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-border bg-surface shadow-xs">
              <table className="w-full text-left text-sm border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted/70 text-xs font-semibold uppercase text-foreground border-b border-border" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-border text-foreground" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="transition-colors hover:bg-muted/30" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-2.5 font-semibold text-foreground border-r border-border last:border-r-0" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 align-top text-foreground border-r border-border last:border-r-0" {...props} />
          ),
          a: ({ node, href, children, ...props }) => {
            const safe = safeHref(href)
            if (!safe) return <span>{children}</span>
            const isExternal = /^https?:\/\//i.test(safe)
            return (
              <a
                href={safe}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-primary-600 underline underline-offset-2 hover:text-primary-700 font-medium"
                {...props}
              >
                {children}
              </a>
            )
          },
          code: ({ node, className: codeClass, children, ...props }) => {
            const isInline = !codeClass && typeof children === 'string' && !children.includes('\n')
            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono font-medium text-foreground"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code className={cn('font-mono text-xs text-slate-100', codeClass)} {...props}>
                {children}
              </code>
            )
          },
          pre: ({ node, ...props }) => (
            <pre
              className="my-3 overflow-x-auto rounded-xl border border-border bg-slate-900 p-4 text-xs font-mono leading-relaxed text-slate-100"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
