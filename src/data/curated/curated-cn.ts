import type { Question } from '../types'
import { curatedCn1 } from './curated-cn-1'
import { curatedCn2 } from './curated-cn-2'

/** 精选题库 · 计算机网络 80 题（单选 72 + 综合应用 8） */
export const curatedCn: Question[] = [...curatedCn1, ...curatedCn2]
