'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Star } from 'lucide-react'
import { QuestionCard } from '@/components/question-card'
import { QuestionBody } from '@/components/question-body'
import { DifficultyBadge, SubjectBadge, TopicBadge, YearBadge } from '@/components/badges'
import { QUESTIONS, YEARS, filterQuestions, getQuestion, CURATED, MOCKS, ALL_QUESTIONS } from '@/data'
import { SUBJECTS, SUBJECT_ORDER, DIFFICULTY_LABEL } from '@/data/types'
import type { SubjectCode, Difficulty } from '@/data/types'
import { useProgress, favoritedQids } from '@/lib/store'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 12

function Chip({
  active,
  onClick,
  children,
  className,
  disabled,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1 font-mono text-xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function QuestionsView() {
  const focusQid = useUI((s) => s.focusQid)
  const setFocus = useUI((s) => s.setFocus)
  const consumePreset = useUI((s) => s.consumeQuestionsSubject)
  const consumeKeywordPreset = useUI((s) => s.consumeQuestionsKeyword)
  const favorites = useProgress((s) => s.favorites)

  const [subject, setSubject] = React.useState<SubjectCode | 'all'>('all')
  const [year, setYear] = React.useState<number | 'all'>('all')
  const [type, setType] = React.useState<'all' | 'single' | 'application'>('all')
  const [difficulty, setDifficulty] = React.useState<Difficulty | 'all'>('all')
  const [source, setSource] = React.useState<'all' | 'real' | 'adapted' | 'curated' | 'mock'>('all')
  const [onlyFav, setOnlyFav] = React.useState(false)
  const [keyword, setKeyword] = React.useState('')
  const [page, setPage] = React.useState(0)

  // 消费首页科目预置 / 经验笔记考点搜索预置
  React.useEffect(() => {
    const preset = consumePreset()
    if (preset) setSubject(preset)
  }, [consumePreset])

  React.useEffect(() => {
    const kw = consumeKeywordPreset()
    if (kw) setKeyword(kw)
  }, [consumeKeywordPreset])

  const favSet = React.useMemo(() => new Set(favoritedQids(favorites)), [favorites])

  const filtered = React.useMemo(
    () =>
      filterQuestions({
        subjects: subject === 'all' ? undefined : [subject],
        years: year === 'all' ? undefined : [year],
        type,
        difficulty,
        source,
        keyword,
        ids: onlyFav ? favSet : undefined,
      }),
    [subject, year, type, difficulty, source, keyword, onlyFav, favSet],
  )

  React.useEffect(() => setPage(0), [subject, year, type, difficulty, source, keyword, onlyFav])

  // 切换到精选/模拟卷来源时，年份筛选自动失效并复位
  React.useEffect(() => {
    if ((source === 'curated' || source === 'mock') && year !== 'all') setYear('all')
  }, [source, year])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const focusQuestion = focusQid ? getQuestion(focusQid) : undefined

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs text-primary">$ grep -r "408" ./题库 --include=真题,精选,模拟卷</p>
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h1 className="text-2xl font-bold">题库</h1>
          <p className="text-sm text-muted-foreground">
            全库 {ALL_QUESTIONS.length} 题（真题 {QUESTIONS.length} · 精选 {CURATED.length} · 模拟卷 {MOCKS.length}） · 当前筛选{' '}
            <b className="text-foreground tabular-nums">{filtered.length}</b> 题
          </p>
        </div>
      </header>

      {/* 筛选栏 */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card/70 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-14 shrink-0 font-mono text-[11px] text-muted-foreground">科目</span>
          <Chip active={subject === 'all'} onClick={() => setSubject('all')}>全部</Chip>
          {SUBJECT_ORDER.map((code) => (
            <Chip key={code} active={subject === code} onClick={() => setSubject(code)}>
              {SUBJECTS[code].name}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 font-mono text-[11px] text-muted-foreground">年份</span>
          <div className="scrollbar-none flex flex-1 items-center gap-2 overflow-x-auto pb-0.5">
            <Chip
              active={year === 'all'}
              onClick={() => setYear('all')}
              disabled={source === 'curated' || source === 'mock'}
            >
              全部
            </Chip>
            {[...YEARS].reverse().map((y) => (
              <Chip
                key={y}
                active={year === y}
                onClick={() => setYear(y)}
                disabled={source === 'curated' || source === 'mock'}
                className={source === 'curated' || source === 'mock' ? 'opacity-40' : ''}
              >
                {y}
              </Chip>
            ))}
            {(source === 'curated' || source === 'mock') && (
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                （非真题不按年份筛选）
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-14 shrink-0 font-mono text-[11px] text-muted-foreground">题型</span>
          <Chip active={type === 'all'} onClick={() => setType('all')}>全部</Chip>
          <Chip active={type === 'single'} onClick={() => setType('single')}>单选题</Chip>
          <Chip active={type === 'application'} onClick={() => setType('application')}>综合应用</Chip>
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />
          <Chip active={source === 'all'} onClick={() => setSource('all')}>
            全部来源
          </Chip>
          <Chip active={source === 'real'} onClick={() => setSource('real')}>
            仅真题
          </Chip>
          <Chip active={source === 'curated'} onClick={() => setSource(source === 'curated' ? 'all' : 'curated')}>
            精选题库
          </Chip>
          <Chip active={source === 'mock'} onClick={() => setSource(source === 'mock' ? 'all' : 'mock')}>
            模拟卷
          </Chip>
          <Chip
            active={onlyFav}
            onClick={() => setOnlyFav((v) => !v)}
            className={favSet.size === 0 && !onlyFav ? 'opacity-50' : ''}
          >
            <Star className={cn('mr-1 inline h-3 w-3', onlyFav && 'fill-current')} aria-hidden />
            只看收藏{favSet.size > 0 ? ` · ${favSet.size}` : ''}
          </Chip>
          <div className="ml-auto flex items-center gap-2">
            <Select
              value={String(difficulty)}
              onValueChange={(v) => setDifficulty(v === 'all' ? 'all' : (Number(v) as Difficulty))}
            >
              <SelectTrigger size="sm" className="h-8 w-24 font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部难度</SelectItem>
                <SelectItem value="1">{DIFFICULTY_LABEL[1]}</SelectItem>
                <SelectItem value="2">{DIFFICULTY_LABEL[2]}</SelectItem>
                <SelectItem value="3">{DIFFICULTY_LABEL[3]}</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索知识点/题干…"
                className="h-8 w-44 pl-8 text-xs md:w-56"
                aria-label="搜索题目"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  aria-label="清空搜索"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 题目列表 */}
      {pageItems.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="font-mono text-sm text-muted-foreground">grep: 没有匹配的题目 (exit 1)</p>
          <p className="mt-2 text-xs text-muted-foreground/70">试试放宽筛选条件？</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((q) => (
            <QuestionCard key={q.id} q={q} onOpen={(qq) => setFocus(qq.id)} />
          ))}
        </div>
      )}

      {/* 分页 */}
      {pageCount > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="分页">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="上一页"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {safePage + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            aria-label="下一页"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}

      {/* 题目详情弹窗：可直接作答 */}
      <Dialog open={!!focusQuestion} onOpenChange={(o) => !o && setFocus(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {focusQuestion && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-1.5">
                  <YearBadge year={focusQuestion.year} origin={focusQuestion.origin} />
                  <SubjectBadge subject={focusQuestion.subject} />
                  <TopicBadge topic={focusQuestion.topic} />
                  <DifficultyBadge difficulty={focusQuestion.difficulty} />
                </div>
                <DialogTitle className="sr-only">
                  {focusQuestion.year > 0
                    ? `${focusQuestion.year}年${SUBJECTS[focusQuestion.subject].name}真题`
                    : `${focusQuestion.origin ?? '精选题库'} · ${focusQuestion.topic}`}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  {focusQuestion.year > 0
                    ? `${focusQuestion.year} 年第 ${focusQuestion.number} 题`
                    : `${focusQuestion.origin ?? '精选题库'} 第 ${focusQuestion.number} 题`}{' '}
                  · {focusQuestion.score} 分 · 可直接在弹窗内作答
                </DialogDescription>
              </DialogHeader>
              <QuestionBody q={focusQuestion} mode="practice" />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
