'use client'

import React from 'react'
import { AlertTriangle, KeyRound, Lightbulb } from 'lucide-react'
import { CodeBlock } from '@/components/code-block'
import { RichText } from '@/components/rich-text'
import { CALLOUT_META } from '@/data/notes/types'
import type { NoteBlock, CalloutTone } from '@/data/notes/types'
import { cn } from '@/lib/utils'

const CALLOUT_ICONS: Record<CalloutTone, React.ComponentType<{ className?: string }>> = {
  tip: Lightbulb,
  warn: AlertTriangle,
  key: KeyRound,
}

const CALLOUT_TEXT: Record<CalloutTone, string> = {
  tip: 'text-sky-700 dark:text-sky-300',
  warn: 'text-rose-700 dark:text-rose-300',
  key: 'text-emerald-700 dark:text-emerald-300',
}

/** 经验笔记内容块渲染器：段落/子标题/列表/代码/表格/提示框/步骤/要点卡 */
export function NoteBlocks({ blocks }: { blocks: NoteBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((b, i) => (
        <NoteBlockView key={i} block={b} />
      ))}
    </div>
  )
}

function NoteBlockView({ block: b }: { block: NoteBlock }) {
  switch (b.kind) {
    case 'p':
      return (
        <RichText
          text={b.text}
          className="text-[15px] leading-7 text-foreground/90"
        />
      )

    case 'h':
      return (
        <h3 className="!mt-8 flex items-center gap-2 border-b pb-1.5 text-base font-bold">
          <span className="font-mono text-xs text-primary">##</span>
          {b.text}
        </h3>
      )

    case 'list':
      return b.ordered ? (
        <ol className="ml-1 flex list-none flex-col gap-2">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/15 font-mono text-[11px] font-bold text-primary">
                {i + 1}
              </span>
              <RichText text={it} className="text-[15px] leading-7 text-foreground/90" />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="ml-1 flex flex-col gap-2">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-sm bg-primary/70" />
              <RichText text={it} className="text-[15px] leading-7 text-foreground/90" />
            </li>
          ))}
        </ul>
      )

    case 'code':
      return <CodeBlock code={b.text} lang={b.lang ?? 'c'} title={b.title} />

    case 'table':
      return (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/70">
                {b.head.map((h, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap border-b px-3 py-2 text-left font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, i) => (
                <tr key={i} className="odd:bg-transparent even:bg-muted/30">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={cn(
                        'px-3 py-2 align-top leading-relaxed text-muted-foreground',
                        j === 0 && 'font-medium text-foreground',
                      )}
                    >
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'callout': {
      const meta = CALLOUT_META[b.tone]
      const Icon = CALLOUT_ICONS[b.tone]
      return (
        <div className={cn('rounded-lg border p-4', meta.cls)}>
          <p className={cn('mb-1.5 flex items-center gap-1.5 text-sm font-semibold', CALLOUT_TEXT[b.tone])}>
            <Icon className="h-4 w-4" />
            {b.title ?? meta.label}
          </p>
          <RichText text={b.text} className="text-sm leading-6 text-foreground/85" />
        </div>
      )
    }

    case 'steps':
      return (
        <ol className="relative ml-3 flex flex-col gap-3 border-l-2 border-dashed border-primary/40 pl-5">
          {b.items.map((it, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[27px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary/60 bg-background font-mono text-[9px] text-primary">
                {i + 1}
              </span>
              <RichText text={it} className="text-[15px] leading-7 text-foreground/90" />
            </li>
          ))}
        </ol>
      )

    case 'kv':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {b.items.map((it, i) => (
            <div
              key={i}
              className="hover-raise rounded-lg border bg-card/80 p-3.5"
            >
              <p className="mb-1 font-mono text-xs font-bold text-primary">{it.k}</p>
              <RichText text={it.v} className="text-sm leading-6 text-muted-foreground" />
            </div>
          ))}
        </div>
      )

    default:
      return null
  }
}
