import type { Question } from '../types'
import { curatedOs1 } from './curated-os-1'
import { curatedOs2 } from './curated-os-2'

/** 精选题库 · 操作系统（80 题：单选 72 + 综合应用 8） */
export const curatedOs: Question[] = [...curatedOs1, ...curatedOs2]
