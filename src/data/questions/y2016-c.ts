import type { Question } from '../types'
import { y2016c1 } from './y2016-c1'
import { y2016c2 } from './y2016-c2'

/** 2016 年 408 统考真题 · 单项选择 1–40（每题 2 分，共 80 分） */
export const y2016c: Question[] = [...y2016c1, ...y2016c2]
