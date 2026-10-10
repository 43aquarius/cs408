import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

/**
 * 云同步：客户端上传本地进度（records / daily / exams / favorites），
 * 服务端逐字段合并后返回全量结果，客户端以返回值替换本地。
 *
 * 合并规则（与本地记录语义一致）：
 * - records：按题号取 lastAt 更新的一条
 * - daily：同一日期取更大的计数
 * - exams：按 id 取 ts 更新的一条
 * - favorites：按题号逐条合并——fav 取 ts 更新的一方，note 取 noteAt 更新的一方
 * - force=true 时整体覆盖（用于「清空数据」）
 */

const QRecord = z.object({
  attempts: z.number().int().nonnegative(),
  correct: z.number().int().nonnegative(),
  wrong: z.number().int().nonnegative(),
  lastResult: z.enum(['correct', 'wrong', 'mastered', 'unmastered']),
  lastAt: z.number(),
})

const ExamRecord = z.object({
  id: z.string(),
  ts: z.number(),
  label: z.string(),
  total: z.number(),
  correct: z.number(),
  score: z.number().optional(),
  scoreMax: z.number().optional(),
  durationSec: z.number(),
  perSubject: z.record(z.string(), z.object({ c: z.number(), t: z.number() })).optional(),
})

const FavEntry = z.object({
  fav: z.boolean(),
  ts: z.number(),
  note: z.string().max(4000),
  noteAt: z.number(),
})

const Body = z.object({
  records: z.record(z.string(), QRecord),
  daily: z.record(z.string(), z.number()),
  exams: z.array(ExamRecord),
  favorites: z.record(z.string(), FavEntry).optional().default({}),
  force: z.boolean().optional(),
})

function mergeRecords(
  a: Record<string, z.infer<typeof QRecord>>,
  b: Record<string, z.infer<typeof QRecord>>,
) {
  const out: Record<string, z.infer<typeof QRecord>> = { ...a }
  for (const [k, v] of Object.entries(b)) {
    const prev = out[k]
    if (!prev || v.lastAt >= prev.lastAt) out[k] = v
  }
  return out
}

function mergeDaily(a: Record<string, number>, b: Record<string, number>) {
  const out: Record<string, number> = { ...a }
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v)
  return out
}

function mergeExams(a: z.infer<typeof ExamRecord>[], b: z.infer<typeof ExamRecord>[]) {
  const map = new Map<string, z.infer<typeof ExamRecord>>()
  for (const e of [...a, ...b]) {
    const prev = map.get(e.id)
    if (!prev || e.ts >= prev.ts) map.set(e.id, e)
  }
  return [...map.values()].sort((x, y) => x.ts - y.ts).slice(-200)
}

function mergeFavorites(
  a: Record<string, z.infer<typeof FavEntry>>,
  b: Record<string, z.infer<typeof FavEntry>>,
) {
  const out: Record<string, z.infer<typeof FavEntry>> = { ...a }
  for (const [k, v] of Object.entries(b)) {
    const prev = out[k]
    if (!prev) {
      out[k] = v
      continue
    }
    // 收藏状态：以更晚的切换为准；备注：以更晚的编辑为准（两条独立时间线）
    const favFrom = v.ts >= prev.ts ? v : prev
    const noteFrom = v.noteAt >= prev.noteAt ? v : prev
    out[k] = {
      fav: favFrom.fav,
      ts: Math.max(v.ts, prev.ts),
      note: noteFrom.note,
      noteAt: Math.max(v.noteAt, prev.noteAt),
    }
  }
  return out
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })
  try {
    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: '数据格式不合法' }, { status: 400 })
    }
    const { records, daily, exams, favorites, force } = parsed.data
    const existing = await db.syncState.findUnique({ where: { userId: user.id } })

    let nextRecords = records
    let nextDaily = daily
    let nextExams = exams
    let nextFavorites = favorites
    if (!force && existing) {
      const prev = {
        records: JSON.parse(existing.records || '{}') as Record<string, z.infer<typeof QRecord>>,
        daily: JSON.parse(existing.daily || '{}') as Record<string, number>,
        exams: JSON.parse(existing.exams || '[]') as z.infer<typeof ExamRecord>[],
        favorites: JSON.parse(existing.favorites || '{}') as Record<
          string,
          z.infer<typeof FavEntry>
        >,
      }
      nextRecords = mergeRecords(prev.records, records)
      nextDaily = mergeDaily(prev.daily, daily)
      nextExams = mergeExams(prev.exams, exams)
      nextFavorites = mergeFavorites(prev.favorites, favorites)
    }

    await db.syncState.upsert({
      where: { userId: user.id },
      update: {
        records: JSON.stringify(nextRecords),
        daily: JSON.stringify(nextDaily),
        exams: JSON.stringify(nextExams),
        favorites: JSON.stringify(nextFavorites),
      },
      create: {
        userId: user.id,
        records: JSON.stringify(nextRecords),
        daily: JSON.stringify(nextDaily),
        exams: JSON.stringify(nextExams),
        favorites: JSON.stringify(nextFavorites),
      },
    })

    return NextResponse.json({
      records: nextRecords,
      daily: nextDaily,
      exams: nextExams,
      favorites: nextFavorites,
      syncedAt: Date.now(),
    })
  } catch (e) {
    console.error('[sync]', e)
    return NextResponse.json({ error: '同步失败，请稍后重试' }, { status: 500 })
  }
}

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })
  const s = await db.syncState.findUnique({ where: { userId: user.id } })
  return NextResponse.json({
    records: s ? JSON.parse(s.records || '{}') : {},
    daily: s ? JSON.parse(s.daily || '{}') : {},
    exams: s ? JSON.parse(s.exams || '[]') : [],
    favorites: s ? JSON.parse(s.favorites || '{}') : {},
    syncedAt: s?.updatedAt ? new Date(s.updatedAt).getTime() : 0,
  })
}
