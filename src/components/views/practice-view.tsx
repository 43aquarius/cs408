'use client'

import * as React from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  RefreshCw,
  Shuffle,
  Target,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { QuestionBody } from '@/components/question-body'
import { SubjectBadge, YearBadge } from '@/components/badges'
import { filterQuestions, QUESTION_MAP, getQuestion } from '@/data'
import { SUBJECTS, SUBJECT_ORDER } from '@/data/types'
import type { SubjectCode } from '@/data/types'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'

const YEAR_RANGE = [2009, 2026] as const
const COUNT_OPTIONS = [5, 10, 20, 40]

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1 font-mono text-xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

export function PracticeView() {
  const consumePreset = useUI((s) => s.consumePracticePreset)
  const startPractice = useUI((s) => s.startPractice)

  const [session, setSession] = React.useState<{ qids: string[]; title: string } | null>(null)
  const [presetApplied, setPresetApplied] = React.useState(false)

  // 配置项
  const [subject, setSubject] = React.useState<SubjectCode | 'all'>('all')
  const [bank, setBank] = React.useState<'all' | 'real' | 'curated' | 'mock'>('all')
  const [fromYear, setFromYear] = React.useState<number>(2009)
  const [toYear, setToYear] = React.useState<number>(2026)
  const [onlySingle, setOnlySingle] = React.useState(true)
  const [count, setCount] = React.useState(10)
  const [shuffle, setShuffle] = React.useState(true)

  // 会话状态
  const [idx, setIdx] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, 'correct' | 'wrong'>>({})
  const [finished, setFinished] = React.useState(false)
  const [startedAt, setStartedAt] = React.useState(0)

  // 消费预置（错题重练）
  React.useEffect(() => {
    if (presetApplied) return
    const p = consumePreset()
    if (p) {
      setSession(p)
      setIdx(0)
      setAnswers({})
      setFinished(false)
      setStartedAt(Date.now())
    }
    setPresetApplied(true)
  }, [consumePreset, presetApplied])

  const current = session && session.qids[idx] ? getQuestion(session.qids[idx]) : undefined
  const answeredCurrent = current ? answers[current.id] !== undefined : false

  const buildSession = () => {
    const pool = filterQuestions({
      subjects: subject === 'all' ? undefined : [subject],
      years:
        bank === 'all' || bank === 'curated' || bank === 'mock'
          ? undefined
          : Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i),
      source: bank === 'all' ? undefined : bank,
      type: onlySingle ? 'single' : 'all',
    })
    if (pool.length === 0) return
    const picked = shuffle ? [...pool].sort(() => Math.random() - 0.5).slice(0, count) : pool.slice(0, count)
    setSession({ qids: picked.map((q) => q.id), title: buildTitle() })
    setIdx(0)
    setAnswers({})
    setFinished(false)
    setStartedAt(Date.now())
  }

  const BANK_LABEL: Record<typeof bank, string> = {
    all: '全库',
    real: '真题',
    curated: '精选题库',
    mock: '模拟卷',
  }

  const buildTitle = () =>
    `${BANK_LABEL[bank]} · ${subject === 'all' ? '全部科目' : SUBJECTS[subject].name} · ${bank === 'real' ? `${fromYear}-${toYear} · ` : ''}${count} 题`

  const recordAnswer = (result: 'correct' | 'wrong') => {
    if (!current) return
    setAnswers((a) => ({ ...a, [current.id]: result }))
  }

  const next = React.useCallback(() => {
    if (!session) return
    if (idx < session.qids.length - 1) setIdx((i) => i + 1)
    else setFinished(true)
  }, [session, idx])

  const prev = () => setIdx((i) => Math.max(0, i - 1))

  // 键盘快捷键：A-D / 1-4 选择，→ 或 Enter 下一题
  React.useEffect(() => {
    if (!current || finished) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const k = e.key.toLowerCase()
      if (!answeredCurrent && current.type === 'single' && current.options) {
        const letters = ['a', 'b', 'c', 'd']
        const li = letters.indexOf(k)
        const ni = ['1', '2', '3', '4'].indexOf(k)
        const optionIdx = li >= 0 ? li : ni
        if (optionIdx >= 0 && optionIdx < current.options.length) {
          const letter = String.fromCharCode(65 + optionIdx)
          // 通过模拟点击按钮选择
          const btn = document.querySelector<HTMLButtonElement>(
            `[data-option="${current.id}-${letter}"]`,
          )
          btn?.click()
          return
        }
      }
      if (answeredCurrent && (e.key === 'Enter' || e.key === 'ArrowRight')) {
        e.preventDefault()
        next()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, answeredCurrent, finished, next])

  /* ---------------- 配置页 ---------------- */
  if (!session) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-xs text-primary">$ 408lab practice --config</p>
          <h1 className="text-2xl font-bold">刷题训练</h1>
          <p className="text-sm text-muted-foreground">
            自选科目、年份区间与题型，单选即时判定、综合题自评。支持键盘快捷键（A-D 选择，Enter 下一题）。
          </p>
        </header>
        <Card className="mx-auto w-full max-w-2xl bg-card/90 p-6">
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 font-mono text-xs text-muted-foreground">科目</p>
              <div className="flex flex-wrap gap-2">
                <Chip active={subject === 'all'} onClick={() => setSubject('all')}>全部</Chip>
                {SUBJECT_ORDER.map((c) => (
                  <Chip key={c} active={subject === c} onClick={() => setSubject(c)}>
                    {SUBJECTS[c].name}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-mono text-xs text-muted-foreground">题库来源</p>
              <div className="flex flex-wrap items-center gap-2">
                <Chip active={bank === 'all'} onClick={() => setBank('all')}>全库（真题+精选+模拟）</Chip>
                <Chip active={bank === 'real'} onClick={() => setBank('real')}>仅真题</Chip>
                <Chip active={bank === 'curated'} onClick={() => setBank('curated')}>精选题库</Chip>
                <Chip active={bank === 'mock'} onClick={() => setBank('mock')}>模拟卷</Chip>
              </div>
            </div>
            <div>
              <p className="mb-2 font-mono text-xs text-muted-foreground">年份区间{bank === 'real' ? '' : '（仅真题来源时生效）'}</p>
              <div
                className={cn(
                  'flex flex-wrap items-center gap-2',
                  bank !== 'real' && 'pointer-events-none opacity-40',
                )}
              >
                <Select2 value={fromYear} onChange={setFromYear} min={2009} max={toYear} label="起" />
                <span className="font-mono text-xs text-muted-foreground">—</span>
                <Select2 value={toYear} onChange={setToYear} min={fromYear} max={2026} label="止" />
              </div>
            </div>
            <div>
              <p className="mb-2 font-mono text-xs text-muted-foreground">题量与题型</p>
              <div className="flex flex-wrap items-center gap-2">
                {COUNT_OPTIONS.map((c) => (
                  <Chip key={c} active={count === c} onClick={() => setCount(c)}>{c} 题</Chip>
                ))}
                <span className="mx-1 text-border">|</span>
                <Chip active={onlySingle} onClick={() => setOnlySingle(true)}>仅单选</Chip>
                <Chip active={!onlySingle} onClick={() => setOnlySingle(false)}>含综合题</Chip>
                <span className="mx-1 text-border">|</span>
                <Chip active={shuffle} onClick={() => setShuffle((v) => !v)}>
                  <Shuffle className="mr-1 inline h-3 w-3" />乱序
                </Chip>
              </div>
            </div>
            <Button
              size="lg"
              className="gap-2 self-start font-semibold"
              onClick={buildSession}
              disabled={
                filterQuestions({
                  subjects: subject === 'all' ? undefined : [subject],
                  years:
                    bank === 'real'
                      ? Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i)
                      : undefined,
                  source: bank === 'all' ? undefined : bank,
                  type: onlySingle ? 'single' : 'all',
                }).length === 0
              }
            >
              <Play className="h-4 w-4" />
              开始训练
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  /* ---------------- 小结页 ---------------- */
  if (finished) {
    const total = session.qids.length
    const correct = Object.values(answers).filter((r) => r === 'correct').length
    const wrongQids = session.qids.filter((qid) => answers[qid] === 'wrong')
    const minutes = Math.round((Date.now() - startedAt) / 60000)
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-center">
          <p className="font-mono text-xs text-primary">$ practice --summary</p>
          <h1 className="mt-2 text-3xl font-bold">本组完成！</h1>
        </div>
        <div className="grid w-full max-w-lg grid-cols-3 gap-4">
          <Card className="bg-card/90 p-4 text-center">
            <p className="font-mono text-3xl font-bold text-primary tabular-nums">
              {total > 0 ? Math.round((correct / total) * 100) : 0}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">正确率</p>
          </Card>
          <Card className="bg-card/90 p-4 text-center">
            <p className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {correct}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">答对</p>
          </Card>
          <Card className="bg-card/90 p-4 text-center">
            <p className="font-mono text-3xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {total - correct}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">答错</p>
          </Card>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          用时约 {minutes} 分钟 · {session.title}
        </p>
        {wrongQids.length > 0 && (
          <Card className="w-full max-w-lg bg-card/90 p-5">
            <p className="mb-3 font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
              错题已自动加入错题本：
            </p>
            <ul className="space-y-1.5">
              {wrongQids.slice(0, 6).map((qid) => {
                const q = QUESTION_MAP.get(qid)
                if (!q) return null
                return (
                  <li key={qid} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                    <span className="font-mono">{qid}</span>
                    <span className="truncate">{q.topic}</span>
                    <YearBadge year={q.year} origin={q.origin} />
                  </li>
                )
              })}
            </ul>
          </Card>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button className="gap-2" onClick={buildSession}>
            <RefreshCw className="h-4 w-4" />
            再来一组
          </Button>
          {wrongQids.length > 0 && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                startPractice({
                  qids: wrongQids,
                  title: '本组错题重练',
                })
              }
            >
              <Target className="h-4 w-4" />
              只练错题
            </Button>
          )}
          <Button variant="ghost" onClick={() => setSession(null)}>
            返回配置
          </Button>
        </div>
      </div>
    )
  }

  /* ---------------- 作答页 ---------------- */
  const answeredCount = Object.keys(answers).length
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-primary">$ practice --run</p>
          <h1 className="text-lg font-bold">{session.title}</h1>
        </div>
        <span className="font-mono text-sm text-muted-foreground tabular-nums">
          {idx + 1} / {session.qids.length}
        </span>
      </header>
      <Progress value={(answeredCount / session.qids.length) * 100} className="h-1.5" />

      {current && (
        <Card key={current.id} className="bg-card/90 p-6">
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <YearBadge year={current.year} origin={current.origin} />
            <SubjectBadge subject={current.subject} />
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {answers[current.id] === 'correct' ? (
                <span className="text-emerald-600 dark:text-emerald-400">✓ 正确</span>
              ) : answers[current.id] === 'wrong' ? (
                <span className="text-rose-600 dark:text-rose-400">✗ 错误</span>
              ) : (
                '未作答'
              )}
            </span>
          </div>
          {/* data-option 标记供键盘模拟点击 */}
          <div data-option-root>
            <QuestionBody q={current} onAnswered={recordAnswer} />
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={prev} disabled={idx === 0} className="gap-1">
          <ChevronLeft className="h-4 w-4" /> 上一题
        </Button>
        <span className="hidden font-mono text-[11px] text-muted-foreground/60 sm:block">
          快捷键：A-D 选择 · Enter 下一题
        </span>
        <Button
          size="sm"
          onClick={next}
          disabled={!answeredCurrent}
          className={cn('gap-1', idx === session.qids.length - 1 && 'bg-emerald-600 hover:bg-emerald-700')}
        >
          {idx === session.qids.length - 1 ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> 完成
            </>
          ) : (
            <>
              下一题 <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* 题目导航圆点 */}
      <div className="flex flex-wrap items-center justify-center gap-1.5" aria-label="答题进度">
        {session.qids.map((qid, i) => (
          <button
            key={qid}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`第 ${i + 1} 题`}
            className={cn(
              'h-2.5 w-2.5 rounded-full border outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring',
              i === idx && 'scale-125 border-primary bg-primary',
              i !== idx && answers[qid] === undefined && 'border-border bg-muted',
              i !== idx && answers[qid] === 'correct' && 'border-emerald-500/50 bg-emerald-500',
              i !== idx && answers[qid] === 'wrong' && 'border-rose-500/50 bg-rose-500',
            )}
          />
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mx-auto gap-1 font-mono text-xs text-muted-foreground"
        onClick={() => setSession(null)}
      >
        <ArrowRight className="h-3.5 w-3.5" />
        放弃本组
      </Button>
    </div>
  )
}

/** 年份小号下拉 */
function Select2({
  value,
  onChange,
  min,
  max,
  label,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  label: string
}) {
  const years = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={`选择${label}始年份`}
      className="h-8 rounded-md border border-border bg-card px-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {years.map((y) => (
        <option key={y} value={y}>
          {y} 年
        </option>
      ))}
    </select>
  )
}
