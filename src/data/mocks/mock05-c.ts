import type { Question } from '../types'
import { mock05c1 } from './mock05-c1'
import { mock05c2 } from './mock05-c2'

/** 模拟卷（五）· 能力进阶卷 —— 单选题（40 题，卷面题号 1–40） */
export const mock05c: Question[] = [...mock05c1, ...mock05c2]
