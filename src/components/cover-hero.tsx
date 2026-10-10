'use client'

import * as React from 'react'
import { ChevronDown, ListChecks, Cpu, Terminal, Globe, Play, BookMarked, NotebookPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Typewriter } from '@/components/typewriter'
import { GithubCounters } from '@/components/github-counters'
import { ALL_QUESTIONS, QUESTIONS, CURATED, MOCKS, YEARS } from '@/data'
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

/** 跑马灯词条：四科高频考点点名 */
const MARQUEE_ITEMS = [
  'KMP 求 next 数组',
  'Cache 行映射与命中率',
  '银行家算法',
  'TCP 三次握手',
  '进程调度甘特图',
  'LRU 页面置换',
  'TCP 拥塞控制',
  '哈夫曼树带权路径长度',
  '流水线冒险',
  '中断与异常向量',
  'CIDR 子网划分',
  'B+ 树插入删除',
  'Dijkstra 最短路',
  '指令流水线吞吐率',
  'PV 操作与信号量',
  '滑动窗口与累计确认',
  '二叉排序树判定',
  '原码补码移码',
  '磁盘调度 SCAN',
  'ARP 与 MAC 地址',
  '拓扑排序与关键路径',
  '浮点数 IEEE 754',
  '死锁的四个必要条件',
  'NAT 与私有地址',
]

