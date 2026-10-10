import type { Question, SubjectCode, Difficulty } from './types'
import { SUBJECT_ORDER } from './types'
import { y2009c } from './questions/y2009-c'
import { y2009a } from './questions/y2009-a'
import { y2010c } from './questions/y2010-c'
import { y2010a } from './questions/y2010-a'
import { y2011c } from './questions/y2011-c'
import { y2011a } from './questions/y2011-a'
import { y2012c } from './questions/y2012-c'
import { y2012a } from './questions/y2012-a'
import { y2013c } from './questions/y2013-c'
import { y2013a } from './questions/y2013-a'
import { y2014c } from './questions/y2014-c'
import { y2014a } from './questions/y2014-a'
import { y2015c } from './questions/y2015-c'
import { y2015a } from './questions/y2015-a'
import { y2016c } from './questions/y2016-c'
import { y2016a } from './questions/y2016-a'
import { y2017c } from './questions/y2017-c'
import { y2017a } from './questions/y2017-a'
import { y2018c } from './questions/y2018-c'
import { y2018a } from './questions/y2018-a'
import { y2019c } from './questions/y2019-c'
import { y2019a } from './questions/y2019-a'
import { y2020c } from './questions/y2020-c'
import { y2020a } from './questions/y2020-a'
import { y2021c } from './questions/y2021-c'
import { y2021a } from './questions/y2021-a'
import { y2022c } from './questions/y2022-c'
import { y2022a } from './questions/y2022-a'
import { y2023c } from './questions/y2023-c'
import { y2023a } from './questions/y2023-a'
import { y2024c } from './questions/y2024-c'
import { y2024a } from './questions/y2024-a'
import { y2025c } from './questions/y2025-c'
import { y2025a } from './questions/y2025-a'
import { y2026c } from './questions/y2026-c'
import { y2026a } from './questions/y2026-a'

import { curatedDs } from './curated/curated-ds'
import { curatedCo } from './curated/curated-co'
import { curatedOs } from './curated/curated-os'
import { curatedCn } from './curated/curated-cn'

import { mock01c } from './mocks/mock01-c'
import { mock01a } from './mocks/mock01-a'
import { mock02c } from './mocks/mock02-c'
import { mock02a } from './mocks/mock02-a'
import { mock03c } from './mocks/mock03-c'
import { mock03a } from './mocks/mock03-a'
import { mock04c } from './mocks/mock04-c'
import { mock04a } from './mocks/mock04-a'
import { mock05c } from './mocks/mock05-c'
import { mock05a } from './mocks/mock05-a'
import { mock06c } from './mocks/mock06-c'
import { mock06a } from './mocks/mock06-a'
import { mock07c } from './mocks/mock07-c'
import { mock07a } from './mocks/mock07-a'
import { mock08c } from './mocks/mock08-c'
import { mock08a } from './mocks/mock08-a'
import { mock09c } from './mocks/mock09-c'
import { mock09a } from './mocks/mock09-a'
import { mock10c } from './mocks/mock10-c'
import { mock10a } from './mocks/mock10-a'

/**
 * 全部真题整卷（2009–2026 届共 18 套，每套 47 题 = 40 单选 + 7 综合，150 分）。
 * 按「年份 → 卷面题号」排序，保持真实试卷顺序；选项顺序与答案均为原卷保真，不做再平衡。
 */
export const QUESTIONS: Question[] = [
  ...y2009c, ...y2009a,
  ...y2010c, ...y2010a,
  ...y2011c, ...y2011a,
  ...y2012c, ...y2012a,
  ...y2013c, ...y2013a,
  ...y2014c, ...y2014a,
  ...y2015c, ...y2015a,
  ...y2016c, ...y2016a,
  ...y2017c, ...y2017a,
  ...y2018c, ...y2018a,
  ...y2019c, ...y2019a,
  ...y2020c, ...y2020a,
  ...y2021c, ...y2021a,
  ...y2022c, ...y2022a,
  ...y2023c, ...y2023a,
  ...y2024c, ...y2024a,
  ...y2025c, ...y2025a,
  ...y2026c, ...y2026a,
].sort((a, b) => (a.year !== b.year ? a.year - b.year : a.number - b.number))

export const QUESTION_MAP: Map<string, Question> = new Map(
  QUESTIONS.map((q) => [q.id, q]),
)

/** 精选题库（四科 × 80 题，高质量自创 + 经典改编，含逐选项讲解与动画） */
export const CURATED: Question[] = [
  ...curatedDs,
  ...curatedCo,
  ...curatedOs,
  ...curatedCn,
]

/** 十套全真模拟卷（每套 47 题 = 40 单选 + 7 综合，150 分；每题逐选项讲解 + 过程动画） */
export const MOCKS: Question[] = [
  ...mock01c, ...mock01a,
  ...mock02c, ...mock02a,
  ...mock03c, ...mock03a,
  ...mock04c, ...mock04a,
  ...mock05c, ...mock05a,
  ...mock06c, ...mock06a,
  ...mock07c, ...mock07a,
  ...mock08c, ...mock08a,
  ...mock09c, ...mock09a,
  ...mock10c, ...mock10a,
]

