import type { Question } from '../types'
import { y2011c1 } from './y2011-c1'
import { y2011c2 } from './y2011-c2'

/** 2011 年 408 统考真题 · 单项选择 1–40（每题 2 分，共 80 分） */
export const y2011c: Question[] = [...y2011c1, ...y2011c2]