function daysToExam(): number {
  // 2027 届考研初试预计 2026-12-26（历年惯例：12 月倒数第二个周末）
  const exam = new Date('2026-12-26T09:00:00+08:00')
  const diff = exam.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

/** 字符解码动画：随机码逐位锁定为目标文本 */
function useScramble(target: string, startDelay = 350, stepMs = 42): string {
  const [text, setText] = React.useState(() => target.replace(/./g, ' '))
  React.useEffect(() => {
    const pool = '01<>/{}[]#$%&*+=~^ABCDEF0123456789'
    let frame = 0
    let timer: ReturnType<typeof setInterval> | null = null
    const start = setTimeout(() => {
      timer = setInterval(() => {
        frame += 1
        const settled = Math.floor(frame / 2)
        let out = ''
        for (let i = 0; i < target.length; i++) {
          out += i < settled ? target[i] : pool[Math.floor(Math.random() * pool.length)]
        }
        setText(out)
        if (settled >= target.length && timer) {
          clearInterval(timer)
          setText(target)
        }
      }, stepMs)
    }, startDelay)
    return () => {
      clearTimeout(start)
      if (timer) clearInterval(timer)
    }
  }, [target, startDelay, stepMs])
  return text
}

/**
 * 风格化封面：实验室开机自检 × 巨型字标 × 机架模块 × 考点跑马灯。
 * 首屏（100svh - 页头），亮暗双主题，reduced-motion 全兼容。
 */
export function CoverHero() {
  const setView = useUI((s) => s.setView)
  const openQuestionsWith = useUI((s) => s.openQuestionsWith)
  const records = useProgress((s) => s.records)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const wordmark = useScramble('408Lab')

  const subjects = React.useMemo(() => {
    return SUBJECT_ORDER.map((code) => {
      const total = ALL_QUESTIONS.filter((q) => q.subject === code).length
      let answered = 0
      let correct = 0
      Object.entries(records).forEach(([qid, r]) => {
        const q = ALL_QUESTIONS.find((x) => x.id === qid)
        if (q?.subject !== code) return
        answered += r.correct + r.wrong
        correct += r.correct
      })
      return { code, total, accuracy: answered > 0 ? Math.round((correct / answered) * 100) : null }
    })
  }, [records])

  const bootLines = [
    { t: '0.128', msg: `mounting /dev/question-bank · ${QUESTIONS.length} 真题 + ${CURATED.length} 精选 + ${MOCKS.length} 模拟`, ok: 'OK' },
    { t: '0.276', msg: `loading /notes · ${NOTES_CHAPTER_COUNT} 章经验笔记`, ok: 'OK' },
    { t: '0.394', msg: `calibrating ${YEARS[0]}–${YEARS[YEARS.length - 1]} 全真整卷 × 动画图解 × 解题模板`, ok: 'OK' },
    { t: '0.512', msg: 'all systems operational — 祝你上岸', ok: '✓' },
  ]

  return (
    <section
      className="relative flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center gap-4 py-8 md:gap-5"
      aria-label="408Lab 封面"
    >
      {/* ---------- 背景层（独立裁剪，不影响内容滚动） ---------- */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="dot-grid dark:dot-grid-dark absolute inset-0 [mask-image:radial-gradient(ellipse_65%_60%_at_50%_40%,black,transparent)]" />
        <div className="float-slow absolute -left-24 top-8 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl dark:bg-emerald-500/25" />
        <div className="float-slower absolute -right-24 bottom-24 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl dark:bg-teal-400/20" />
      </div>

      {/* ---------- 开机自检（小屏只留末行摘要） ---------- */}
      <div
        className="hidden w-full max-w-xl space-y-1 font-mono text-[11px] leading-relaxed text-muted-foreground/85 sm:block"
        aria-hidden
      >
        {bootLines.map((l, i) => (
          <p key={l.t} className="boot-in" style={{ animationDelay: `${0.12 + i * 0.22}s` }}>
            <span className="text-muted-foreground/50">[ {l.t}s ]</span> {l.msg}
            <span className="ml-1.5 text-emerald-600 dark:text-emerald-400">…… {l.ok}</span>
          </p>
        ))}
      </div>

      {/* ---------- 巨型字标 ---------- */}
      <div className="rise-in text-center" style={{ animationDelay: '0.9s' }}>
        <h1 className="text-glow select-none font-mono text-[clamp(3rem,12vw,8rem)] font-black leading-none tracking-tighter">
          <span className="bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-sky-400">
            {wordmark}
          </span>
        </h1>
        <p className="mt-3 flex items-center justify-center gap-2 text-base font-semibold tracking-wide text-foreground/90 md:text-xl">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary/60 md:w-14" aria-hidden />
          考研计算机统考 · 刷题实验室
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary/60 md:w-14" aria-hidden />
        </p>
        <p className="mt-2 h-6 font-mono text-sm text-primary">
          <Typewriter
            phrases={[
              'printf("408 上岸！\\n");',
              '18 套真题整卷 · 逐题精讲',
              'git commit -m "一战成硕"',
              '每天 20 题，把 408 刷成舒适区',
            ]}
          />
        </p>
      </div>

      {/* ---------- CTA ---------- */}
      <div className="rise-in flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '1.15s' }}>
        <Button size="lg" className="gap-2 px-7 text-base font-bold" onClick={() => setView('practice')}>
          <Play className="h-4 w-4" />
          进入实验室
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

      {/* ---------- 四科机架模块 ---------- */}
      <div
        className="rise-in grid w-full max-w-3xl grid-cols-2 gap-3 md:grid-cols-4"
        style={{ animationDelay: '1.35s' }}
      >
        {subjects.map((s) => {
          const Icon = SUBJECT_ICONS[s.code]
          const meta = SUBJECTS[s.code]
          return (
            <button
              key={s.code}
              type="button"
              onClick={() => openQuestionsWith(s.code)}
              className="hover-raise group flex flex-col gap-1 rounded-xl border border-border/80 bg-card/80 p-3 text-left backdrop-blur transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`进入${meta.name}题库`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <i className={cn('breathe h-2 w-2 rounded-full', meta.dot)} aria-hidden />
                  {meta.name}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-primary" aria-hidden />
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">
                {meta.score} · {s.total} 题
                {mounted && s.accuracy !== null && (
                  <span className="ml-1.5 text-emerald-600 dark:text-emerald-400">· {s.accuracy}%</span>
                )}
              </p>
            </button>
          )
        })}
      </div>

      {/* ---------- 考点跑马灯 ---------- */}
      <div
        className="rise-in marquee-hover w-full max-w-4xl overflow-hidden border-y border-border/70 bg-card/40 py-2.5"
        style={{ animationDelay: '1.55s' }}
        aria-label="四科高频考点滚动展示"
      >
        <div className="marquee-track flex w-max items-center gap-8 font-mono text-xs text-muted-foreground">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex shrink-0 items-center gap-8">
              <span>{item}</span>
              <span className="text-primary/60" aria-hidden>▸</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------- 状态栏 ---------- */}
      <div
        className="rise-in flex w-full max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border bg-card/70 px-5 py-3 font-mono text-xs backdrop-blur"
        style={{ animationDelay: '1.7s' }}
      >
        {[
          ['全库题量', `${ALL_QUESTIONS.length} 题`],
          ['真题整卷', `${YEARS.length} 套`],
          ['全真模拟', '10 套'],
          ['经验笔记', `${NOTES_CHAPTER_COUNT} 章`],
        ].map(([k, v]) => (
          <span key={k} className="text-muted-foreground">
            {k} <b className="text-foreground tabular-nums">{v}</b>
          </span>
        ))}
        <span className="text-muted-foreground">
          距 2027 初试{' '}
          <b className="text-rose-600 tabular-nums dark:text-rose-400">{daysToExam()} 天</b>
        </span>
        <GithubCounters />
      </div>

      {/* ---------- 向下滚动 ---------- */}
      <button
        type="button"
        onClick={() =>
          document.getElementById('cover-next')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        className="nudge-down absolute bottom-4 flex flex-col items-center gap-0.5 font-mono text-[10px] text-muted-foreground/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="向下浏览更多"
      >
        <span>SCROLL</span>
        <ChevronDown className="h-4 w-4" aria-hidden />
      </button>
    </section>
  )
}