/** 一套可开考的整卷（真题年份卷或模拟卷） */
export interface PaperInfo {
  /** 唯一 key：真题为 'y2009' 形式，模拟卷为 'mock01' 形式 */
  key: string
  /** 展示名：真题为 '2009 年真题'，模拟卷为 '模拟卷（一）· 基础过关卷' */
  title: string
  /** 是否模拟卷 */
  mock: boolean
  /** 47 道题，按卷面题号 1–47 排序 */
  questions: Question[]
}

const byNumber = (a: Question, b: Question) => a.number - b.number

/** 十套模拟卷卷册（每套按卷面题号排序） */
export const MOCK_PAPERS: PaperInfo[] = [
  { key: 'mock01', title: '模拟卷（一）· 基础过关卷', mock: true, questions: [...mock01c, ...mock01a].sort(byNumber) },
  { key: 'mock02', title: '模拟卷（二）· 考点全查卷', mock: true, questions: [...mock02c, ...mock02a].sort(byNumber) },
  { key: 'mock03', title: '模拟卷（三）· 强化训练卷', mock: true, questions: [...mock03c, ...mock03a].sort(byNumber) },
  { key: 'mock04', title: '模拟卷（四）· 高频考点卷', mock: true, questions: [...mock04c, ...mock04a].sort(byNumber) },
  { key: 'mock05', title: '模拟卷（五）· 能力进阶卷', mock: true, questions: [...mock05c, ...mock05a].sort(byNumber) },
  { key: 'mock06', title: '模拟卷（六）· 综合应用卷', mock: true, questions: [...mock06c, ...mock06a].sort(byNumber) },
  { key: 'mock07', title: '模拟卷（七）· 难度挑战卷', mock: true, questions: [...mock07c, ...mock07a].sort(byNumber) },
  { key: 'mock08', title: '模拟卷（八）· 查漏补缺卷', mock: true, questions: [...mock08c, ...mock08a].sort(byNumber) },
  { key: 'mock09', title: '模拟卷（九）· 考前实战卷（一）', mock: true, questions: [...mock09c, ...mock09a].sort(byNumber) },
  { key: 'mock10', title: '模拟卷（十）· 终极押题卷', mock: true, questions: [...mock10c, ...mock10a].sort(byNumber) },
]

/** 全站题库 = 真题 846 + 精选 320 + 模拟 470 */
export const ALL_QUESTIONS: Question[] = [...QUESTIONS, ...CURATED, ...MOCKS]

/** 全库索引（含精选与模拟题：错题本 / 模考复盘 / 焦点跳转均按全库解析） */
export const ALL_MAP: Map<string, Question> = new Map(
  ALL_QUESTIONS.map((q) => [q.id, q]),
)

export const YEARS: number[] = Array.from(new Set(QUESTIONS.map((q) => q.year))).sort(
  (a, b) => a - b,
)

export const TOTAL = QUESTIONS.length

/** 每套整卷的单选题数（全卷题数减综合题数） */
export const SINGLE_COUNT = QUESTIONS.filter((q) => q.type === 'single').length

export function countBySubject(subject: SubjectCode): number {
  return QUESTIONS.filter((q) => q.subject === subject).length
}

export function countByYear(year: number): number {
  return QUESTIONS.filter((q) => q.year === year).length
}

export function topicsBySubject(subject: SubjectCode): string[] {
  const set = new Set<string>()
  QUESTIONS.forEach((q) => {
    if (q.subject === subject) set.add(q.topic)
  })
  return Array.from(set)
}

export const ALL_TOPICS: string[] = Array.from(
  new Set(QUESTIONS.map((q) => q.topic)),
).sort((a, b) => a.localeCompare(b, 'zh-CN'))

export interface QuestionFilter {
  subjects?: SubjectCode[]
  years?: number[]
  type?: 'all' | 'single' | 'application'
  difficulty?: Difficulty | 'all'
  source?: 'all' | 'real' | 'adapted' | 'curated' | 'mock'
  keyword?: string
  /** 限定题号白名单（收藏筛选等） */
  ids?: Set<string>
}

export function filterQuestions(f: QuestionFilter): Question[] {
  const kw = f.keyword?.trim().toLowerCase() ?? ''
  return ALL_QUESTIONS.filter((q) => {
    if (f.ids && !f.ids.has(q.id)) return false
    if (f.subjects && f.subjects.length > 0 && !f.subjects.includes(q.subject)) return false
    // 年份筛选仅对真题生效（精选/模拟题 year=0，指定年份时自动排除）
    if (f.years && f.years.length > 0 && !f.years.includes(q.year)) return false
    if (f.type && f.type !== 'all' && q.type !== f.type) return false
    if (f.difficulty && f.difficulty !== 'all' && q.difficulty !== f.difficulty) return false
    if (f.source && f.source !== 'all' && q.source !== f.source) return false
    if (kw) {
      const hay = `${q.question} ${q.topic} ${q.explanation}`.toLowerCase()
      if (!hay.includes(kw)) return false
    }
    return true
  })
}

export function getQuestion(id: string): Question | undefined {
  return ALL_MAP.get(id)
}

export type { Question, SubjectCode, Difficulty }
