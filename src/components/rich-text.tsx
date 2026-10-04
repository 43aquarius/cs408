'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * 轻量富文本：支持 **加粗**、`行内代码` 与换行。
 * 避免引入完整 markdown 库，保持零依赖与渲染一致性。
 */
export function RichText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const lines = text.split('\n')
  return (
    <div className={cn('leading-relaxed whitespace-pre-wrap break-words', className)}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {renderInline(line)}
        </React.Fragment>
      ))}
    </div>
  )
}

function renderInline(line: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // 依次匹配 **bold** 与 `code`
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) parts.push(<React.Fragment key={key++}>{line.slice(last, m.index)}</React.Fragment>)
    const tok = m[0]
    if (tok.startsWith('**')) {
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {tok.slice(2, -2)}
        </strong>,
      )
    } else {
      parts.push(
        <code
          key={key++}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-emerald-700 dark:text-emerald-300"
        >
          {tok.slice(1, -1)}
        </code>,
      )
    }
    last = m.index + tok.length
  }
  if (last < line.length) parts.push(<React.Fragment key={key++}>{line.slice(last)}</React.Fragment>)
  return parts
}
