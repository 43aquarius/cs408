import type { Question } from '../types'
import { y2010c1 } from './y2010-c1'
import { y2010c2 } from './y2010-c2'

/** 2010 年 408 统考真题 · 单项选择 1–40（每题 2 分，共 80 分） */
export const y2010c: Question[] = [...y2010c1, ...y2010c2]
