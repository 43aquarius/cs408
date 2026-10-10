/**
 * 408 全真模拟卷校验脚本
 * 用法：bun scripts/verify-mocks.ts mock02
 * 校验：47 题结构 / 题号科目分值映射 / optionExplanations 完整性 / visual 规范 / 难度与答案分布
 */
import type { Question, VisualSpec } from '../src/data/types'
import { TEMPLATES } from '../src/data/templates'

const ROOT = process.cwd()
const name = process.argv[2]
if (!name || !/^mock\d{2}$/.test(name)) {
  console.error('用法: bun scripts/verify-mocks.ts mockNN（如 mock02）')
  process.exit(1)
}
const NN = name.slice(4)

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

const PLACEHOLDER_RE = /TODO|FIXME|待补充|此处省略|（略）|\(略\)|占位符|XXXX+|\?\?\?+/

function checkVisual(v: VisualSpec | undefined, where: string, errs: string[], warns: string[]): boolean {
  if (!v) return false
  const w = `${where} visual`
  if (!v.title || v.title.length < 2) errs.push(`${w}: 缺少 title`)
  switch (v.kind) {
    case 'sort': {
      if (!v.frames || v.frames.length < 2) errs.push(`${w}: sort 至少 2 帧`)
      v.frames?.forEach((f, i) => {
        if (!f.arr || f.arr.length === 0) errs.push(`${w}[${i}]: arr 为空`)
        if (!f.note || f.note.length < 4) errs.push(`${w}[${i}]: note 过短`)
        if (f.range && (f.range[0] < 0 || f.range[1] >= (f.arr?.length ?? 0)))
          errs.push(`${w}[${i}]: range 越界`)
      })
      break
    }
    case 'tree': {
      if (!v.steps || v.steps.length < 2) errs.push(`${w}: tree 至少 2 步`)
      v.steps?.forEach((s, i) => {
        if (!s.nodes || s.nodes.length === 0) errs.push(`${w}[${i}]: nodes 为空`)
        const ids = new Set(s.nodes.map((n) => n.id))
        if (ids.size !== s.nodes.length) errs.push(`${w}[${i}]: 节点 id 重复`)
        s.nodes.forEach((n) => {
          if (n.parent && !ids.has(n.parent)) errs.push(`${w}[${i}]: 节点 ${n.id} 的 parent ${n.parent} 不在本步 nodes 中`)
          if (!n.label || n.label.length > 6) warns.push(`${w}[${i}]: 节点 ${n.id} label 过长（>6 字）`)
        })
        if (!s.note || s.note.length < 4) errs.push(`${w}[${i}]: note 过短`)
      })
      break
    }
    case 'graph': {
      if (!v.nodes || v.nodes.length < 2) errs.push(`${w}: nodes 至少 2 个`)
      if (!v.steps || v.steps.length < 2) errs.push(`${w}: steps 至少 2 步`)
      const ids = new Set(v.nodes?.map((n) => n.id) ?? [])
      v.nodes?.forEach((n) => {
        if (n.x < 0 || n.x > 100 || n.y < 0 || n.y > 100) errs.push(`${w}: 节点 ${n.id} 坐标越界（0-100）`)
      })
      v.edges?.forEach((e) => {
        if (!ids.has(e.from) || !ids.has(e.to)) errs.push(`${w}: 边 ${e.from}-${e.to} 引用不存在的节点`)
      })
      v.steps?.forEach((s, i) => {
        s.activeEdges?.forEach((k) => {
          const [f, t] = k.split('-')
          if (!ids.has(f) || !ids.has(t)) errs.push(`${w}[${i}]: activeEdge ${k} 引用不存在的节点`)
        })
        if (!s.note || s.note.length < 4) errs.push(`${w}[${i}]: note 过短`)
      })
      break
    }
    case 'pages': {
      if (!v.accesses || v.accesses.length < 4) errs.push(`${w}: accesses 至少 4 项`)
      if (!v.frames || v.frames < 1 || v.frames > 8) errs.push(`${w}: frames 应为 1-8`)
      if (!['FIFO', 'LRU', 'CLOCK', 'OPT'].includes(v.algo)) errs.push(`${w}: algo 非法`)
      break
    }
    case 'cwnd': {
      if (!v.points || v.points.length < 4) errs.push(`${w}: points 至少 4 项`)
      v.points?.forEach((p, i) => {
        if (p.cwnd < 1) errs.push(`${w}[${i}]: cwnd 应 ≥1`)
        if (i > 0 && p.round <= v.points[i - 1].round) errs.push(`${w}[${i}]: round 必须递增`)
      })
      break
    }
    case 'pipeline': {
      if (!v.stages || v.stages.length < 2) errs.push(`${w}: stages 至少 2 段`)
      if (!v.instrs || v.instrs.length < 2) errs.push(`${w}: instrs 至少 2 条`)
      let prev = -1
      v.instrs?.forEach((ins, i) => {
        if (ins.delay < 0) errs.push(`${w}[${i}]: delay 应 ≥0`)
        if (ins.delay < prev) errs.push(`${w}[${i}]: delay 应按序不减（顺序发射）`)
        prev = ins.delay
      })
      break
    }
    case 'seq': {
      if (!v.actors || v.actors.length < 2 || v.actors.length > 4) errs.push(`${w}: actors 应为 2-4 个`)
      const names = new Set(v.actors ?? [])
      if (!v.messages || v.messages.length < 2) errs.push(`${w}: messages 至少 2 条`)
      v.messages?.forEach((m, i) => {
        if (!names.has(m.from) || !names.has(m.to)) errs.push(`${w}[${i}]: from/to 必须是 actors 之一`)
        if (!m.label) errs.push(`${w}[${i}]: 缺 label`)
      })
      break
    }
    case 'flow': {
      if (!v.nodes || v.nodes.length < 3) errs.push(`${w}: nodes 至少 3 个`)
      const ids = new Set(v.nodes?.map((n) => n.id) ?? [])
      v.nodes?.forEach((n) => {
        if (!['start', 'proc', 'cond', 'end'].includes(n.type)) errs.push(`${w}: 节点 ${n.id} type 非法`)
        if (n.label && n.label.split('\n').some((l) => l.length > 14)) warns.push(`${w}: 节点 ${n.id} label 行过长`)
      })
      v.edges?.forEach((e, i) => {
        if (!ids.has(e.from) || !ids.has(e.to)) errs.push(`${w}: 边[${i}] 引用不存在的节点`)
      })
      if (!v.nodes?.some((n) => n.type === 'start')) warns.push(`${w}: 缺少 start 节点`)
      break
    }
    default:
      errs.push(`${w}: 未知 kind`)
  }
  return true
}

