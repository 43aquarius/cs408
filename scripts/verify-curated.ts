/**
 * 408 精选题库校验脚本
 * 用法：bun scripts/verify-curated.ts ds
 */
import type { Question } from '../src/data/types'
import { TEMPLATES } from '../src/data/templates'

const ROOT = process.cwd()
const subj = process.argv[2]
if (!subj || !['ds', 'co', 'os', 'cn'].includes(subj)) {
  console.error('用法: bun scripts/verify-curated.ts ds|co|os|cn')
  process.exit(1)
}

const FILE = `curated-${subj}`
const EXPORT = `curated${subj[0].toUpperCase()}${subj[1]}`

const PLACEHOLDER_RE = /TODO|FIXME|待补充|此处省略|（略）|\(略\)|占位符|XXXX+|\?\?\?+/

async function main() {
  const errs: string[] = []
  const warns: string[] = []
  let list: Question[] = []
  try {
    const m = (await import(`${ROOT}/src/data/curated/${FILE}.ts`)) as Record<string, Question[]>
    list = m[EXPORT]
  } catch (e) {
    console.error(`❌ 无法加载 ${FILE}:`, e instanceof Error ? e.message : e)
    process.exit(1)
  }

  if (!Array.isArray(list) || list.length !== 80) {
    console.error(`❌ 题数应为 80，实际 ${list?.length ?? 0}`)
    process.exit(1)
  }

  const singles = list.filter((q) => q.type === 'single')
  const apps = list.filter((q) => q.type === 'application')
  if (singles.length !== 72) errs.push(`单选题应 72 道，实际 ${singles.length}`)
  if (apps.length !== 8) errs.push(`综合题应 8 道，实际 ${apps.length}`)

  const ids = new Set<string>()
  let visualCount = 0
  const letterCount: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 }
  const diffCount: Record<number, number> = { 1: 0, 2: 0, 3: 0 }
  const topics = new Map<string, number>()

  list.forEach((q, i) => {
    const where = q.id
    const expectId = `cur-${subj}-${String(i + 1).padStart(3, '0')}`
    if (q.id !== expectId) errs.push(`第 ${i + 1} 题: id 应为 ${expectId}，实际 ${q.id}`)
    if (ids.has(q.id)) errs.push(`${where}: id 重复`)
    ids.add(q.id)
    if (q.year !== 0) errs.push(`${where}: year 应为 0`)
    if (q.source !== 'curated') errs.push(`${where}: source 应为 curated`)
    if (q.origin !== '精选题库') errs.push(`${where}: origin 应为 精选题库`)
    if (q.subject !== subj) errs.push(`${where}: subject 应为 ${subj}`)
    if (q.number !== i + 1) errs.push(`${where}: number 应为 ${i + 1}`)
    if (!q.topic || q.topic.length > 8) warns.push(`${where}: topic 为空或超 8 字`)
    topics.set(q.topic, (topics.get(q.topic) ?? 0) + 1)
    if (PLACEHOLDER_RE.test(q.question) || PLACEHOLDER_RE.test(q.explanation))
      errs.push(`${where}: 检测到占位文本`)
    if (!q.explanation || q.explanation.length < 80)
      errs.push(`${where}: explanation ${q.explanation?.length ?? 0} 字 < 80 字`)
    diffCount[q.difficulty] = (diffCount[q.difficulty] ?? 0) + 1
    if (q.visual) {
      visualCount++
      const v = q.visual as { kind?: string; frames?: unknown[]; steps?: unknown[]; accesses?: unknown[]; points?: unknown[]; instrs?: unknown[]; messages?: unknown[]; nodes?: unknown[] }
      if (['sort'].includes(v.kind ?? '') && (v.frames?.length ?? 0) < 2) errs.push(`${where}: visual ${v.kind} 步数不足`)
      if (['tree', 'graph'].includes(v.kind ?? '') && (v.steps?.length ?? 0) < 2) errs.push(`${where}: visual ${v.kind} 步数不足`)
      if (v.kind === 'pages' && (v.accesses?.length ?? 0) < 4) errs.push(`${where}: visual pages 序列过短`)
    }
    // templateId 必须在注册表且学科匹配
    if (q.templateId) {
      if (!TEMPLATES[q.templateId]) errs.push(`${where}: templateId '${q.templateId}' 不在模板注册表`)
      else if (TEMPLATES[q.templateId].subject !== q.subject)
        errs.push(`${where}: templateId '${q.templateId}' 学科不匹配（模板属 ${TEMPLATES[q.templateId].subject}）`)
    }

    if (q.type === 'single') {
      if (!q.options || q.options.length !== 4) errs.push(`${where}: 选项应恰好 4 项`)
      if (!q.answer || !'ABCD'.includes(q.answer)) errs.push(`${where}: answer 非法`)
      else letterCount[q.answer]++
      if (q.score !== 2) errs.push(`${where}: 单选 score 应为 2`)
      if (q.optionExplanations) {
        if (q.optionExplanations.length !== 4) errs.push(`${where}: optionExplanations 应 4 条`)
        q.optionExplanations.forEach((e, j) => {
          if (e && e.length < 20) errs.push(`${where}: 选项 ${'ABCD'[j]} 讲解过短`)
        })
      }
    } else {
      if (q.options || q.answer) errs.push(`${where}: 综合题不应有 options/answer`)
      if (!q.answerText || q.answerText.length < 80) errs.push(`${where}: answerText 过短`)
      if (!q.score || q.score < 8 || q.score > 15) warns.push(`${where}: 综合题分值 ${q.score} 建议在 8-15`)
    }
  })

  if (visualCount < 5) errs.push(`visual 动画仅 ${visualCount} 个 < 5`)
  if (diffCount[1] < 18 || diffCount[1] > 30) warns.push(`难度 1 有 ${diffCount[1]} 题（目标约 24）`)
  if (diffCount[2] < 34 || diffCount[2] > 46) warns.push(`难度 2 有 ${diffCount[2]} 题（目标约 40）`)
  if (diffCount[3] < 10 || diffCount[3] > 22) warns.push(`难度 3 有 ${diffCount[3]} 题（目标约 16）`)
  topics.forEach((n, t) => {
    if (n > 4) errs.push(`topic「${t}」出现 ${n} 次 > 4`)
  })
  const letters = Object.entries(letterCount)
  letters.forEach(([l, n]) => {
    if (n > 26) warns.push(`答案 ${l} 出现 ${n} 次，过于集中`)
    if (n < 10) warns.push(`答案 ${l} 仅 ${n} 次`)
  })

  console.log(`\n===== curated-${subj} 校验结果 =====`)
  console.log(`题数: ${list.length}（单选 ${singles.length} + 综合 ${apps.length}）`)
  console.log(`动画: ${visualCount} 个 · 难度分布 1/2/3 = ${diffCount[1]}/${diffCount[2]}/${diffCount[3]}`)
  console.log(`答案分布 ${letters.map(([l, n]) => `${l}:${n}`).join(' ')} · topic 种类 ${topics.size}`)
  if (warns.length > 0) {
    console.log(`\n⚠️  警告 ${warns.length} 条:`)
    warns.forEach((w) => console.log('  -', w))
  }
  if (errs.length > 0) {
    console.log(`\n❌ 错误 ${errs.length} 条:`)
    errs.forEach((e) => console.log('  -', e))
    process.exit(1)
  }
  console.log('\n✅ ALL CHECKS PASSED' + (warns.length > 0 ? '（含警告，请酌情优化）' : ''))
}

void main()
