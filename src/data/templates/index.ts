import type { SubjectCode } from '../types'
import { TEMPLATES_A } from './defs-a'
import { TEMPLATES_B } from './defs-b'

/**
 * 通用解题模板：面向「相对固定的题型」。
 * 题目通过 Question.templateId 引用；讲解区渲染通用解法步骤（方法级内容，
 * 与题目级 explanation、动画级 visual 三层互补）。
 */
export interface SolutionTemplate {
  id: string
  subject: SubjectCode
  title: string
  /** 什么题用这个模板（题干特征） */
  scene: string
  /** 通用步骤（4-5 步，可操作） */
  steps: string[]
  /** 最常见的坑 */
  warn?: string
}

export const TEMPLATES: Record<string, SolutionTemplate> = Object.fromEntries(
  [...TEMPLATES_A, ...TEMPLATES_B].map((t) => [t.id, t]),
)

export const TEMPLATE_LIST: SolutionTemplate[] = [...TEMPLATES_A, ...TEMPLATES_B]

export function getTemplate(id: string | undefined): SolutionTemplate | undefined {
  return id ? TEMPLATES[id] : undefined
}
