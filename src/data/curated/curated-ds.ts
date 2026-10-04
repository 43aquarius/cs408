import type { Question } from '../types'
import { curatedDs1 } from './curated-ds-1'
import { curatedDs2 } from './curated-ds-2'

/** 精选题库 · 数据结构 80 题（单选 1–72 + 综合应用 73–80） */
export const curatedDs: Question[] = [...curatedDs1, ...curatedDs2]
