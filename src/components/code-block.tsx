'use client'

import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { highlightCode } from '@/lib/highlight'
import { cn } from '@/lib/utils'

/** 带复制按钮（复制成功闪烁反馈）的代码块 —— 程序员博客标配 */
export function CodeBlock({
  code,
  lang = 'c',
  title,
  className,
}: {
  code: string
  lang?: string
  title?: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const [flash, setFlash] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = code
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setFlash(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setCopied(false)
      setFlash(false)
    }, 1600)
  }

  React.useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return (
    <div className={cn('group/code overflow-hidden rounded-lg border bg-zinc-950', className)}>
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1" aria-hidden>
            <i className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <i className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wide text-zinc-400">
            {title ?? lang}
          </span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          aria-label="复制代码"
          className={cn(
            'inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 font-mono text-[11px] text-zinc-300 transition-all hover:border-emerald-500/60 hover:text-emerald-300',
            flash && 'copy-flash border-emerald-500/60 text-emerald-300',
          )}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-zinc-100">
        <code>{highlightCode(code)}</code>
      </pre>
    </div>
  )
}
