import type { Question } from '../types'
import { y2024c1 } from './y2024-c1'
import { y2024c2 } from './y2024-c2'

/** 2024 年 408 统考真题 · 单项选择 1–40（每题 2 分，共 80 分） */
export const y2024c: Question[] = [...y2024c1, ...y2024c2]
