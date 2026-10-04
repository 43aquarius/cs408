/**
 * 408 真题整卷校验脚本
 * 用法：
 *   bun scripts/verify-bank.ts --year 2010   只校验某一年
 *   bun scripts/verify-bank.ts               校验所有已存在的年份
 *   bun scripts/verify-bank.ts --strict      18 套（2009-2026）必须齐全
 */
import type { Question } from '../src/data/types'

const ROOT = process.cwd()
const QDIR = `${ROOT}/src/data/questions`
const ALL_YEARS = Array.from({ length: 18 }, (_, i) => 2009 + i)

const args = process.argv.slice(2)
const yearIdx = args.indexOf('--year')
const strict = args.includes('--strict')
const yearFilter = yearIdx >= 0 ? Number(args[yearIdx + 1]) : null

const SUBJECT_BY_NUMBER = (n: number): string => {
  if (n >= 1 && n <= 11) return 'ds'
  if (n >= 12 && n <= 22) return 'co'
  if (n >= 23 && n <= 32) return 'os'
  if (n >= 33 && n <= 40) return 'cn'
  if (n === 41 || n === 42) return 'ds'
  if (n === 43 || n === 44) return 'co'
  if (n === 45 || n === 46) return 'os'
  if (n === 47) return 'cn'
  return ''
}

const BIG_SCORE_RULES: Array<{ nums: number[]; sum: number; label: string }> = [
  { nums: [41, 42], sum: 23, label: '数据结构综合(41+42)' },
  { nums: [43, 44], sum: 23, label: '组成原理综合(43+44)' },
  { nums: [45, 46], sum: 15, label: '操作系统综合(45+46)' },
  { nums: [47], sum: 9, label: '网络综合(47)' },
]

const PLACEHOLDER_RE = /TODO|FIXME|待补充|此处省略|（略）|\(略\)|占位符|XXXX+|\?\?\?+/

async function loadYear(y: number): Promise<{ c: Question[]; a: Question[] } | null> {
  try {
    const c = (await import(`${QDIR}/y${y}-c.ts`)) as Record<string, Question[]>
    const a = (await import(`${QDIR}/y${y}-a.ts`)) as Record<string, Question[]>
    const cList = c[`y${y}c`]
    const aList = a[`y${y}a`]
    if (!Array.isArray(cList) || !Array.isArray(aList)) return null
    return { c: cList, a: aList }
  } catch {
    return null
  }
}

function checkQuestion(q: Question, y: number, errs: string[], warns: string[]): void {
  const where = `q-${y}-${String(q.number).padStart(2, '0')}`
  if (q.id !== where) errs.push(`${where}: id 应为 ${where}，实际 ${q.id}`)
  if (q.year !== y) errs.push(`${where}: year 应为 ${y}`)
  if (typeof q.number !== 'number' || q.number < 1 || q.number > 47)
    errs.push(`${where}: 非法卷面题号 ${q.number}`)
  const expectSubj = SUBJECT_BY_NUMBER(q.number)
  if (q.subject !== expectSubj)
    errs.push(`${where}: 题号 ${q.number} 科目应为 ${expectSubj}，实际 ${q.subject}`)
  const expectType = q.number <= 40 ? 'single' : 'application'
  if (q.type !== expectType)
    errs.push(`${where}: 题号 ${q.number} 题型应为 ${expectType}，实际 ${q.type}`)
  if (!q.topic || q.topic.length > 10) warns.push(`${where}: topic 缺失或过长（${q.topic}）`)
  if (![1, 2, 3].includes(q.difficulty)) errs.push(`${where}: difficulty 非法`)
  if (!['real', 'adapted'].includes(q.source)) errs.push(`${where}: source 非法`)
  if (!q.question || q.question.length < 8) errs.push(`${where}: 题干过短`)
  if (PLACEHOLDER_RE.test(q.question) || PLACEHOLDER_RE.test(q.explanation ?? ''))
    errs.push(`${where}: 疑似占位文本`)
  if (!q.explanation || q.explanation.length < 25) errs.push(`${where}: 解析过短`)

  if (q.type === 'single') {
    if (q.score !== 2) errs.push(`${where}: 单选 score 应为 2`)
    if (!q.options || q.options.length !== 4) errs.push(`${where}: 选项数应为 4`)
    if (!/^[A-D]$/.test(q.answer ?? '')) errs.push(`${where}: answer 非法（${q.answer}）`)
    if (q.answerText) warns.push(`${where}: 单选题不应有 answerText`)
  } else {
    if (typeof q.score !== 'number' || q.score <= 0) errs.push(`${where}: 综合 score 非法`)
    if (!q.answerText || q.answerText.length < 30)
      errs.push(`${where}: 综合题 answerText 缺失或过短`)
    if (q.options || q.answer) errs.push(`${where}: 综合题不应有 options/answer`)
  }
}

