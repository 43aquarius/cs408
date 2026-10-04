import type { Question } from '../types'
import { y2018c1 } from './y2018-c1'
import { y2018c2 } from './y2018-c2'

/** 2018 年 408 统考真题 · 单项选择 1–40（每题 2 分，共 80 分） */
export const y2018c: Question[] = [...y2018c1, ...y2018c2]
