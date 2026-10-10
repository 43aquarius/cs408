'use client'

import * as React from 'react'
import { Github, Menu, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ReadingProgress } from '@/components/reading-progress'
import { ThemeToggle } from '@/components/theme-toggle'
import { AuthMenu } from '@/components/auth-menu'
import { useSyncBridge } from '@/lib/use-auth'
import { HomeView } from '@/components/views/home-view'
import { QuestionsView } from '@/components/views/questions-view'
import { PracticeView } from '@/components/views/practice-view'
import { ExamView } from '@/components/views/exam-view'
import { WrongBookView } from '@/components/views/wrong-book-view'
import { FavoritesView } from '@/components/views/favorites-view'
import { NotesView } from '@/components/views/notes-view'
import { StatsView } from '@/components/views/stats-view'
import { AboutView } from '@/components/views/about-view'
import { ALL_QUESTIONS } from '@/data'
import { useUI } from '@/lib/store'
import type { ViewId } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV: Array<{ id: ViewId; label: string }> = [
  { id: 'home', label: '首页' },
  { id: 'questions', label: '题库' },
  { id: 'practice', label: '刷题训练' },
  { id: 'exam', label: '模拟考试' },
  { id: 'wrong', label: '错题本' },
  { id: 'favorites', label: '收藏夹' },
  { id: 'notes', label: '经验笔记' },
  { id: 'stats', label: '数据统计' },
  { id: 'about', label: '关于' },
]

const VIEW_TITLES: Record<ViewId, string> = {
  home: '首页',
  questions: '题库 · 真题 + 精选 + 模拟卷',
  practice: '刷题训练',
  exam: '模拟考试',
  wrong: '错题本',
  favorites: '收藏夹',
  notes: '经验笔记',
  stats: '数据统计',
  about: '关于',
}

/** 单页应用外壳：hash 路由 + 页头页脚 + 顶部阅读进度条 */
export function AppShell() {
  const view = useUI((s) => s.view)
  const setView = useUI((s) => s.setView)
  const [menuOpen, setMenuOpen] = React.useState(false)

  // 账号初始化 + 云同步桥（登录状态下进度变化防抖推送）
  useSyncBridge()

  // hash <-> view 双向同步
  React.useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace('#', '')
      if (NAV.some((n) => n.id === h)) setView(h as ViewId)
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [setView])

  const prevView = React.useRef(view)
  React.useEffect(() => {
    if (prevView.current !== view) {
      window.scrollTo({ top: 0 })
      if (window.location.hash !== `#${view}`) {
        window.history.replaceState(null, '', `#${view}`)
      }
      document.title = `408Lab · ${VIEW_TITLES[view]}`
      prevView.current = view
    }
  }, [view])

  const go = (v: ViewId) => {
    setView(v)
    setMenuOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ReadingProgress />

      {/* ================= 页头 ================= */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => go('home')}
            className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="回到首页"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Terminal className="h-4 w-4" />
            </span>
            <span>
              ~/408<span className="text-primary">Lab</span>
            </span>
          </button>

          {/* 桌面导航 */}
          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="主导航">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => go(n.id)}
                aria-current={view === n.id ? 'page' : undefined}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                  view === n.id
                    ? 'font-medium text-foreground after:absolute'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {view === n.id && (
                  <span className="mr-1 font-mono text-[10px] text-primary">▸</span>
                )}
                {n.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <AuthMenu />
            <a
              href="https://github.com/43aquarius/cs408"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub 仓库"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:flex"
            >
              <Github className="h-4 w-4" />
            </a>
            <ThemeToggle />

            {/* 移动端菜单 */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden" aria-label="打开菜单">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 font-mono">
                    <Terminal className="h-4 w-4 text-primary" /> ~/408Lab
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-2 flex flex-col gap-1 px-4" aria-label="移动端导航">
                  {NAV.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => go(n.id)}
                      aria-current={view === n.id ? 'page' : undefined}
                      className={cn(
                        'rounded-lg px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                        view === n.id
                          ? 'bg-accent font-medium text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                      )}
                    >
                      {n.label}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ================= 主体 ================= */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:py-14">
        {view === 'home' && <HomeView />}
        {view === 'questions' && <QuestionsView />}
        {view === 'practice' && <PracticeView />}
        {view === 'exam' && <ExamView />}
        {view === 'wrong' && <WrongBookView />}
        {view === 'favorites' && <FavoritesView />}
        {view === 'notes' && <NotesView />}
        {view === 'stats' && <StatsView />}
        {view === 'about' && <AboutView />}
      </main>

      {/* ================= 页脚（粘底） ================= */}
      <footer className="mt-auto border-t bg-card/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs text-muted-foreground">
              <span className="text-primary">$</span> echo "考研加油" && ./ship --offer
            </p>
            <p className="font-mono text-[11px] text-muted-foreground/70">
              {ALL_QUESTIONS.length} 道题 · 真题 2009–2026 · 登录后记录云端同步
            </p>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground/60">
            408Lab · 题库依据 2009–2026 年全国硕士研究生招生考试计算机学科专业基础综合（408）真题整理，
            含图题目已文本化改编，仅供个人备考学习。
          </p>
        </div>
      </footer>
    </div>
  )
}
