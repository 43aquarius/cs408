import type { Question } from '../types'
import { mock08c1 } from './mock08-c1'
import { mock08c2 } from './mock08-c2'

/** 模拟卷（八）· 查漏补缺卷 —— 单选题（40 题，卷面题号 1–40） */
export const mock08c: Question[] = [...mock08c1, ...mock08c2]
