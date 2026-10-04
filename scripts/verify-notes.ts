/**
 * 经验笔记数据校验脚本
 * 用法：
 *   bun scripts/verify-notes.ts src/data/notes/ds.ts   # 校验单个类别文件
 *   bun scripts/verify-notes.ts                        # 校验全部（经 index 装配）
 */
import type { NoteCategory, NoteBlock } from '../src/data/notes/types'

interface Issue {
  where: string
  msg: string
}

function checkRichText(s: string): string[] {
  const errs: string[] = []
  const boldCount = (s.match(/\*\*/g) ?? []).length
  if (boldCount % 2 !== 0) errs.push('`**` 加粗标记不成对')
  const codeCount = (s.match(/`/g) ?? []).length
  if (codeCount % 2 !== 0) errs.push('反引号 `行内代码` 标记不成对')
  if (s.includes('TODO') || s.includes('占位')) errs.push('包含占位文本')
  if (s.trim() === '') errs.push('空字符串')
  return errs
}

function checkBlock(where: string, b: NoteBlock, issues: Issue[]): void {
  const push = (msg: string) => issues.push({ where, msg })
  switch (b.kind) {
    case 'p':
      checkRichText(b.text).forEach(push)
      break
    case 'h':
      if (!b.text.trim()) push('子标题为空')
      break
    case 'list':
      if (!b.items.length) push('列表为空')
      b.items.forEach((it, i) => checkRichText(it).forEach((e) => push(`items[${i}] ${e}`)))
      break
    case 'code':
      if (!b.text.trim()) push('代码块为空')
      break
    case 'table':
      if (!b.head.length) push('表头为空')
      if (!b.rows.length) push('表格无数据行')
      b.rows.forEach((row, i) => {
        if (row.length !== b.head.length)
          push(`第 ${i + 1} 行列数(${row.length})与表头(${b.head.length})不一致`)
        row.forEach((c) => checkRichText(c).forEach((e) => push(`rows[${i}] ${e}`)))
      })
      break
    case 'callout':
      if (!['tip', 'warn', 'key'].includes(b.tone)) push(`非法 tone: ${b.tone}`)
      checkRichText(b.text).forEach(push)
      break
    case 'steps':
      if (!b.items.length) push('步骤为空')
      b.items.forEach((it, i) => checkRichText(it).forEach((e) => push(`steps[${i}] ${e}`)))
      break
    case 'kv':
      if (!b.items.length) push('要点卡为空')
      b.items.forEach((it, i) => {
        if (!it.k.trim()) push(`kv[${i}] k 为空`)
        checkRichText(it.v).forEach((e) => push(`kv[${i}] ${e}`))
      })
      break
    default:
      push(`未知块类型: ${(b as { kind: string }).kind}`)
  }
}

function checkCategory(cat: NoteCategory, issues: Issue[], allIds: Set<string>): void {
  const p = (msg: string) => issues.push({ where: `[${cat.id}]`, msg })
  if (!cat.id.trim()) p('id 为空')
  if (!cat.title.trim()) p('title 为空')
  if (!cat.chapters.length) p('无章节')
  cat.chapters.forEach((ch) => {
    const cp = (msg: string) => issues.push({ where: `[${cat.id}/${ch.id}]`, msg })
    if (!ch.id.trim()) cp('id 为空')
    if (allIds.has(ch.id)) cp(`章节 id 重复: ${ch.id}`)
    allIds.add(ch.id)
    if (!ch.title.trim()) cp('title 为空')
    if (ch.brief.trim().length < 10) cp('brief 过短（<10 字）')
    if (ch.minutes < 3 || ch.minutes > 40) cp(`minutes 异常: ${ch.minutes}`)
    if (ch.blocks.length < 4) cp(`内容块过少（${ch.blocks.length} < 4）`)
    ch.blocks.forEach((b, i) => checkBlock(`${cat.id}/${ch.id}#block${i}`, b, issues))
  })
}

async function main() {
  const args = process.argv.slice(2)
  const issues: Issue[] = []
  const allIds = new Set<string>()
  let cats: NoteCategory[] = []

  if (args[0]) {
    const mod = await import(args[0].replace(/^src\//, '/home/z/my-project/src/').replace(/\.ts$/, ''))
    const cat: NoteCategory | undefined = Object.values(mod).find(
      (v) => typeof v === 'object' && v !== null && 'chapters' in (v as object),
    ) as NoteCategory | undefined
    if (!cat) {
      console.error(`✗ ${args[0]} 未找到 NoteCategory 导出`)
      process.exit(1)
    }
    cats = [cat]
  } else {
    const { NOTE_CATEGORIES } = await import('../src/data/notes/index')
    cats = NOTE_CATEGORIES
  }

  cats.forEach((c) => checkCategory(c, issues, allIds))

  // 汇总
  const totalChapters = cats.reduce((s, c) => s + c.chapters.length, 0)
  const totalBlocks = cats.reduce(
    (s, c) => s + c.chapters.reduce((x, ch) => x + ch.blocks.length, 0),
    0,
  )
  console.log(`类别 ${cats.length} 个 · 章节 ${totalChapters} 章 · 内容块 ${totalBlocks} 个`)

  if (issues.length) {
    console.error(`\n✗ 发现 ${issues.length} 个问题：`)
    issues.forEach((i) => console.error(`  - ${i.where} ${i.msg}`))
    process.exit(1)
  }
  console.log('✓ ALL CHECKS PASSED')
}

main()
