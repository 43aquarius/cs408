'use client'

import * as React from 'react'
import { AlertTriangle, Flame, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
import { QUESTIONS, QUESTION_MAP, TOTAL, YEARS, ALL_QUESTIONS, CURATED, MOCKS } from '@/data'
import { SUBJECTS, SUBJECT_ORDER } from '@/data/types'
import type { SubjectCode } from '@/data/types'
import { useProgress } from '@/lib/store'
import { useAuth, forcePush } from '@/lib/use-auth'
import { cn } from '@/lib/utils'

function useMounted() {
  const [m, setM] = React.useState(false)
  React.useEffect(() => setM(true), [])
  return m
}

/* ---------------- GitHub 风格热力图 ---------------- */
function Heatmap({ daily }: { daily: Record<string, number> }) {
  const weeks = 26
  const today = new Date()
  const cells: { key: string; count: number }[][] = []

  // 以本周日为最后一列，往回推 weeks 周
  const end = new Date(today)
  end.setDate(end.getDate() + (6 - end.getDay()))
  for (let w = weeks - 1; w >= 0; w--) {
    const col: { key: string; count: number }[] = []
    for (let d = 6; d >= 0; d--) {
      const date = new Date(end)
      date.setDate(end.getDate() - w * 7 - d)
      if (date > today) {
        col.push({ key: date.toISOString().slice(0, 10), count: -1 }) // 未来
        continue
      }
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      col.push({ key, count: daily[key] ?? 0 })
    }
    cells.push(col)
  }

  const level = (c: number) =>
    c <= 0
      ? 'bg-muted'
      : c < 5
        ? 'bg-emerald-500/30'
        : c < 10
          ? 'bg-emerald-500/55'
          : c < 20
            ? 'bg-emerald-500/80'
            : 'bg-emerald-500'

  return (
    <div className="flex flex-col gap-2 overflow-x-auto pb-1">
      <div className="flex gap-[3px]">
        {cells.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((c) => (
              <span
                key={c.key}
                title={c.count >= 0 ? `${c.key}：刷题 ${c.count} 次` : c.key}
                className={cn(
                  'h-3 w-3 shrink-0 rounded-[3px]',
                  c.count < 0 ? 'bg-transparent' : level(c.count),
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
        少
        <i className="h-2.5 w-2.5 rounded-[3px] bg-muted" />
        <i className="h-2.5 w-2.5 rounded-[3px] bg-emerald-500/30" />
        <i className="h-2.5 w-2.5 rounded-[3px] bg-emerald-500/55" />
        <i className="h-2.5 w-2.5 rounded-[3px] bg-emerald-500/80" />
        <i className="h-2.5 w-2.5 rounded-[3px] bg-emerald-500" />
        多
        <span className="ml-auto">近 26 周</span>
      </div>
    </div>
  )
}

export function StatsView() {
  const records = useProgress((s) => s.records)
  const daily = useProgress((s) => s.daily)
  const exams = useProgress((s) => s.exams)
  const resetAll = useProgress((s) => s.resetAll)
  const authed = useAuth((s) => s.user !== null)
  const ready = useAuth((s) => s.ready)
  const mounted = useMounted()

  const doneIds = mounted ? Object.keys(records) : []
  const done = doneIds.length
  const answered = Object.values(records).reduce((x, r) => x + r.correct + r.wrong, 0)
  const correct = Object.values(records).reduce((x, r) => x + r.correct, 0)
  const acc = answered > 0 ? Math.round((correct / answered) * 100) : null

  // 连续刷题天数
  const streak = React.useMemo(() => {
    if (!mounted) return 0
    let s = 0
    const d = new Date()
    for (;;) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if ((daily[key] ?? 0) > 0) {
        s++
        d.setDate(d.getDate() - 1)
      } else if (s === 0 && key === new Date().toISOString().slice(0, 10)) {
        d.setDate(d.getDate() - 1) // 今天还没刷，从昨天开始算
      } else {
        break
      }
    }
    return s
  }, [daily, mounted])

  // 科目统计（题池为全库：真题 + 精选 + 模拟卷）
  const subjectStats = SUBJECT_ORDER.map((code) => {
    const total = ALL_QUESTIONS.filter((q) => q.subject === code).length
    let c = 0
    let a = 0
    let d = 0
    Object.entries(records).forEach(([qid, r]) => {
      const q = QUESTION_MAP.get(qid)
      if (q?.subject !== code) return
      d++
      a += r.correct + r.wrong
      c += r.correct
    })
    return { code, total, done: d, accuracy: a > 0 ? Math.round((c / a) * 100) : null }
  })

  // 年份覆盖
  const yearStats = YEARS.map((y) => {
    const total = QUESTIONS.filter((q) => q.year === y).length
    const d = Object.keys(records).filter((qid) => QUESTION_MAP.get(qid)?.year === y).length
    return { year: y, total, done: d }
  })

  // 薄弱知识点（作答 ≥ 3 次且正确率 < 100%）
  const weakTopics = React.useMemo(() => {
    const byTopic: Record<string, { c: number; a: number }> = {}
    Object.entries(records).forEach(([qid, r]) => {
      const q = QUESTION_MAP.get(qid)
      if (!q) return
      const t = (byTopic[q.topic] ??= { c: 0, a: 0 })
      t.a += r.correct + r.wrong
      t.c += r.correct
    })
    return Object.entries(byTopic)
      .filter(([, v]) => v.a >= 3 && v.c < v.a)
      .map(([topic, v]) => ({ topic, acc: Math.round((v.c / v.a) * 100), a: v.a }))
      .sort((x, y) => x.acc - y.acc)
      .slice(0, 8)
  }, [records])

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-xs text-primary">$ 408lab stats --render</p>
        <h1 className="text-2xl font-bold">数据统计</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {authed ? '已登录，做题记录云端同步保存。' : '未登录时进度仅保存在本浏览器，登录后云端同步、换设备不丢。'}
        </p>
      </header>

      {!authed && ready && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <b className="text-primary">提示：</b>点击右上角「登录」注册账号，做题记录、错题本与模考成绩将云端保存，
          多设备登录自动合并同步。
        </div>
      )}

      {/* 概览 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          { label: '已刷题目', value: `${done}/${ALL_QUESTIONS.length}`, sub: `全库覆盖率 ${Math.round((done / ALL_QUESTIONS.length) * 100)}%` },
          { label: '真题库', value: String(TOTAL), sub: `2009–2026 届整卷` },
          { label: '精选题库', value: String(CURATED.length), sub: '四科高质量自创' },
          { label: '模拟卷', value: String(MOCKS.length), sub: '十套 × 47 题' },
          { label: '连续刷题', value: `${streak} 天`, sub: streak > 0 ? '保持住！' : '今天还没刷', icon: Flame },
        ].map(({ label, value, sub, icon: Icon }) => (
          <Card key={label} className="bg-card/90 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              {Icon ? <Icon className="h-4 w-4 text-amber-500" /> : null}
            </div>
            <p className="mt-2 font-mono text-2xl font-bold tabular-nums">{value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground/70">{sub}</p>
          </Card>
        ))}
      </div>

      {/* 热力图 */}
      <Card className="bg-card/90 p-5">
        <h2 className="mb-4 font-semibold">刷题热力图</h2>
        <Heatmap daily={mounted ? daily : {}} />
      </Card>

      {/* 科目正确率 */}
      <Card className="bg-card/90 p-5">
        <h2 className="mb-4 font-semibold">科目正确率与覆盖</h2>
        <div className="flex flex-col gap-4">
          {subjectStats.map((s) => (
            <div key={s.code}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className={SUBJECTS[s.code].color}>{SUBJECTS[s.code].name}</span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {s.done}/{s.total} 题 · {s.accuracy !== null ? `正确率 ${s.accuracy}%` : '未开始'}
                </span>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${Math.min(100, (s.done / s.total) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 年份覆盖 */}
        <Card className="bg-card/90 p-5">
          <h2 className="mb-4 font-semibold">年份覆盖</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
            {yearStats.map(({ year, total, done }) => {
              const pct = Math.round((done / total) * 100)
              return (
                <div
                  key={year}
                  className={cn(
                    'rounded-lg border p-2.5 text-center font-mono',
                    pct === 100
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : done > 0
                        ? 'border-primary/30 bg-accent/30'
                        : 'border-border',
                  )}
                >
                  <p className="text-sm font-semibold">{year}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                    {done}/{total}
                  </p>
                  <Progress value={pct} className="mt-1.5 h-1" />
                </div>
              )
            })}
          </div>
        </Card>

        {/* 薄弱知识点 */}
        <Card className="bg-card/90 p-5">
          <h2 className="mb-1 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            薄弱知识点
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">作答 ≥ 3 次的知识点按正确率升序</p>
          {weakTopics.length === 0 ? (
            <p className="py-8 text-center font-mono text-xs text-muted-foreground">
              暂无足够数据 · 数据会随刷题积累
            </p>
          ) : (
            <ul className="space-y-2.5">
              {weakTopics.map((t, i) => (
                <li key={t.topic} className="flex items-center gap-3 text-sm">
                  <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground/60">#{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{t.topic}</span>
                  <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        t.acc >= 70 ? 'bg-emerald-500' : t.acc >= 40 ? 'bg-amber-500' : 'bg-rose-500',
                      )}
                      style={{ width: `${t.acc}%` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums">
                    {t.acc}% <span className="text-muted-foreground/60">/{t.a}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* 考试历史 */}
      <Card className="bg-card/90 p-5">
        <h2 className="mb-4 font-semibold">模考记录</h2>
        {exams.length === 0 ? (
          <p className="py-8 text-center font-mono text-xs text-muted-foreground">
            尚无模考记录 · 去模拟考试来一场？
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left font-mono text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-normal">时间</th>
                  <th className="pb-2 pr-4 font-normal">试卷</th>
                  <th className="pb-2 pr-4 font-normal">得分</th>
                  <th className="pb-2 pr-4 font-normal">正确率</th>
                  <th className="pb-2 font-normal">用时</th>
                </tr>
              </thead>
              <tbody>
                {[...exams].reverse().map((e) => (
                  <tr key={e.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">
                      {new Date(e.ts).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-2.5 pr-4">{e.label}</td>
                    <td className="py-2.5 pr-4 font-mono font-semibold tabular-nums">
                      {e.score !== undefined && e.scoreMax
                        ? `${e.score}/${e.scoreMax}`
                        : e.correct * 2}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs tabular-nums">
                      {Math.round((e.correct / e.total) * 100)}%
                    </td>
                    <td className="py-2.5 font-mono text-xs text-muted-foreground">
                      {Math.floor(e.durationSec / 60)} 分 {e.durationSec % 60} 秒
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 危险区 */}
      <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
        <div>
          <p className="text-sm font-semibold">清空学习数据</p>
          <p className="text-xs text-muted-foreground">删除全部作答记录、错题本与模考历史，不可恢复。</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2" disabled={done === 0 && exams.length === 0}>
              <RotateCcw className="h-4 w-4" />
              重置
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认清空所有学习数据？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作将删除 {done} 道题的作答记录与 {exams.length} 条模考记录，操作不可撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  resetAll()
                  // 已登录时同步清空云端，避免下次登录合并回旧数据
                  forcePush()
                }}
              >
                确认清空
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
