'use client'

import { Layers, AlertTriangle } from 'lucide-react'
import { getTemplate } from '@/data/templates'
import { RichText } from '@/components/rich-text'

/**
 * 通用解题模板卡片：讲解区附加的「这一类题怎么解」。
 * 与题目级解析（explanation）、动画级演示（visual）三层互补。
 */
export function SolutionTemplate({ id }: { id: string }) {
  const t = getTemplate(id)
  if (!t) return null
  return (
    <section
      data-solution-template={id}
      className="rounded-xl border border-violet-500/30 bg-violet-500/[0.05] p-4"
    >
      <p className="mb-3 flex items-center gap-2 font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
        <Layers className="h-3.5 w-3.5" aria-hidden />
        通用解题模板 · {t.title}
      </p>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-violet-600/90 dark:text-violet-400/90">适用：</span>
        {t.scene}
      </p>
      <ol className="mb-3 flex flex-col gap-2">
        {t.steps.map((s, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-violet-500/15 font-mono text-[11px] font-bold text-violet-600 dark:text-violet-400"
              aria-hidden
            >
              {i + 1}
            </span>
            <RichText text={s} className="flex-1 text-foreground/85" />
          </li>
        ))}
      </ol>
      {t.warn && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/[0.07] p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{t.warn}</span>
        </p>
      )}
    </section>
  )
}
