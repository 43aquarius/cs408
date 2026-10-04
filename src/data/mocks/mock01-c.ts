import type { Question } from '../types'
import { mock01c1 } from './mock01-c1'
import { mock01c2 } from './mock01-c2'

/** 模拟卷（一）· 基础过关卷 —— 单选题（40 题，卷面题号 1–40） */
export const mock01c: Question[] = [...mock01c1, ...mock01c2]