async function main() {
  const errs: string[] = []
  const warns: string[] = []
  let c: Question[] = []
  let a: Question[] = []
  try {
    const cm = (await import(`${ROOT}/src/data/mocks/${name}-c.ts`)) as Record<string, Question[]>
    const am = (await import(`${ROOT}/src/data/mocks/${name}-a.ts`)) as Record<string, Question[]>
    c = cm[`${name}c`]
    a = am[`${name}a`]
  } catch (e) {
    console.error(`❌ 无法加载 ${name}:`, e instanceof Error ? e.message : e)
    process.exit(1)
  }
  const all = [...c, ...a].sort((x, y) => x.number - y.number)

  // 结构
  if (c.length !== 40) errs.push(`单选题应为 40 道，实际 ${c.length}`)
  if (a.length !== 7) errs.push(`综合题应为 7 道，实际 ${a.length}`)
  if (all.length !== 47) errs.push(`总题数应为 47，实际 ${all.length}`)
  for (let i = 1; i <= 47; i++) {
    if (!all.find((q) => q.number === i)) errs.push(`缺少卷面题号 ${i}`)
  }
  const ids = new Set(all.map((q) => q.id))
  if (ids.size !== all.length) errs.push('存在重复 id')

  let totalScore = 0
  let visualCount = 0
  const letterCount: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 }
  let diff1 = 0
  let diff3 = 0
  const topics = new Map<string, number>()

  all.forEach((q) => {
    const where = q.id
    const expectId = `${name}-${String(q.number).padStart(2, '0')}`
    if (q.id !== expectId) errs.push(`${where}: id 应为 ${expectId}`)
    if (q.year !== 0) errs.push(`${where}: year 应为 0`)
    if (q.source !== 'mock') errs.push(`${where}: source 应为 mock`)
    if (!q.origin || !q.origin.includes('模拟卷')) errs.push(`${where}: origin 应为「模拟卷（N）」形式`)
    if (q.subject !== SUBJECT_BY_NUMBER(q.number))
      errs.push(`${where}: 题号 ${q.number} 科目应为 ${SUBJECT_BY_NUMBER(q.number)}，实际 ${q.subject}`)
    if (!q.topic || q.topic.length > 8) warns.push(`${where}: topic「${q.topic}」为空或超 8 字`)
    topics.set(q.topic, (topics.get(q.topic) ?? 0) + 1)
    if (PLACEHOLDER_RE.test(q.question) || PLACEHOLDER_RE.test(q.explanation))
      errs.push(`${where}: 检测到占位文本`)
    totalScore += q.score
    if (q.difficulty === 1) diff1++
    if (q.difficulty === 3) diff3++

    if (q.type === 'single') {
      if (!q.options || q.options.length !== 4) errs.push(`${where}: 选项应恰好 4 项`)
      if (!q.answer || !'ABCD'.includes(q.answer)) errs.push(`${where}: answer 非法`)
      else letterCount[q.answer]++
      if (q.score !== 2) errs.push(`${where}: 单选 score 应为 2`)
      const oes = q.optionExplanations
      if (!oes || oes.length !== 4) {
        errs.push(`${where}: 缺少 optionExplanations（核心要求）`)
      } else {
        oes.forEach((e, i) => {
          if (!e || e.length < 25)
            errs.push(`${where}: 选项 ${'ABCD'[i]} 讲解不足 25 字（当前 ${e?.length ?? 0} 字）`)
        })
        const sum = oes.reduce((s, e) => s + (e?.length ?? 0), 0)
        if (sum < 160) errs.push(`${where}: 四项讲解合计 ${sum} 字 < 160 字`)
      }
      if (!q.explanation || q.explanation.length < 40)
        errs.push(`${where}: explanation 过短（<40 字）`)
    } else {
      if (q.options || q.answer) errs.push(`${where}: 综合题不应有 options/answer`)
      if (!q.answerText || q.answerText.length < 80) errs.push(`${where}: answerText 过短（<80 字）`)
      if (!q.explanation || q.explanation.length < 40) errs.push(`${where}: explanation 过短`)
      if (!/\(\d+分\)|（\d+分）/.test(q.question))
        warns.push(`${where}: 综合题题干未标注小问分值`)
    }
    if (checkVisual(q.visual, where, errs, warns)) visualCount++
    // templateId 必须在注册表且学科匹配
    if (q.templateId) {
      if (!TEMPLATES[q.templateId]) errs.push(`${where}: templateId '${q.templateId}' 不在模板注册表`)
      else if (TEMPLATES[q.templateId].subject !== q.subject)
        errs.push(`${where}: templateId '${q.templateId}' 学科不匹配（模板属 ${TEMPLATES[q.templateId].subject}）`)
    }
  })

  // 综合题分值分组
  const sumOf = (ns: number[]) =>
    all.filter((q) => ns.includes(q.number)).reduce((s, q) => s + q.score, 0)
  if (sumOf([41, 42]) !== 23) errs.push(`41+42 分值合计 ${sumOf([41, 42])} ≠ 23`)
  if (sumOf([43, 44]) !== 23) errs.push(`43+44 分值合计 ${sumOf([43, 44])} ≠ 23`)
  if (sumOf([45, 46]) !== 15) errs.push(`45+46 分值合计 ${sumOf([45, 46])} ≠ 15`)
  if (sumOf([47]) !== 9) errs.push(`47 分值 ${sumOf([47])} ≠ 9`)
  if (totalScore !== 150) errs.push(`全卷分值合计 ${totalScore} ≠ 150`)

  // 动画与分布
  if (visualCount < 6) errs.push(`visual 动画仅 ${visualCount} 个 < 6（四科需均有分布）`)
  const visualSubjects = new Set(all.filter((q) => q.visual).map((q) => q.subject))
  if (visualCount >= 6 && visualSubjects.size < 4)
    warns.push(`visual 仅覆盖 ${[...visualSubjects].join(',')}，建议四科均有`)
  if (diff3 < 12) warns.push(`难度 3 仅 ${diff3} 题（建议 ≥12）`)
  if (diff1 < 10) warns.push(`难度 1 仅 ${diff1} 题（建议 ≥10）`)
  const letters = Object.entries(letterCount)
  letters.forEach(([l, n]) => {
    if (n > 15) warns.push(`答案 ${l} 出现 ${n} 次，过于集中`)
    if (n < 4) warns.push(`答案 ${l} 仅 ${n} 次`)
  })
  topics.forEach((n, t) => {
    if (n >= 3) warns.push(`topic「${t}」出现 ${n} 次，注意同卷内多样性`)
  })

  console.log(`\n===== ${name} 校验结果 =====`)
  console.log(`题数: ${all.length}（单选 ${c.length} + 综合 ${a.length}） · 总分 ${totalScore}`)
  console.log(`动画: ${visualCount} 个 · 难度1/3: ${diff1}/${diff3} · 答案分布 ${letters.map(([l, n]) => `${l}:${n}`).join(' ')}`)
  if (warns.length > 0) {
    console.log(`\n⚠️  警告 ${warns.length} 条:`)
    warns.forEach((w) => console.log('  -', w))
  }
  if (errs.length > 0) {
    console.log(`\n❌ 错误 ${errs.length} 条:`)
    errs.forEach((e) => console.log('  -', e))
    process.exit(1)
  }
  if (warns.length === 0) console.log('\n✅ ALL CHECKS PASSED')
  else console.log('\n✅ ALL CHECKS PASSED（含警告，请酌情优化）')
}

void main()
