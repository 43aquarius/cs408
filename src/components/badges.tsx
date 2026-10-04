import { Badge } from '@/components/ui/badge'
import { SUBJECTS, DIFFICULTY_LABEL, TYPE_LABEL } from '@/data/types'
import type { Question } from '@/data/types'
import { cn } from '@/lib/utils'

export function YearBadge({ year, origin }: { year: number; origin?: string }) {
  if (year === 0) {
    return (
      <Badge
        variant="outline"
        className="border-dashed border-amber-500/40 font-mono text-[11px] text-amber-700 dark:text-amber-300"
      >
        {origin ?? '精选题库'}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="font-mono text-[11px] tabular-nums">
      {year} 真题
    </Badge>
  )
}

export function SubjectBadge({ subject, className }: { subject: Question['subject']; className?: string }) {
  const s = SUBJECTS[subject]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        'border-current/20',
        s.color,
        className,
      )}
    >
      <i className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden />
      {s.name}
    </span>
  )
}

export function TypeBadge({ type }: { type: Question['type'] }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'text-[11px]',
        type === 'application' && 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
      )}
    >
      {TYPE_LABEL[type]}
    </Badge>
  )
}

export function DifficultyBadge({ difficulty }: { difficulty: Question['difficulty'] }) {
  const color =
    difficulty === 1
      ? 'text-emerald-600 dark:text-emerald-400'
      : difficulty === 2
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-rose-600 dark:text-rose-400'
  return (
    <span className={cn('font-mono text-[11px]', color)} title={`难度：${DIFFICULTY_LABEL[difficulty]}`}>
      {'★'.repeat(difficulty)}
      <span className="text-muted-foreground/40">{'★'.repeat(3 - difficulty)}</span>
    </span>
  )
}

export function SourceBadge({ source }: { source: Question['source'] }) {
  if (source === 'real') {
    return <Badge className="bg-primary/15 text-primary hover:bg-primary/15 text-[11px]">真题</Badge>
  }
  if (source === 'curated') {
    return (
      <Badge className="bg-violet-500/15 text-violet-700 hover:bg-violet-500/15 dark:text-violet-300 text-[11px]">
        精选
      </Badge>
    )
  }
  if (source === 'mock') {
    return (
      <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300 text-[11px]">
        模拟卷
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="border-dashed text-[11px] text-muted-foreground"
      title="依据真题考点文本化改编"
    >
      真题改编
    </Badge>
  )
}

export function TopicBadge({ topic }: { topic: string }) {
  return <Badge variant="secondary" className="text-[11px] font-normal text-muted-foreground">#{topic}</Badge>
}
