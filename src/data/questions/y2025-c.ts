import type { Question } from '../types'
import { y2025c1 } from './y2025-c1'
import { y2025c2 } from './y2025-c2'

/** 2025 年 408 统考真题 · 单项选择 1–40（每题 2 分，共 80 分） */
export const y2025c: Question[] = [...y2025c1, ...y2025c2]
