'use client'

import * as React from 'react'
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Cpu,
  Globe,
  ListChecks,
  Menu,
  Play,
  Search,
  Terminal,
  Timer,
  TrendingUp,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { NoteBlocks } from '@/components/note-blocks'
import { NOTE_CATEGORIES, chapterFreq } from '@/data/notes'
import type { NoteCategory, NoteChapter } from '@/data/notes/types'
import { useUI } from '@/lib/store'
import { cn } from '@/lib/utils'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  guide: Compass,
  ds: ListChecks,
  co: Cpu,
  os: Terminal,
  cn: Globe,
  trends: TrendingUp,
}

interface FlatChapter {
  cat: NoteCategory
  ch: NoteChapter
}

const FLAT: FlatChapter[] = NOTE_CATEGORIES.flatMap((cat) =>
  cat.chapters.map((ch) => ({ cat, ch })),
)

const TOTAL_CHAPTERS = FLAT.length
const TOTAL_MINUTES = FLAT.reduce((s, x) => s + x.ch.minutes, 0)

export function NotesView() {
  const openQuestionsSearch = useUI((s) => s.openQuestionsSearch)
  const [activeId, setActiveId] = React.useState<string>(FLAT[0]?.ch.id ?? '')
  const [query, setQuery] = React.useState('')
  const [menuOpen, setMenuOpen] = React.useState(false)

  const current = React.useMemo(
    () => FLAT.find((x) => x.ch.id === activeId) ?? FLAT[0],
    [activeId],
  )

  const idx = FLAT.findIndex((x) => x.ch.id === current.ch.id)
  const prev = idx > 0 ? FLAT[idx - 1] : null
  const next = idx < FLAT.length - 1 ? FLAT[idx + 1] : null

  const kw = query.trim().toLowerCase()
  const matched = React.useMemo(() => {
    if (!kw) return null
    return FLAT.filter(({ ch }) =>
      `${ch.title} ${ch.brief} ${(ch.tags ?? []).join(' ')}`.toLowerCase().includes(kw),
    )
  }, [kw])

  const freq = chapterFreq(current.ch, current.cat.id)

  const go = (id: string) => {
    setActiveId(id)
    setMenuOpen(false)
    window.scrollTo({ top: 0 })
  }

  const MainIcon = ICONS[current.cat.icon] ?? BookOpen

  return (
    <div className="flex flex-col gap-6">
      {/* ============ 页头 ============ */}
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs text-primary">$ cat ./notes/408/*.md | less</p>
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h1 className="text-2xl font-bold">经验笔记</h1>
          <p className="text-sm text-muted-foreground">
            {NOTE_CATEGORIES.length} 大类 · {TOTAL_CHAPTERS} 章 · 约 {TOTAL_MINUTES} 分钟
            · 与题库考频联动
          </p>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          整理自高分上岸经验帖与四科核心考点的系统笔记：全年规划、真题方法论、
          逐科知识框架、高频考点与易错警示。每章标注本站真题考频，看完即刷，即学即练。
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        {/* ============ 侧栏目录（桌面） ============ */}
        <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] flex-col gap-3 overflow-y-auto pr-1 lg:flex">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索章节…"
              className="h-8 pl-8 text-xs"
              aria-label="搜索笔记章节"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="清空搜索"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {matched ? (
            <SidebarNav
              categories={[{ id: 'search', title: `搜索结果（${matched.length}）`, subtitle: '', icon: 'trends', order: 0, chapters: matched.map((m) => m.ch) }]}
              activeId={activeId}
              onGo={go}
            />
          ) : (
            <SidebarNav categories={NOTE_CATEGORIES} activeId={activeId} onGo={go} />
          )}
        </aside>

        {/* ============ 正文 ============ */}
        <article className="min-w-0 max-w-[880px]">
          {/* 移动端目录入口 */}
          <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
                  <Menu className="h-3.5 w-3.5" /> 目录 · {current.cat.title}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 font-mono">
                    <BookOpen className="h-4 w-4 text-primary" /> 经验笔记目录
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-2 flex flex-col gap-4 px-4 pb-6">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="搜索章节…"
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                  {matched ? (
                    <SidebarNav
                      categories={[{ id: 'search', title: `搜索结果（${matched.length}）`, subtitle: '', icon: 'trends', order: 0, chapters: matched.map((m) => m.ch) }]}
                      activeId={activeId}
                      onGo={go}
                    />
                  ) : (
                    <SidebarNav categories={NOTE_CATEGORIES} activeId={activeId} onGo={go} />
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <p className="font-mono text-[11px] text-muted-foreground">
              {idx + 1} / {TOTAL_CHAPTERS}
            </p>
          </div>

          {/* 章节头部 */}
          <header className="mb-6 border-b pb-5">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <MainIcon className="h-3.5 w-3.5 text-primary" />
              {current.cat.title}
              <span className="text-muted-foreground/50">/</span>
              <span className="text-primary">{current.ch.title}</span>
            </p>
            <h2 className="text-2xl font-bold tracking-tight">{current.ch.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {current.ch.brief}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {(current.ch.tags ?? []).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary"
                >
                  {t}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                <Timer className="h-3 w-3" /> 约 {current.ch.minutes} 分钟
              </span>
              {freq.count > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    openQuestionsSearch(current.ch.topicKeywords?.[0] ?? current.ch.title)
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] text-emerald-600 outline-none transition-colors hover:bg-emerald-500/20 focus-visible:ring-2 focus-visible:ring-ring dark:text-emerald-400"
                  aria-label="去题库刷该考点"
                >
                  <BookOpen className="h-3 w-3" />
                  本站真题 {freq.count} 题
                  <span className="text-muted-foreground">
                    · {freq.years[0]}–{freq.years[freq.years.length - 1]}
                  </span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </header>

          <NoteBlocks blocks={current.ch.blocks} />

          {/* 上下章导航 */}
          <nav className="mt-12 grid gap-3 border-t pt-6 sm:grid-cols-2" aria-label="章节导航">
            {prev ? (
              <button
                type="button"
                onClick={() => go(prev.ch.id)}
                className="hover-raise group flex flex-col items-start gap-1 rounded-lg border bg-card/80 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  <ChevronLeft className="h-3 w-3" /> 上一章 · {prev.cat.title}
                </span>
                <span className="font-semibold group-hover:text-primary">{prev.ch.title}</span>
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button
                type="button"
                onClick={() => go(next.ch.id)}
                className="hover-raise group flex flex-col items-end gap-1 rounded-lg border bg-card/80 p-4 text-right outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  下一章 · {next.cat.title} <ChevronRight className="h-3 w-3" />
                </span>
                <span className="font-semibold group-hover:text-primary">{next.ch.title}</span>
              </button>
            ) : (
              <span className="flex flex-col items-end justify-center rounded-lg border border-dashed p-4 text-right">
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-primary">
                  <Play className="h-3 w-3" /> 笔记读完，去刷题实战
                </span>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => openQuestionsSearch(current.ch.topicKeywords?.[0] ?? current.cat.title)}
                >
                  打开题库
                </Button>
              </span>
            )}
          </nav>
        </article>
      </div>
    </div>
  )
}

/* ---------------- 侧栏目录（桌面与移动端复用） ---------------- */

function SidebarNav({
  categories,
  activeId,
  onGo,
}: {
  categories: NoteCategory[]
  activeId: string
  onGo: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {categories.map((cat) => {
        const Icon = ICONS[cat.icon] ?? BookOpen
        return (
          <section key={cat.id}>
            <p className="mb-1.5 flex items-center gap-1.5 px-1 font-mono text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <Icon className="h-3 w-3 text-primary" />
              {cat.title}
              <span className="ml-auto font-normal text-muted-foreground/60">
                {cat.chapters.length}
              </span>
            </p>
            <ul className="flex flex-col">
              {cat.chapters.map((ch) => (
                <li key={ch.id}>
                  <button
                    type="button"
                    onClick={() => onGo(ch.id)}
                    aria-current={ch.id === activeId ? 'page' : undefined}
                    className={cn(
                      'w-full rounded-md border-l-2 px-2.5 py-1.5 text-left text-[13px] leading-snug outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                      ch.id === activeId
                        ? 'border-primary bg-primary/10 font-semibold text-primary'
                        : 'border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    )}
                  >
                    {ch.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
