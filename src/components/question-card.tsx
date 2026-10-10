'use client'

import * as React from 'react'
import { ArrowUpRight, Star } from 'lucide-react'
import { Card, CardFooter, CardHeader } from '@/components/ui/card'
import {
  DifficultyBadge,
  SourceBadge,
  SubjectBadge,
  TopicBadge,
  TypeBadge,
  YearBadge,
} from '@/components/badges'
import { RichText } from '@/components/rich-text'
import type { Question } from '@/data/types'
import { useProgress, isFavorited } from '@/lib/store'
import { cn } from '@/lib/utils'

/** 题库文章卡片：hover 抬升（程序员博客 article card 风格） */
export function QuestionCard({ q, onOpen }: { q: Question; onOpen: (q: Question) => void }) {
  const rec = useProgress((s) => s.records[q.id])
  const fav = useProgress((s) => isFavorited(s.favorites[q.id]))
  const toggleFavorite = useProgress((s) => s.toggleFavorite)

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(q)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(q)
        }
      }}
      className="hover-raise group cursor-pointer border-border/80 bg-card/90 p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`打开题目：${q.year > 0 ? `${q.year}年` : (q.origin ?? '精选题库')} ${q.topic} ${q.id}`}
    >
      <CardHeader className="flex flex-row flex-wrap items-center gap-1.5 space-y-0 p-0 pb-3">
        <span className="font-mono text-xs text-muted-foreground/70">{q.id}</span>
        <YearBadge year={q.year} origin={q.origin} />
        <SubjectBadge subject={q.subject} />
        <TypeBadge type={q.type} />
        <SourceBadge source={q.source} />
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(q.id)
            }}
            aria-pressed={fav}
            aria-label={fav ? `取消收藏 ${q.id}` : `收藏 ${q.id}`}
            title={fav ? '取消收藏' : '收藏本题'}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring',
              fav
                ? 'text-amber-500'
                : 'text-muted-foreground/40 hover:text-amber-500 md:opacity-0 md:group-hover:opacity-100',
            )}
          >
            <Star className={cn('h-4 w-4', fav && 'fill-current')} aria-hidden />
          </button>
          <DifficultyBadge difficulty={q.difficulty} />
        </span>
      </CardHeader>
      <RichText
        text={q.question}
        className="line-clamp-3-safe text-sm text-foreground/90"
      />
      <CardFooter className="flex items-center justify-between gap-2 p-0 pt-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <TopicBadge topic={q.topic} />
          {rec ? (
            <span
              className={cn(
                'font-mono text-[11px]',
                rec.lastResult === 'correct' || rec.lastResult === 'mastered'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400',
              )}
              title={`已练 ${rec.attempts} 次`}
            >
              {rec.lastResult === 'correct' || rec.lastResult === 'mastered' ? '✓ 已攻克' : '✗ 待巩固'}
            </span>
          ) : (
            <span className="font-mono text-[11px] text-muted-foreground/50">未练习</span>
          )}
        </div>
        <span className="inline-flex items-center gap-0.5 font-mono text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          做题 <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
        </span>
      </CardFooter>
    </Card>
  )
}
