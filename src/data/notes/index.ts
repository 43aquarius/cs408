import { QUESTIONS } from '../index'
import { guide } from './guide'
import { ds } from './ds'
import { co } from './co'
import { os } from './os'
import { cn } from './cn'
import { trends } from './trends'
import type { NoteCategory, NoteChapter } from './types'
import type { SubjectCode } from '../types'

/**
 * 经验笔记总装配：备考指南 → 四大科目笔记 → 考情与易错。
 * order 决定展示顺序。
 */
export const NOTE_CATEGORIES: NoteCategory[] = [guide, ds, co, os, cn, trends].sort(
  (a, b) => a.order - b.order,
)

/**
 * 章节考频：按 topicKeywords 与题库 Question.topic 双向包含匹配。
 * 若章节所属类别对应科目（ds/co/os/cn），仅统计该科目题目，避免跨科误匹配。
 */
export function chapterFreq(
  ch: NoteChapter,
  subject?: string,
): { count: number; years: number[] } {
  const kws = ch.topicKeywords ?? []
  if (kws.length === 0) return { count: 0, years: [] }
  const pool =
    subject === 'ds' || subject === 'co' || subject === 'os' || subject === 'cn'
      ? QUESTIONS.filter((q) => q.subject === (subject as SubjectCode))
      : QUESTIONS
  const hits = pool.filter((q) =>
    kws.some((k) => q.topic.includes(k) || k.includes(q.topic)),
  )
  const years = [...new Set(hits.map((q) => q.year))].sort((a, b) => a - b)
  return { count: hits.length, years }
}

export type { NoteCategory, NoteChapter, NoteBlock } from './types'
