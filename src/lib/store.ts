'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SubjectCode } from '@/data/types'

/* ---------------- 进度存储（localStorage 持久化） ---------------- */

export interface QRecord {
  attempts: number
  correct: number
  wrong: number
  /** 最近一次结果：单选对错 / 综合题自评 */
  lastResult: 'correct' | 'wrong' | 'mastered' | 'unmastered'
  lastAt: number
}

export interface ExamRecord {
  id: string
  ts: number
  label: string
  total: number
  correct: number
  /** 预估得分：单选按 2 分/题；整卷含综合题自评分 */
  score?: number
  /** 满分：80（纯单选卷）或 150（整卷） */
  scoreMax?: number
  durationSec: number
  perSubject: Partial<Record<SubjectCode, { c: number; t: number }>>
}

/** 收藏条目：条目不物理删除（fav=false 即取消），便于多端同步合并 */
export interface FavEntry {
  fav: boolean
  /** 收藏状态最近一次变更时间（同步时决定 fav 以谁为准） */
  ts: number
  note: string
  /** 备注最近一次编辑时间（同步时决定 note 以谁为准） */
  noteAt: number
}

interface ProgressState {
  records: Record<string, QRecord>
  /** 'YYYY-MM-DD' -> 当日答题次数 */
  daily: Record<string, number>
  exams: ExamRecord[]
  /** 题目收藏 + 备注（qid -> 条目） */
  favorites: Record<string, FavEntry>
  submitAnswer: (qid: string, result: 'correct' | 'wrong') => void
  markApplication: (qid: string, mastered: boolean) => void
  addExam: (rec: Omit<ExamRecord, 'id' | 'ts'> & { id?: string }) => void
  updateExam: (id: string, patch: Partial<ExamRecord>) => void
  toggleFavorite: (qid: string) => void
  setNote: (qid: string, note: string) => void
  resetAll: () => void
}

function todayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      records: {},
      daily: {},
      exams: [],
      favorites: {},
      submitAnswer: (qid, result) =>
        set((s) => {
          const prev = s.records[qid]
          const rec: QRecord = {
            attempts: (prev?.attempts ?? 0) + 1,
            correct: (prev?.correct ?? 0) + (result === 'correct' ? 1 : 0),
            wrong: (prev?.wrong ?? 0) + (result === 'wrong' ? 1 : 0),
            lastResult: result,
            lastAt: Date.now(),
          }
          const key = todayKey()
          return {
            records: { ...s.records, [qid]: rec },
            daily: { ...s.daily, [key]: (s.daily[key] ?? 0) + 1 },
          }
        }),
      markApplication: (qid, mastered) =>
        set((s) => {
          const prev = s.records[qid]
          const rec: QRecord = {
            attempts: (prev?.attempts ?? 0) + 1,
            correct: (prev?.correct ?? 0) + (mastered ? 1 : 0),
            wrong: (prev?.wrong ?? 0) + (mastered ? 0 : 1),
            lastResult: mastered ? 'mastered' : 'unmastered',
            lastAt: Date.now(),
          }
          const key = todayKey()
          return {
            records: { ...s.records, [qid]: rec },
            daily: { ...s.daily, [key]: (s.daily[key] ?? 1) },
          }
        }),
      addExam: (rec) =>
        set((s) => ({
          exams: [
            ...s.exams,
            { ...rec, id: rec.id ?? `exam-${Date.now()}`, ts: Date.now() },
          ].slice(-50),
        })),
      updateExam: (id, patch) =>
        set((s) => ({
          exams: s.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      toggleFavorite: (qid) =>
        set((s) => {
          const prev = s.favorites[qid]
          return {
            favorites: {
              ...s.favorites,
              [qid]: { fav: !(prev?.fav ?? false), ts: Date.now(), note: prev?.note ?? '', noteAt: prev?.noteAt ?? 0 },
            },
          }
        }),
      setNote: (qid, note) =>
        set((s) => {
          const prev = s.favorites[qid]
          return {
            favorites: {
              ...s.favorites,
              [qid]: { fav: prev?.fav ?? false, ts: prev?.ts ?? 0, note, noteAt: Date.now() },
            },
          }
        }),
      resetAll: () => set({ records: {}, daily: {}, exams: [], favorites: {} }),
    }),
    {
      name: '408lab-progress-v1',
    },
  ),
)

/* ---------------- UI 视图路由（单页多视图 + hash 同步） ---------------- */

export type ViewId =
  | 'home'
  | 'questions'
  | 'practice'
  | 'exam'
  | 'wrong'
  | 'favorites'
  | 'notes'
  | 'stats'
  | 'about'

interface PracticeConfig {
  qids: string[]
  title: string
}

interface UIState {
  view: ViewId
  /** 从首页/错题本点开的题目详情 */
  focusQid: string | null
  /** 预置的刷题会话（错题重练等） */
  practicePreset: PracticeConfig | null
  /** 题库视图的科目预置筛选 */
  questionsSubject: SubjectCode | 'all' | null
  /** 题库视图的搜索预置（经验笔记考点跳转） */
  questionsKeyword: string | null
  setView: (v: ViewId) => void
  openQuestion: (qid: string) => void
  setFocus: (qid: string | null) => void
  startPractice: (cfg: PracticeConfig) => void
  consumePracticePreset: () => PracticeConfig | null
  openQuestionsWith: (subject: SubjectCode | 'all') => void
  openQuestionsSearch: (keyword: string) => void
  consumeQuestionsSubject: () => SubjectCode | 'all' | null
  consumeQuestionsKeyword: () => string | null
}

export const useUI = create<UIState>((set, get) => ({
  view: 'home',
  focusQid: null,
  practicePreset: null,
  questionsSubject: null,
  questionsKeyword: null,
  setView: (v) => set({ view: v, focusQid: null }),
  openQuestion: (qid) => set({ view: 'questions', focusQid: qid }),
  setFocus: (qid) => set({ focusQid: qid }),
  startPractice: (cfg) => set({ view: 'practice', practicePreset: cfg, focusQid: null }),
  consumePracticePreset: () => {
    const p = get().practicePreset
    if (p) set({ practicePreset: null })
    return p
  },
  openQuestionsWith: (subject) => set({ view: 'questions', questionsSubject: subject, focusQid: null }),
  openQuestionsSearch: (keyword) =>
    set({ view: 'questions', questionsSubject: 'all', questionsKeyword: keyword, focusQid: null }),
  consumeQuestionsSubject: () => {
    const v = get().questionsSubject
    if (v) set({ questionsSubject: null })
    return v
  },
  consumeQuestionsKeyword: () => {
    const v = get().questionsKeyword
    if (v) set({ questionsKeyword: null })
    return v
  },
}))

/* ---------------- 派生统计（供各视图复用） ---------------- */

export function accuracyOf(rec: QRecord | undefined): number | null {
  if (!rec || rec.correct + rec.wrong === 0) return null
  return rec.correct / (rec.correct + rec.wrong)
}

export function isWrongEntry(rec: QRecord | undefined): boolean {
  if (!rec) return false
  return (
    (rec.lastResult === 'wrong' || rec.lastResult === 'unmastered') &&
    rec.wrong > 0
  )
}

/** 是否已收藏（多视图复用） */
export function isFavorited(fav: FavEntry | undefined): boolean {
  return fav?.fav === true
}

/** 收藏的题号列表（按收藏时间倒序） */
export function favoritedQids(favorites: Record<string, FavEntry>): string[] {
  return Object.entries(favorites)
    .filter(([, f]) => f.fav)
    .sort((a, b) => b[1].ts - a[1].ts)
    .map(([qid]) => qid)
}
