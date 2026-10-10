'use client'

import * as React from 'react'
import { Star, StickyNote, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QuestionBody } from '@/components/question-body'
import { DifficultyBadge, SourceBadge, SubjectBadge, TopicBadge, YearBadge } from '@/components/badges'
import { getQuestion, QUESTION_MAP } from '@/data'
import { SUBJECTS, SUBJECT_ORDER } from '@/data/types'
import type { SubjectCode } from '@/data/types'
import { useProgress, useUI, favoritedQids } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * 收藏夹：收藏的题目按科目分组，附个人备注；
 * 支持逐题展开复盘、单题重练与整组重练。
 */
export function FavoritesView() {
  const favorites = useProgress((s) => s.favorites)
  const startPractice = useUI((s) => s.startPractice)
  const setView = useUI((s) => s.setView)

  const favQids = React.useMemo(() => favoritedQids(favorites), [favorites])

  const bySubject = React.useMemo(
    () =>
      SUBJECT_ORDER.map((code) => ({
        code,
        items: favQids.filter((qid) => QUESTION_MAP.get(qid)?.subject === code),
      })).filter((g) => g.items.length > 0),
    [favQids],
  )

  const withNote = React.useMemo(
    () => favQids.filter((qid) => (favorites[qid]?.note ?? '').trim().length > 0).length,
    [favQids, favorites],
  )

  if (favQids.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed text-muted-foreground/50">
          <Star className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">收藏夹还是空的</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            $ ls ./favorites/ → 0 items
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            做题后点「收藏本题」或题卡右上角的星标，就能把好题收进来，还能写备注。
          </p>
        </div>
        <Button className="gap-2" onClick={() => setView('practice')}>
          <Target className="h-4 w-4" />
          去刷题
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-primary">$ ls -la ./favorites/</p>
          <h1 className="text-2xl font-bold">收藏夹</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            共 <b className="text-foreground tabular-nums">{favQids.length}</b> 道收藏
            {withNote > 0 && (
              <>
                {' · '}
                <span className="inline-flex items-center gap-1">
                  <StickyNote className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {withNote} 道带备注
                </span>
              </>
            )}
            {' · '}(登录后云端同步，离线版存本地)
          </p>
        </div>
        <Button
          className="gap-2 font-semibold"
          onClick={() => startPractice({ qids: favQids, title: '收藏题重练' })}
        >
          <Target className="h-4 w-4" />
          重练全部收藏
        </Button>
      </header>

      {bySubject.map(({ code, items }) => (
        <section key={code} aria-label={SUBJECTS[code].name}>
          <div className="mb-3 flex items-center gap-2">
            <SubjectBadge subject={code as SubjectCode} />
            <span className="font-mono text-xs text-muted-foreground">{items.length} 题</span>
          </div>
          <div className="flex flex-col gap-3">
            {items.map((qid) => (
              <FavItem key={qid} qid={qid} note={favorites[qid]?.note ?? ''} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function FavItem({ qid, note }: { qid: string; note: string }) {
  const q = getQuestion(qid)
  const startPractice = useUI((s) => s.startPractice)
  const [open, setOpen] = React.useState(false)
  const [removed, setRemoved] = React.useState(false)
  const fav = useProgress((s) => s.favorites[qid]?.fav === true)

  if (!q || (!fav && removed)) return null

  return (
    <Card className={cn('bg-card/90 p-4', !fav && 'opacity-50')}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-xs text-muted-foreground/70">{q.id}</span>
        <YearBadge year={q.year} origin={q.origin} />
        <TopicBadge topic={q.topic} />
        <DifficultyBadge difficulty={q.difficulty} />
        <SourceBadge source={q.source} />
      </div>
      <p className="line-clamp-2-safe text-sm text-foreground/85">{q.question}</p>
      {note.trim() && (
        <div className="mt-2.5 rounded-md border border-dashed border-primary/30 bg-primary/5 p-2.5">
          <p className="mb-0.5 font-mono text-[10px] font-semibold text-primary">✎ 我的备注</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
            {note.trim()}
          </p>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 font-mono text-xs"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '收起' : '展开'}
        </Button>
        <Button
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => startPractice({ qids: [qid], title: '收藏单题重练' })}
        >
          <Target className="h-3 w-3" />
          重练
        </Button>
      </div>
      {open && (
        <div className="mt-4 rounded-lg border bg-muted/30 p-4">
          <QuestionBody q={q} mode="review" reviewSelected={undefined} />
        </div>
      )}
    </Card>
  )
}
