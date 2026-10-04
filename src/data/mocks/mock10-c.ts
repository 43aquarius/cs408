import type { Question } from '../types'
import { mock10c1 } from './mock10-c1'
import { mock10c2 } from './mock10-c2'

/** 模拟卷（十）· 终极押题卷 —— 单选题（40 题，卷面题号 1–40） */
export const mock10c: Question[] = [...mock10c1, ...mock10c2]
