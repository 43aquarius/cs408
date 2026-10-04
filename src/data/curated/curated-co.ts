import type { Question } from '../types'
import { curatedCo1 } from './curated-co-1'
import { curatedCo2 } from './curated-co-2'

/** 精选题库 · 计算机组成原理 80 题（单选 72 + 综合应用 8） */
export const curatedCo: Question[] = [...curatedCo1, ...curatedCo2]
