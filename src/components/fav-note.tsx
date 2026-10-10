'use client'

import * as React from 'react'
import { Star, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProgress, isFavorited } from '@/lib/store'
import { cn } from '@/lib/utils'

const NOTE_MAX = 500

function timeLabel(ts: number): string {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

/**
 * 题目收藏 + 备注：挂在 QuestionBody 尾部（题库弹窗 / 刷题 / 错题本 / 模拟考试复盘均生效）。
 * - 收藏：星标切换；已有备注时取消收藏需二次确认
 * - 备注：展开即编辑，失焦或停顿 800ms 自动保存，无需手动点保存
 */
export function QuestionFavNote({ qid }: { qid: string }) {
  const entry = useProgress((s) => s.favorites[qid])
  const toggleFavorite = useProgress((s) => s.toggleFavorite)
  const setNote = useProgress((s) => s.setNote)

  const fav = isFavorited(entry)
  const hasNote = !!entry && entry.note.trim().length > 0

  const [noteOpen, setNoteOpen] = React.useState(false)
  const [draft, setDraft] = React.useState('')
  const [savedAt, setSavedAt] = React.useState<number | null>(null)
  const [confirmRemove, setConfirmRemove] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const confirmTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // 外部数据变化（云同步合并）时同步草稿
  React.useEffect(() => {
    setDraft(entry?.note ?? '')
  }, [qid, entry?.noteAt, entry?.note])

  // 切题时收起编辑器并复位
  React.useEffect(() => {
    setNoteOpen(false)
    setConfirmRemove(false)
    setSavedAt(null)
  }, [qid])

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
    }
  }, [])

  const saveNote = (text: string) => {
    if (text === (useProgress.getState().favorites[qid]?.note ?? '')) return
    setNote(qid, text)
    setSavedAt(Date.now())
  }

  const onDraftChange = (text: string) => {
    setDraft(text)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => saveNote(text), 800)
  }

  const onToggleFav = () => {
    if (fav && hasNote && !confirmRemove) {
      // 有备注的收藏：二次点击才真正移除，避免误触丢备注
      setConfirmRemove(true)
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      confirmTimerRef.current = setTimeout(() => setConfirmRemove(false), 3000)
      return
    }
    toggleFavorite(qid)
    setConfirmRemove(false)
  }

  return (
    <div
      className="rounded-lg border bg-card/60 p-3"
      data-fav-note={qid}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-pressed={fav}
          onClick={onToggleFav}
          className={cn(
            'h-8 gap-1.5 font-mono text-xs',
            fav &&
              'border-amber-500/60 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-400',
          )}
        >
          <Star className={cn('h-3.5 w-3.5', fav && 'fill-current')} aria-hidden />
          {fav ? (confirmRemove ? '再点一次，移除收藏及备注' : '已收藏') : '收藏本题'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-expanded={noteOpen}
          onClick={() => {
            setNoteOpen((v) => {
              const next = !v
              if (next) setTimeout(() => textareaRef.current?.focus(), 0)
              else if (timerRef.current) {
                clearTimeout(timerRef.current)
                saveNote(draft)
              }
              return next
            })
          }}
          className={cn(
            'h-8 gap-1.5 font-mono text-xs',
            hasNote ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <StickyNote className="h-3.5 w-3.5" aria-hidden />
          {hasNote ? '备注 · 已写' : '写备注'}
        </Button>
        {savedAt && !noteOpen && (
          <span className="font-mono text-[11px] text-muted-foreground/70">
            已保存 {timeLabel(savedAt)}
          </span>
        )}
        {fav && entry?.ts && !noteOpen && !hasNote && (
          <span className="ml-auto font-mono text-[11px] text-muted-foreground/50">
            收藏于 {timeLabel(entry.ts)}
          </span>
        )}
      </div>

      {noteOpen && (
        <div className="mt-3">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onBlur={() => {
              if (timerRef.current) {
                clearTimeout(timerRef.current)
                saveNote(draft)
              }
            }}
            maxLength={NOTE_MAX}
            rows={3}
            placeholder="记下你的思路、坑点或口诀，仅自己可见（500 字以内）……"
            aria-label={`题目 ${qid} 的个人备注`}
            className="w-full resize-y rounded-md border bg-background/70 p-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring"
            data-note-input={qid}
          />
          <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-muted-foreground/70">
            <span>
              {savedAt ? `已自动保存 ${timeLabel(savedAt)}` : '失焦自动保存 · 登录后云端同步'}
            </span>
            <span className={cn('tabular-nums', draft.length >= NOTE_MAX && 'text-amber-600 dark:text-amber-400')}>
              {draft.length}/{NOTE_MAX}
            </span>
          </div>
        </div>
      )}

      {!noteOpen && hasNote && (
        <button
          type="button"
          onClick={() => {
            setNoteOpen(true)
            setTimeout(() => textareaRef.current?.focus(), 0)
          }}
          className="mt-2 block w-full rounded-md border border-dashed border-primary/30 bg-primary/5 p-2.5 text-left text-sm leading-relaxed text-foreground/85 transition-colors hover:border-primary/60 hover:bg-primary/10"
          aria-label="展开备注编辑"
        >
          <span className="mb-0.5 block font-mono text-[10px] font-semibold text-primary">
            ✎ 我的备注
          </span>
          <span className="line-clamp-2-safe whitespace-pre-wrap">{draft || entry?.note}</span>
        </button>
      )}
    </div>
  )
}