async function main(): Promise<void> {
  const years = yearFilter ? [yearFilter] : ALL_YEARS
  const errors: string[] = []
  const warns: string[] = []
  const summaries: string[] = []
  const stemSeen = new Map<string, string>() // normalized -> "year-number"
  const idSeen = new Map<string, string>()
  let okCount = 0

  for (const y of years) {
    const data = await loadYear(y)
    if (!data) {
      if (strict || yearFilter) errors.push(`${y}: 数据文件缺失或导出名错误（y${y}c / y${y}a）`)
      else summaries.push(`${y}: —— 未生成（跳过）`)
      continue
    }
    const all = [...data.c, ...data.a]
    const yErrs: string[] = []
    const yWarns: string[] = []

    if (data.c.length !== 40) yErrs.push(`${y}: 单选数量 ${data.c.length} ≠ 40`)
    if (data.a.length !== 7) yErrs.push(`${y}: 综合题数量 ${data.a.length} ≠ 7`)

    const nums = all.map((q) => q.number).sort((x, z) => x - z)
    const expect = Array.from({ length: 47 }, (_, i) => i + 1)
    if (JSON.stringify(nums) !== JSON.stringify(expect))
      yErrs.push(`${y}: 卷面题号不是 1..47 连续（实际 ${nums.join(',')}）`)

    all.forEach((q) => checkQuestion(q, y, yErrs, yWarns))

    const totalScore = all.reduce((s, q) => s + (q.score ?? 0), 0)
    if (totalScore !== 150) yErrs.push(`${y}: 全卷分值 ${totalScore} ≠ 150`)
    BIG_SCORE_RULES.forEach((r) => {
      const s = all.filter((q) => r.nums.includes(q.number)).reduce((x, q) => x + (q.score ?? 0), 0)
      if (s !== r.sum) yErrs.push(`${y}: ${r.label} 分值 ${s} ≠ ${r.sum}`)
    })

    all.forEach((q) => {
      if (idSeen.has(q.id)) yErrs.push(`ID 重复：${q.id} 同时出现在 ${idSeen.get(q.id)} 和 ${y}`)
      idSeen.set(q.id, `${y}`)
      const norm = (q.question ?? '').replace(/[\s\p{P}]/gu, '').slice(0, 24)
      if (norm.length >= 20) {
        const prev = stemSeen.get(norm)
        if (prev && prev !== `${y}-${q.number}`)
          yWarns.push(`疑似跨年重复：${prev} 与 ${y}-${q.number} 题干前缀相同`)
        stemSeen.set(norm, `${y}-${q.number}`)
      }
    })

    if (yErrs.length === 0) {
      okCount++
      summaries.push(`${y}: 47 题（单选40 综合7）150 分 ✓`)
    } else {
      summaries.push(`${y}: ${yErrs.length} 处错误 ✗`)
      errors.push(...yErrs)
    }
    warns.push(...yWarns)
  }

  console.log('=== 408 题库校验 ===')
  summaries.forEach((s) => console.log(s))
  if (warns.length) {
    console.log(`\n--- 警告 ${warns.length} 条 ---`)
    warns.forEach((w) => console.log(`WARN  ${w}`))
  }
  if (errors.length) {
    console.log(`\n--- 错误 ${errors.length} 条 ---`)
    errors.forEach((e) => console.log(`ERROR ${e}`))
    process.exit(1)
  }
  console.log(`\nALL CHECKS PASSED（${okCount} 套整卷）`)
}

main()
