'use client'

import * as React from 'react'
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileBadge,
  Flag,
  ListChecks,
  Play,
  RotateCcw,
  Timer as TimerIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { QuestionBody } from '@/components/question-body'
import { RichText } from '@/components/rich-text'
import { CodeBlock } from '@/components/code-block'
import { SubjectBadge, YearBadge } from '@/components/badges'
import { YEARS, filterQuestions, getQuestion, MOCK_PAPERS } from '@/data'
import { SUBJECTS, SUBJECT_ORDER, TYPE_LABEL } from '@/data/types'
import type { SubjectCode } from '@/data/types'
import { useProgress } from '@/lib/store'
import { cn } from '@/lib/utils'

type Phase = 'setup' | 'running' | 'result'

interface ExamState {
  qids: string[]
  label: string
  durationSec: number
  /** 整卷（含综合题）标记 */
  fullPaper: boolean
  recordId: string
}

type SelfGrade = 'full' | 'partial' | 'zero'

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

function fmt(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ExamView() {
  const addExam = useProgress((s) => s.addExam)
  const updateExam = useProgress((s) => s.updateExam)
  const submitAnswer = useProgress((s) => s.submitAnswer)
  const markApplication = useProgress((s) => s.markApplication)

  const [phase, setPhase] = React.useState<Phase>('setup')
  const [exam, setExam] = React.useState<ExamState | null>(null)
  const [mockKey, setMockKey] = React.useState<string>(MOCK_PAPERS[0]?.key ?? '')
  const [year, setYear] = React.useState<number>(YEARS[YEARS.length - 1])
  const [subjects, setSubjects] = React.useState<SubjectCode[]>([...SUBJECT_ORDER])
  const [count, setCount] = React.useState(20)

  // 作答状态
  const [idx, setIdx] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [drafts, setDrafts] = React.useState<Record<string, string>>({})
  const [marked, setMarked] = React.useState<Set<string>>(new Set())
  const [remain, setRemain] = React.useState(0)
  const [autoSubmitted, setAutoSubmitted] = React.useState(false)
  const [reviewIdx, setReviewIdx] = React.useState(0)
  const [selfGrades, setSelfGrades] = React.useState<Record<string, SelfGrade>>({})

  const current = exam && exam.qids[idx] ? getQuestion(exam.qids[idx]) : undefined

  const start = (qids: string[], label: string, durationSec: number, fullPaper: boolean) => {
    const recordId = `exam-${Date.now()}`
    setExam({ qids, label, durationSec, fullPaper, recordId })
    // 关键：同步初始化剩余时间，避免 phase 变为 running 的那一帧
    // remain 仍为旧值 0 而触发“超时自动交卷”
    setRemain(durationSec)
    setIdx(0)
    setAnswers({})
    setDrafts({})
    setMarked(new Set())
    setAutoSubmitted(false)
    setReviewIdx(0)
    setSelfGrades({})
    setPhase('running')
  }

  /** 历年真题整卷：47 题（40 单选 + 7 综合），180 分钟，150 分 */
  const startYearPaper = () => {
    const qs = filterQuestions({ years: [year] })
    if (qs.length === 0) return
    const full = qs.some((q) => q.type === 'application')
    start(
      qs.map((q) => q.id),
      `${year} 年真题整卷（${qs.length} 题 / ${full ? '150 分' : `${qs.length * 2} 分`}）`,
      full ? 180 * 60 : Math.max(300, qs.length * 120),
      full,
    )
  }

  /** 智能随机组卷：仅单选，每题 2 分钟 */
  const startCustomPaper = () => {
    const pool = filterQuestions({ subjects: subjects.length ? subjects : undefined, type: 'single' })
    const qs = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length))
    if (qs.length === 0) return
    start(qs.map((q) => q.id), `智能组卷（${qs.length} 题）`, Math.max(300, qs.length * 120), false)
  }

  /** 全真模拟卷：47 题整卷，180 分钟，150 分 */
  const startMockPaper = () => {
    const paper = MOCK_PAPERS.find((p) => p.key === mockKey)
    if (!paper) return
    start(
      paper.questions.map((q) => q.id),
      `${paper.title}（47 题 / 150 分）`,
      180 * 60,
      true,
    )
  }

  // 交卷（含超时自动交卷）：单选自动判分；综合题留待结果页自评
  const submit = React.useCallback(
    (auto = false) => {
      if (!exam) return
      setAutoSubmitted(auto)
      let correct = 0
      const perSubject: Partial<Record<SubjectCode, { c: number; t: number }>> = {}
      exam.qids.forEach((qid) => {
        const q = getQuestion(qid)
        if (!q) return
        if (q.type === 'single') {
          const sel = answers[qid]
          const ok = sel === q.answer
          if (ok) correct++
          const ps = perSubject[q.subject] ?? { c: 0, t: 0 }
          ps.t++
          if (ok) ps.c++
          perSubject[q.subject] = ps
          if (sel) submitAnswer(qid, ok ? 'correct' : 'wrong')
        }
      })
      const mcqScore = correct * 2
      addExam({
        id: exam.recordId,
        label: exam.label,
        total: exam.qids.length,
        correct,
        score: mcqScore,
        scoreMax: exam.fullPaper ? 150 : exam.qids.length * 2,
        durationSec: exam.durationSec - remain,
        perSubject,
      })
      setPhase('result')
    },
    [exam, answers, remain, addExam, submitAnswer],
  )

  // 倒计时（remain 已在 start() 中同步初始化）
  React.useEffect(() => {
    if (phase !== 'running' || !exam) return
    const t = setInterval(() => {
      setRemain((r) => (r <= 1 ? 0 : r - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [phase, exam])

  // 超时自动交卷（仅在真正走完倒计时后触发）
  const submittedRef = React.useRef(false)
  React.useEffect(() => {
    if (phase === 'setup') {
      submittedRef.current = false // 新一场考试前复位
      return
    }
    if (phase !== 'running' || !exam || autoSubmitted) return
    if (remain === 0 && submittedRef.current === false) {
      submittedRef.current = true
      submit(true)
    }
  }, [remain, phase, exam, autoSubmitted, submit])

  const pick = (letter: string) => {
    if (!current) return
    setAnswers((a) => ({ ...a, [current.id]: letter }))
  }

  const toggleMark = () => {
    if (!current) return
    setMarked((m) => {
      const n = new Set(m)
      if (n.has(current.id)) n.delete(current.id)
      else n.add(current.id)
      return n
    })
  }

  /* ================= 配置页 ================= */
  if (phase === 'setup') {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-xs text-primary">$ 408lab exam --setup</p>
          <h1 className="text-2xl font-bold">模拟考试</h1>
          <p className="text-sm text-muted-foreground">
            全真模拟：十套自创模拟卷 + 十八年真题整卷按真实卷面计时（180 分钟 / 150 分），涂卡式答题卡，交卷后单选自动判分、综合题对照参考答案自评。
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 全真模拟卷 */}
          <Card className="bg-card/90 p-6 md:col-span-2">
            <h2 className="mb-1 flex items-center gap-2 font-semibold">
              <FileBadge className="h-4 w-4 text-amber-500" /> 十套全真模拟卷
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              自创全真模拟：每套 47 题（40 单选 + 7 综合 · 150 分），每题逐选项详解，过程题配动画讲解；难度从基础过关到终极押题梯度覆盖。
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {MOCK_PAPERS.map((p) => (
                <Chip
                  key={p.key}
                  active={mockKey === p.key}
                  onClick={() => setMockKey(p.key)}
                >
                  {p.title}
                </Chip>
              ))}
            </div>
            <Button className="gap-2 font-semibold" onClick={startMockPaper}>
              <Play className="h-4 w-4" />
              开始整卷模考（180 分钟）
            </Button>
          </Card>

          {/* 历年整卷 */}
          <Card className="bg-card/90 p-6">
            <h2 className="mb-1 flex items-center gap-2 font-semibold">
              <ListChecks className="h-4 w-4 text-primary" /> 历年真题整卷
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              选一年打全卷：40 道单选（80 分）+ 7 道综合应用（70 分），卷面题号与当年真题一致。
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {[...YEARS].reverse().map((y) => (
                <Chip key={y} active={year === y} onClick={() => setYear(y)}>
                  {y}
                </Chip>
              ))}
            </div>
            <Button className="gap-2 font-semibold" onClick={startYearPaper}>
              <Play className="h-4 w-4" />
              开始 {year} 年整卷（180 分钟）
            </Button>
          </Card>

          {/* 智能组卷 */}
          <Card className="bg-card/90 p-6">
            <h2 className="mb-1 flex items-center gap-2 font-semibold">
              <Play className="h-4 w-4 text-primary" /> 智能随机组卷
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              按科目勾选题池，随机抽取单选题，每题 2 分钟，适合每日一测。
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {SUBJECT_ORDER.map((c) => (
                <Chip
                  key={c}
                  active={subjects.includes(c)}
                  onClick={() =>
                    setSubjects((ss) => (ss.includes(c) ? ss.filter((x) => x !== c) : [...ss, c]))
                  }
                >
                  {SUBJECTS[c].name}
                </Chip>
              ))}
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {[10, 20, 40].map((c) => (
                <Chip key={c} active={count === c} onClick={() => setCount(c)}>
                  {c} 题
                </Chip>
              ))}
            </div>
            <Button
              variant="outline"
              className="gap-2 font-semibold"
              onClick={startCustomPaper}
              disabled={subjects.length === 0}
            >
              <Play className="h-4 w-4" />
              随机组卷开考
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  /* ================= 结果页 ================= */
  if (phase === 'result' && exam) {
    const mcqQids = exam.qids.filter((qid) => getQuestion(qid)?.type === 'single')
    const appQids = exam.qids.filter((qid) => getQuestion(qid)?.type === 'application')
    const mcqCorrect = mcqQids.filter((qid) => {
      const q = getQuestion(qid)
      return q && answers[qid] === q.answer
    }).length
    const mcqScore = mcqCorrect * 2
    const mcqMax = mcqQids.length * 2
    const unanswered = exam.qids.filter((qid) => !answers[qid] && !drafts[qid]?.trim()).length

    const gradeValue = (qid: string): number | null => {
      const g = selfGrades[qid]
      const q = getQuestion(qid)
      if (!g || !q) return null
      if (g === 'full') return q.score
      if (g === 'partial') return Math.floor(q.score / 2)
      return 0
    }
    const appScore = appQids.reduce((s, qid) => s + (gradeValue(qid) ?? 0), 0)
    const ungraded = appQids.filter((qid) => !selfGrades[qid]).length
    const totalScore = mcqScore + appScore
    const totalMax = exam.fullPaper ? 150 : exam.qids.length * 2

    const setGrade = (qid: string, g: SelfGrade) => {
      setSelfGrades((prev) => ({ ...prev, [qid]: g }))
      const q = getQuestion(qid)
      if (q) markApplication(qid, g === 'full')
      // 同步更新模考记录中的预估得分
      const appScoreNew = appQids.reduce((s, id) => {
        if (id === qid) {
          if (g === 'full') return s + (getQuestion(id)?.score ?? 0)
          if (g === 'partial') return s + Math.floor((getQuestion(id)?.score ?? 0) / 2)
          return s
        }
        return s + (gradeValue(id) ?? 0)
      }, 0)
      updateExam(exam.recordId, { score: mcqScore + appScoreNew })
    }

    const perSubject: Partial<Record<SubjectCode, { c: number; t: number }>> = {}
    mcqQids.forEach((qid) => {
      const q = getQuestion(qid)
      if (!q) return
      const ps = perSubject[q.subject] ?? { c: 0, t: 0 }
      ps.t++
      if (answers[qid] === q.answer) ps.c++
      perSubject[q.subject] = ps
    })
    const reviewQ = exam.qids[reviewIdx] ? getQuestion(exam.qids[reviewIdx]) : undefined

    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <p className="font-mono text-xs text-primary">
            {autoSubmitted ? '$ exam --timeout --submit（时间到，已自动交卷）' : '$ exam --submit'}
          </p>
          <h1 className="text-3xl font-bold">{exam.label}</h1>
          <div className="flex flex-wrap items-center justify-center gap-8 py-2">
            <div>
              <p className="font-mono text-4xl font-bold text-primary tabular-nums">
                {totalScore}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                预估总分 / {totalMax}
                {ungraded > 0 && <span className="text-amber-600 dark:text-amber-400">（综合题还有 {ungraded} 题未自评）</span>}
              </p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="font-mono text-2xl font-bold tabular-nums">
                {mcqScore}<span className="text-sm text-muted-foreground"> / {mcqMax}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">单选自动判分 · 未答 {unanswered}</p>
            </div>
            {appQids.length > 0 && (
              <>
                <div className="h-10 w-px bg-border" />
                <div>
                  <p className="font-mono text-2xl font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                    {appScore}<span className="text-sm text-muted-foreground"> / {150 - mcqMax}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">综合题自评 · {appQids.length - ungraded}/{appQids.length} 已评</p>
                </div>
              </>
            )}
          </div>
          {remain === 0 && <p className="font-mono text-xs text-amber-600 dark:text-amber-400">⏰ 考试时间已用尽</p>}
          {appQids.length > 0 && ungraded > 0 && (
            <p className="max-w-md text-xs text-muted-foreground">
              在下方逐题复盘中对综合题自评（满分 / 部分 / 零分），预估总分将实时累计。
            </p>
          )}
        </header>

        {/* 科目正确率（单选部分） */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {SUBJECT_ORDER.filter((s) => perSubject[s]).map((s) => {
            const ps = perSubject[s]!
            return (
              <Card key={s} className="bg-card/90 p-4">
                <SubjectBadge subject={s} />
                <p className="mt-2 font-mono text-xl font-bold tabular-nums">
                  {ps.c}/{ps.t}
                </p>
                <Progress value={(ps.c / ps.t) * 100} className="mt-2 h-1.5" />
              </Card>
            )
          })}
        </div>

        {/* 逐题复盘 */}
        <Card className="bg-card/90 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">逐题复盘</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={reviewIdx === 0}
                onClick={() => setReviewIdx((i) => i - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="self-center font-mono text-xs text-muted-foreground tabular-nums">
                {reviewIdx + 1} / {exam.qids.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={reviewIdx >= exam.qids.length - 1}
                onClick={() => setReviewIdx((i) => i + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {reviewQ && (
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              <YearBadge year={reviewQ.year} origin={reviewQ.origin} />
              <SubjectBadge subject={reviewQ.subject} />
              <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                第 {reviewQ.number} 题 · {reviewQ.score} 分 · {TYPE_LABEL[reviewQ.type]}
              </span>
            </div>
          )}
          {reviewQ && (
            <QuestionBody q={reviewQ} mode="review" reviewSelected={answers[reviewQ.id]} />
          )}
          {/* 综合题自评 */}
          {reviewQ && reviewQ.type === 'application' && (
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
              {selfGrades[reviewQ.id] ? (
                <p className="font-mono text-xs text-muted-foreground">
                  已自评：
                  {selfGrades[reviewQ.id] === 'full' && `按满分 ${reviewQ.score} 分计入`}
                  {selfGrades[reviewQ.id] === 'partial' && `按部分分 ${Math.floor(reviewQ.score / 2)} 分计入`}
                  {selfGrades[reviewQ.id] === 'zero' && '按 0 分计入'}
                </p>
              ) : (
                <>
                  <p className="mb-2 font-mono text-xs font-semibold text-primary">
                    对照参考答案自评本题（{reviewQ.score} 分）
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setGrade(reviewQ.id, 'full')}
                    >
                      满分 {reviewQ.score} 分
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setGrade(reviewQ.id, 'partial')}
                    >
                      部分得分 {Math.floor(reviewQ.score / 2)} 分
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => setGrade(reviewQ.id, 'zero')}
                    >
                      基本没拿到分
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </Card>

        {/* 答题卡缩略 */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {exam.qids.map((qid, i) => {
            const q = getQuestion(qid)
            const ok = q && q.type === 'single' && answers[qid] === q.answer
            const sel = answers[qid]
            const grade = selfGrades[qid]
            return (
              <button
                key={qid}
                type="button"
                onClick={() => setReviewIdx(i)}
                aria-label={`复盘第 ${i + 1} 题`}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md border font-mono text-[11px] outline-none transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring',
                  q?.type === 'application' && !grade && 'border-dashed border-border text-muted-foreground',
                  q?.type === 'application' && grade === 'full' && 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                  q?.type === 'application' && grade === 'partial' && 'border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-400',
                  q?.type === 'application' && grade === 'zero' && 'border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-400',
                  q?.type === 'single' && !sel && 'border-border text-muted-foreground',
                  q?.type === 'single' && sel && ok && 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                  q?.type === 'single' && sel && !ok && 'border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-400',
                  i === reviewIdx && 'ring-2 ring-ring ring-offset-1 ring-offset-background',
                )}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        <div className="flex justify-center gap-3">
          <Button className="gap-2" onClick={() => setPhase('setup')}>
            <RotateCcw className="h-4 w-4" />
            再考一场
          </Button>
        </div>
      </div>
    )
  }

  /* ================= 作答页 ================= */
  if (!exam || !current) return null
  const answeredCount = exam.qids.filter((qid) => {
    const q = getQuestion(qid)
    if (!q) return false
    return q.type === 'single' ? !!answers[qid] : !!drafts[qid]?.trim()
  }).length
  const danger = remain < 300

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 lg:flex-row">
      {/* 左：题目区 */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-mono text-xs text-primary">$ exam --running</p>
            <h1 className="text-lg font-bold">{exam.label}</h1>
          </div>
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-lg font-bold tabular-nums',
              danger
                ? 'animate-pulse border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'border-border bg-card text-foreground',
            )}
            role="timer"
            aria-label="剩余时间"
          >
            <TimerIcon className="h-4 w-4" />
            {fmt(remain)}
          </div>
        </header>

        <Card key={current.id} className="bg-card/90 p-6">
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <YearBadge year={current.year} origin={current.origin} />
            <SubjectBadge subject={current.subject} />
            <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              第 {current.number} 题 · {current.score} 分 · {TYPE_LABEL[current.type]}
            </span>
            <button
              type="button"
              onClick={toggleMark}
              aria-pressed={marked.has(current.id)}
              className={cn(
                'ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                marked.has(current.id)
                  ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              <Flag className="h-3 w-3" />
              {marked.has(current.id) ? '已标记' : '标记本题'}
            </button>
          </div>
          <RichText text={current.question} className="mb-4 text-[15px] font-medium" />
          {current.code && <CodeBlock code={current.code.text} lang={current.code.lang} />}

          {/* 单选题选项 */}
          {current.type === 'single' && current.options && (
            <div className="mt-4 flex flex-col gap-2">
              {current.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i)
                const picked = answers[current.id] === letter
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => pick(letter)}
                    aria-pressed={picked}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3 text-left text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring',
                      picked
                        ? 'border-primary bg-accent/50 shadow-sm'
                        : 'border-border hover:border-primary/50 hover:bg-accent/30',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-semibold',
                        picked ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground',
                      )}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* 综合题草稿区（不参与自动判分，交卷后自评） */}
          {current.type === 'application' && (
            <div className="mt-4 flex flex-col gap-2">
              <p className="font-mono text-xs text-muted-foreground">
                ✎ 在草稿区写下你的解题要点（也可在纸上作答）。草稿不计分，交卷后在复盘中对照参考答案自评。
              </p>
              <Textarea
                value={drafts[current.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [current.id]: e.target.value }))}
                placeholder={`第 ${current.number} 题草稿：如 (1) 设计思想… (2) 关键步骤…`}
                className="min-h-40 font-mono text-sm leading-relaxed"
                aria-label={`第 ${current.number} 题草稿区`}
              />
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> 上一题
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIdx((i) => Math.min(exam.qids.length - 1, i + 1))}
            disabled={idx === exam.qids.length - 1}
            className="gap-1"
          >
            下一题 <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 右：答题卡 */}
      <aside className="w-full shrink-0 lg:w-64">
        <Card className="sticky top-20 bg-card/90 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">答题卡</h2>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {answeredCount}/{exam.qids.length}
            </span>
          </div>
          <Progress value={(answeredCount / exam.qids.length) * 100} className="mb-3 h-1.5" />
          <div className="grid grid-cols-7 gap-1.5">
            {exam.qids.map((qid, i) => {
              const q = getQuestion(qid)
              const answered =
                q?.type === 'single' ? !!answers[qid] : !!drafts[qid]?.trim()
              const isMarked = marked.has(qid)
              return (
                <button
                  key={qid}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`第 ${i + 1} 题${answered ? '（已作答）' : ''}`}
                  className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-md border font-mono text-[11px] outline-none transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring',
                    i === idx && 'ring-2 ring-ring ring-offset-1 ring-offset-background',
                    answered
                      ? q?.type === 'application'
                        ? 'border-teal-500 bg-teal-500/80 text-white'
                        : 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {i + 1}
                  {isMarked && (
                    <i className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" aria-label="已标记" />
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
            <p><i className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-primary align-middle" />单选已答</p>
            <p><i className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-teal-500 align-middle" />综合已写草稿</p>
            <p><i className="mr-1.5 inline-block h-2 w-2 rounded-sm border border-border align-middle" />未作答</p>
            <p><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-500 align-middle" />标记</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="mt-4 w-full gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                交卷
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认交卷？</AlertDialogTitle>
                <AlertDialogDescription>
                  已作答 {answeredCount} / {exam.qids.length} 题
                  {answeredCount < exam.qids.length && `，还有 ${exam.qids.length - answeredCount} 题未作答。`}
                  单选题自动判分并记录到错题本；综合题交卷后在复盘中对照参考答案自评。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>继续作答</AlertDialogCancel>
                <AlertDialogAction onClick={() => submit(false)}>确认交卷</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </aside>
    </div>
  )
}
