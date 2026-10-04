'use client'

import * as React from 'react'
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BookX,
  Cpu,
  Globe,
  ListChecks,
  NotebookPen,
  Play,
  Terminal,
  Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Typewriter } from '@/components/typewriter'
import { GithubCounters } from '@/components/github-counters'
import { QuestionCard } from '@/components/question-card'
import { QUESTIONS, TOTAL, YEARS, countBySubject, CURATED, MOCKS, ALL_QUESTIONS } from '@/data'
import { NOTE_CATEGORIES } from '@/data/notes'
import { SUBJECTS, SUBJECT_ORDER } from '@/data/types'
import type { SubjectCode } from '@/data/types'
import { useProgress, useUI } from '@/lib/store'
import { cn } from '@/lib/utils'

const SUBJECT_ICONS: Record<SubjectCode, React.ComponentType<{ className?: string }>> = {
  ds: ListChecks,
  co: Cpu,
  os: Terminal,
  cn: Globe,
}

const NOTES_CHAPTER_COUNT = NOTE_CATEGORIES.reduce((s, c) => s + c.chapters.length, 0)

function useMounted() {
  const [m, setM] = React.useState(false)
  React.useEffect(() => setM(true), [])
  return m
}

function daysToExam(): number {
  // 2027 届考研初试预计 2026-12-26（历年惯例：12 月倒数第二个周末）
  const exam = new Date('2026-12-26T09:00:00+08:00')
  const diff = exam.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

export function HomeView() {
  const setView = useUI((s) => s.setView)
  const openQuestionsWith = useUI((s) => s.openQuestionsWith)
  const records = useProgress((s) => s.records)
  const mounted = useMounted()

  const done = mounted ? Object.keys(records).length : 0
  const recent = React.useMemo(
    () => [...QUESTIONS].sort((a, b) => b.year - a.year).slice(0, 6),
    [],
  )

  const subjects = SUBJECT_ORDER.map((code) => {
    const total = ALL_QUESTIONS.filter((q) => q.subject === code).length
    const recs = Object.entries(records).filter(([qid]) => {
      const q = ALL_QUESTIONS.find((x) => x.id === qid)
      return q?.subject === code
    })
    let correct = 0
    let answered = 0
    recs.forEach(([, r]) => {
      answered += r.correct + r.wrong
      correct += r.correct
    })
    return {
      code,
      total,
      done: recs.length,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : null,
    }
  })

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {/* ============ Hero ============ */}
      <section className="relative">
        <div
          aria-hidden
          className="dot-grid dark:dot-grid-dark absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_35%,black,transparent)]"
        />
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col items-start gap-5">
            <p className="font-mono text-sm text-primary">
              <span className="text-muted-foreground">$</span> ./408lab --start
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              <Typewriter
                phrases={[
                  '你好，未来的研究生',
                  'printf("408 上岸！\\n");',
                  'git commit -m "一战成硕"',
                  '刷完 18 套 408 真题',
                ]}
              />
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              408Lab 收录 <b className="text-foreground">{TOTAL}</b> 道 2009-2026 年统考真题（18 套整卷），
              加上 <b className="text-foreground">{CURATED.length}</b> 道四科精选题与{' '}
              <b className="text-foreground">10</b> 套全真模拟卷（{MOCKS.length} 题，逐选项详解 + 动画讲解），
              共 <b className="text-foreground">{ALL_QUESTIONS.length}</b> 题覆盖数据结构、组成原理、操作系统、计算机网络四大科目。
              逐题精讲、模拟考试、错题本、刷题数据统计与全套经验笔记，助你稳步上岸。
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-2 font-semibold" onClick={() => setView('practice')}>
                <Play className="h-4 w-4" />
                开始刷题
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => setView('questions')}>
                <BookMarked className="h-4 w-4" />
                浏览题库
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => setView('notes')}>
                <NotebookPen className="h-4 w-4" />
                经验笔记
              </Button>
            </div>
            <GithubCounters />
          </div>

          {/* 终端窗口 */}
          <div
            className="overflow-hidden rounded-xl border bg-zinc-950 shadow-2xl shadow-emerald-900/20"
            aria-label="题库概览终端"
          >
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden>
                <i className="h-3 w-3 rounded-full bg-rose-500/90" />
                <i className="h-3 w-3 rounded-full bg-amber-400/90" />
                <i className="h-3 w-3 rounded-full bg-emerald-500/90" />
              </span>
              <span className="ml-2 font-mono text-xs text-zinc-500">408lab — zsh</span>
            </div>
            <div className="space-y-1.5 p-5 font-mono text-[13px] leading-relaxed text-zinc-300">
              <p>
                <span className="text-emerald-400">➜</span> <span className="text-sky-400">~/408Lab</span>{' '}
                <span className="text-zinc-500">git:(</span>
                <span className="text-amber-300">master</span>
                <span className="text-zinc-500">)</span> ./408lab status
              </p>
              <p className="text-zinc-500">─────── 题库概览 ───────</p>
              <p>
                真题总量 <span className="float-right text-emerald-400">{TOTAL} 题</span>
              </p>
              <p>
                精选题库 <span className="float-right text-emerald-400">{CURATED.length} 题</span>
              </p>
              <p>
                模拟卷 <span className="float-right text-emerald-400">10 套 / {MOCKS.length} 题</span>
              </p>
              <p>
                年份跨度 <span className="float-right text-emerald-400">{YEARS[0]}–{YEARS[YEARS.length - 1]}</span>
              </p>
              {subjects.map((s) => (
                <p key={s.code}>
                  {SUBJECTS[s.code].name} <span className="float-right text-emerald-400">{s.total} 题</span>
                </p>
              ))}
              <p>
                我的进度 <span className="float-right text-amber-300">{done}/{ALL_QUESTIONS.length}</span>
              </p>
              <p className="text-zinc-500">────────────────────</p>
              <p>
                <span className="text-rose-400">⚠</span> 距离 2027 考研初试还有{' '}
                <span className="text-rose-400">{daysToExam()}</span> 天
              </p>
              <p>
                <span className="text-emerald-400">➜</span> <span className="text-sky-400">~/408Lab</span>{' '}
                <span className="caret-blink inline-block h-4 w-2 translate-y-0.5 bg-emerald-400/90" />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 数据速览 ============ */}
      <section aria-label="数据速览">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: '全库题量', value: `${ALL_QUESTIONS.length}`, sub: `真题 ${TOTAL} · 精选 ${CURATED.length} · 模拟 ${MOCKS.length}`, icon: BookMarked },
            { label: '全真模拟卷', value: '10 套', sub: '每套 47 题 / 150 分', icon: Timer },
            { label: '真题年份', value: `${YEARS.length} 年`, sub: `${YEARS[0]}–${YEARS[YEARS.length - 1]} 统考`, icon: ListChecks },
            {
              label: '我的正确率',
              value: mounted
                ? (() => {
                    const rs = Object.values(records)
                    const a = rs.reduce((x, r) => x + r.correct + r.wrong, 0)
                    const c = rs.reduce((x, r) => x + r.correct, 0)
                    return a > 0 ? `${Math.round((c / a) * 100)}%` : '--'
                  })()
                : '--',
              sub: '作答后实时统计',
              icon: BarChart3,
            },
          ].map(({ label, value, sub, icon: Icon }) => (
            <Card key={label} className="hover-raise bg-card/90 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Icon className="h-4 w-4 text-primary/70" />
              </div>
              <p className="mt-2 font-mono text-2xl font-bold tabular-nums">{value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground/70">{sub}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ============ 四大科目 ============ */}
      <section aria-label="四大科目">
        <p className="mb-1 font-mono text-xs text-primary">{'// 四大科目 · 全覆盖'}</p>
        <h2 className="mb-6 text-2xl font-bold">选择你的战场</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((s) => {
            const Icon = SUBJECT_ICONS[s.code]
            const meta = SUBJECTS[s.code]
            return (
              <Card
                key={s.code}
                role="button"
                tabIndex={0}
                onClick={() => openQuestionsWith(s.code)}
                onKeyDown={(e) => e.key === 'Enter' && openQuestionsWith(s.code)}
                className="hover-raise group cursor-pointer bg-card/90 p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div
                  className={cn(
                    'mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border',
                    'border-current/20',
                    meta.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{meta.name}</h3>
                <p className="mb-3 font-mono text-[11px] text-muted-foreground/70">{meta.en} · {meta.score}</p>
                <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span>{s.total} 题</span>
                  <span className={s.accuracy !== null ? 'text-foreground' : ''}>
                    {s.accuracy !== null ? `正确率 ${s.accuracy}%` : '未开始'}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.min(100, (s.done / s.total) * 100)}%` }}
                  />
                </div>
                <p className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  查看科目题库 <ArrowRight className="h-3 w-3" />
                </p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ============ 最新真题 ============ */}
      <section aria-label="最新真题">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="mb-1 font-mono text-xs text-primary">{'// latest commits'}</p>
            <h2 className="text-2xl font-bold">最新收录</h2>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 font-mono text-xs" onClick={() => setView('questions')}>
            查看全部 <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recent.map((q) => (
            <QuestionCard key={q.id} q={q} onOpen={(qq) => useUI.getState().openQuestion(qq.id)} />
          ))}
        </div>
      </section>

      {/* ============ 功能特性 ============ */}
      <section aria-label="功能特性">
        <p className="mb-1 font-mono text-xs text-primary">{'// features'}</p>
        <h2 className="mb-6 text-2xl font-bold">为上岸而生的刷题工具</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {
            [
              {
                icon: NotebookPen,
                title: '经验笔记',
                desc: `${NOTES_CHAPTER_COUNT} 章备考笔记：全年规划、真题方法论、四科知识框架与易错警示，考点直连题库考频。`,
                view: 'notes' as const,
              },
              {
                icon: Play,
                title: '刷题训练',
                desc: '按科目、年份、题型自选组合；单选即时判定，综合题对照参考答案自评，支持键盘快捷作答。',
                view: 'practice' as const,
              },
              {
                icon: Timer,
                title: '模拟考试',
                desc: '10 套自创全真模拟卷 + 18 套真题整卷（47 题 / 180 分钟 / 150 分），每题逐选项详解，过程题动画演示，交卷自动判分。',
                view: 'exam' as const,
              },
              {
                icon: BookX,
                title: '错题本',
                desc: '答错自动收录，一键重练错题；正确率的薄弱知识点一目了然，专项突破。',
                view: 'wrong' as const,
              },
              {
                icon: BarChart3,
                title: '数据统计',
                desc: '科目正确率、年份覆盖、薄弱知识点排行与 GitHub 风格刷题热力图，用数据管理进度。',
                view: 'stats' as const,
              },
            ].map(({ icon: Icon, title, desc, view }) => (
              <Card
                key={title}
                role="button"
                tabIndex={0}
                onClick={() => setView(view)}
                onKeyDown={(e) => e.key === 'Enter' && setView(view)}
                className="hover-raise cursor-pointer bg-card/90 p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="mb-3 h-6 w-6 text-primary" />
                <h3 className="mb-1.5 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </Card>
            ))
          }
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-500/10 p-8 text-center md:p-12">
        <p className="font-mono text-sm text-primary">$ echo "世上无难事，只要肯登攀"</p>
        <h2 className="mx-auto mt-3 max-w-xl text-2xl font-bold md:text-3xl">
          每天 20 题，把 408 刷成你的舒适区
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          {daysToExam()} 天后的考场上，你会感谢现在刷题的自己。
        </p>
        <Button size="lg" className="mt-6 gap-2 font-semibold" onClick={() => setView('practice')}>
          <Play className="h-4 w-4" />
          现在开始
        </Button>
        <CardContent className="hidden" />
      </section>
    </div>
  )
}
