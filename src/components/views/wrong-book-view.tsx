'use client'

import * as React from 'react'
import { BookX, Eraser, RefreshCw, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QuestionBody } from '@/components/question-body'
import { DifficultyBadge, SourceBadge, SubjectBadge, TopicBadge, YearBadge } from '@/components/badges'
import { getQuestion, QUESTION_MAP } from '@/data'
import { SUBJECTS, SUBJECT_ORDER } from '@/data/types'
import type { SubjectCode } from '@/data/types'
import { useProgress, useUI, isWrongEntry } from '@/lib/store'
import { cn } from '@/lib/utils'

export function WrongBookView() {
  const records = useProgress((s) => s.records)
  const startPractice = useUI((s) => s.startPractice)
  const setView = useUI((s) => s.setView)

  const wrongQids = React.useMemo(
    () =>
      Object.entries(records)
        .filter(([, r]) => isWrongEntry(r))
        .sort((a, b) => b[1].lastAt - a[1].lastAt)
        .map(([qid]) => qid),
    [records],
  )

  const bySubject = SUBJECT_ORDER.map((code) => ({
    code,
    items: wrongQids.filter((qid) => QUESTION_MAP.get(qid)?.subject === code),
  })).filter((g) => g.items.length > 0)

  if (wrongQids.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed text-muted-foreground/50">
          <BookX className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">错题本是空的</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            $ cat ./wrong-book.txt → (empty file)
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            答错的题目会自动收录到这里。先去刷几组题练练手？
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
          <p className="font-mono text-xs text-primary">$ cat ./wrong-book.txt</p>
          <h1 className="text-2xl font-bold">错题本</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            共 <b className="text-foreground tabular-nums">{wrongQids.length}</b> 道待巩固 · 重练答对后自动移出
          </p>
        </div>
        <Button className="gap-2 font-semibold" onClick={() => startPractice({ qids: wrongQids, title: '错题重练' })}>
          <RefreshCw className="h-4 w-4" />
          重练全部错题
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
              <WrongItem key={qid} qid={qid} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function WrongItem({ qid }: { qid: string }) {
  const q = getQuestion(qid)
  const rec = useProgress((s) => s.records[qid])
  const startPractice = useUI((s) => s.startPractice)
  const submitAnswer = useProgress((s) => s.submitAnswer)
  const [open, setOpen] = React.useState(false)
  const [removed, setRemoved] = React.useState(false)

  if (!q || removed) return null
  const solved = rec ? rec.correct > 0 && rec.lastResult !== 'wrong' && rec.lastResult !== 'unmastered' : false

  return (
    <Card className={cn('bg-card/90 p-4 transition-opacity', solved && 'opacity-60')}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-xs text-muted-foreground/70">{q.id}</span>
        <YearBadge year={q.year} origin={q.origin} />
        <TopicBadge topic={q.topic} />
        <DifficultyBadge difficulty={q.difficulty} />
        <SourceBadge source={q.source} />
        <span className="ml-auto font-mono text-[11px] text-rose-600 dark:text-rose-400">
          错 {rec?.wrong ?? 0} 次
        </span>
      </div>
      <p className="line-clamp-2-safe text-sm text-foreground/85">{q.question}</p>
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
          onClick={() => startPractice({ qids: [qid], title: '单题重练' })}
        >
          <RefreshCw className="h-3 w-3" />
          重练
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 font-mono text-xs text-muted-foreground"
          onClick={() => {
            // 标记已掌握：以“答对”覆盖最近结果
            submitAnswer(qid, 'correct')
            setRemoved(true)
          }}
          title="手动移出错题本"
        >
          <Eraser className="h-3 w-3" />
          标记已掌握
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
