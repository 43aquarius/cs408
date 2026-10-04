import type { Question } from '../types'
import { y2012c1 } from './y2012-c1'
import { y2012c2 } from './y2012-c2'

/** 2012 年 408 统考真题 · 单项选择 1–40（每题 2 分，共 80 分） */
export const y2012c: Question[] = [...y2012c1, ...y2012c2]
