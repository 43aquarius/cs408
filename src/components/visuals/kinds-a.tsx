'use client'

import * as React from 'react'
import type { CwndSpec, PipelineSpec, SortFrame, TreeStep } from '@/data/types'
import { cn } from '@/lib/utils'

/* ================= 数组过程动画（排序 / 顺序表操作） ================= */

export function SortVisual({ frames, step }: { frames: SortFrame[]; step: number }) {
  const f = frames[Math.min(step, frames.length - 1)]
  if (!f) return null
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-end justify-center gap-1.5">
        {f.arr.map((v, i) => {
          const isPivot = f.pivot === i
          const isCompared = f.compared?.includes(i)
          const isSettled = f.settled?.includes(i)
          const inRange = f.range ? i >= f.range[0] && i <= f.range[1] : true
          return (
            <div key={i} className="flex w-11 flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-lg border-2 font-mono text-sm font-bold transition-all duration-300',
                  isPivot
                    ? 'border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-300'
                    : isSettled
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                      : isCompared
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border bg-card text-foreground/80',
                )}
              >
                {v}
              </div>
              <div className={cn('h-1 w-full rounded-full', inRange ? 'bg-primary/60' : 'bg-transparent')} />
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border-2 border-amber-500 bg-amber-500/30" />基准</span>
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border-2 border-primary bg-primary/20" />比较中</span>
        <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded border-2 border-emerald-500 bg-emerald-500/20" />就位/交换</span>
        <span className="flex items-center gap-1"><i className="h-1 w-3 rounded-full bg-primary/60" />当前区间</span>
      </div>
    </div>
  )
}

/* ================= 树构造过程动画 ================= */

interface TreePos {
  x: number
  y: number
}

function layoutTree(nodes: TreeStep['nodes']): { pos: Record<string, TreePos>; w: number; h: number } {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const kids = new Map<string, string[]>()
  nodes.forEach((n) => {
    const p = n.parent && byId.has(n.parent) ? n.parent : ''
    const arr = kids.get(p) ?? []
    arr.push(n.id)
    kids.set(p, arr)
  })
  const pos: Record<string, TreePos> = {}
  const seen = new Set<string>()
  let leafX = 0
  const dfs = (id: string, depth: number): number => {
    if (seen.has(id)) return pos[id]?.x ?? 0
    seen.add(id)
    const children = kids.get(id) ?? []
    if (children.length === 0) {
      pos[id] = { x: leafX++, y: depth }
      return pos[id].x
    }
    const xs = children.map((c) => dfs(c, depth + 1))
    pos[id] = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: depth }
    return pos[id].x
  }
  ;(kids.get('') ?? []).forEach((r) => dfs(r, 0))
  const maxDepth = Math.max(0, ...Object.values(pos).map((p) => p.y))
  const maxX = Math.max(0, ...Object.values(pos).map((p) => p.x))
  const gapX = 68
  const gapY = 74
  return {
    pos: Object.fromEntries(
      Object.entries(pos).map(([k, v]) => [k, { x: v.x * gapX + 40, y: v.y * gapY + 36 }]),
    ),
    w: (maxX + 1) * gapX + 80,
    h: (maxDepth + 1) * gapY + 24,
  }
}

export function TreeVisual({ steps, step }: { steps: TreeStep[]; step: number }) {
  const st = steps[Math.min(step, steps.length - 1)]
  if (!st) return null
  const { pos, w, h } = layoutTree(st.nodes)
  const byId = new Map(st.nodes.map((n) => [n.id, n]))
  const hl = new Set(st.highlight ?? [])
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${Math.max(w, 120)} ${h}`}
        className="mx-auto h-auto w-full min-w-[280px] max-w-xl"
        role="img"
        aria-label="树构造过程图"
      >
        {st.nodes.map((n) => {
          if (!n.parent || !pos[n.parent]) return null
          const a = pos[n.parent]
          const b = pos[n.id]
          const active = hl.has(n.id) && hl.has(n.parent)
          return (
            <line
              key={`e-${n.id}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={active ? 'stroke-emerald-500' : 'stroke-border'}
              strokeWidth={active ? 2.5 : 1.5}
            />
          )
        })}
        {st.nodes.map((n) => {
          const p = pos[n.id]
          if (!p) return null
          const active = hl.has(n.id)
          return (
            <g key={n.id} className="transition-opacity duration-300">
              <circle
                cx={p.x}
                cy={p.y}
                r={22}
                className={cn(
                  'transition-all duration-300',
                  active
                    ? 'fill-emerald-500/25 stroke-emerald-500'
                    : 'fill-card stroke-border',
                )}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <text
                x={p.x}
                y={p.y + 4.5}
                textAnchor="middle"
                className={cn(
                  'font-mono text-[12px] font-bold',
                  active ? 'fill-emerald-600 dark:fill-emerald-300' : 'fill-foreground',
                )}
              >
                {n.label}
              </text>
              <title>{byId.get(n.id)?.label}</title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ================= TCP 拥塞窗口折线动画 ================= */

export function CwndVisual({ points, step }: { points: CwndSpec['points']; step: number }) {
  const W = 560
  const H = 240
  const pad = { l: 44, r: 18, t: 18, b: 34 }
  const maxR = Math.max(...points.map((p) => p.round), 1)
  const maxC = Math.max(...points.map((p) => p.cwnd), 1)
  const x = (r: number) => pad.l + (r / maxR) * (W - pad.l - pad.r)
  const y = (c: number) => H - pad.b - (c / (maxC * 1.15)) * (H - pad.t - pad.b)
  const cur = points[Math.min(step, points.length - 1)]
  const upto = points.slice(0, Math.min(step, points.length - 1) + 1)

  // ssthresh 分段虚线
  const segs: Array<{ x1: number; x2: number; y: number }> = []
  let curSs: number | null = null
  let segStart = 0
  points.forEach((p, i) => {
    const ss = p.ssthresh ?? curSs
    if (ss !== curSs && curSs !== null) {
      segs.push({ x1: x(segStart), x2: x(points[i - 1].round), y: y(curSs) })
      segStart = points[i - 1].round
    }
    curSs = ss
  })
  if (curSs !== null) segs.push({ x1: x(segStart), x2: x(maxR), y: y(curSs) })

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full min-w-[300px] max-w-xl" role="img" aria-label="拥塞窗口演化图">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const v = Math.round(maxC * 1.15 * t)
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="stroke-border" strokeWidth={1} />
              <text x={pad.l - 6} y={y(v) + 3.5} textAnchor="end" className="fill-muted-foreground font-mono text-[9px]">{v}</text>
            </g>
          )
        })}
        {segs.map((s, i) => (
          <line key={i} x1={s.x1} x2={s.x2} y1={s.y} y2={s.y} className="stroke-amber-500/70" strokeWidth={1.5} strokeDasharray="5 4" />
        ))}
        <text x={W - pad.r} y={y(maxC * 1.15 * 1) - 4} textAnchor="end" className="fill-amber-600 dark:fill-amber-400 font-mono text-[9px]">ssthresh</text>
        <polyline
          points={upto.map((p) => `${x(p.round)},${y(p.cwnd)}`).join(' ')}
          className="fill-none stroke-primary"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {points.map((p, i) => {
          const isCur = i === Math.min(step, points.length - 1)
          const past = i <= Math.min(step, points.length - 1)
          return (
            <circle
              key={i}
              cx={x(p.round)}
              cy={y(p.cwnd)}
              r={isCur ? 5 : 3}
              className={cn(
                isCur ? 'fill-primary stroke-background' : past ? 'fill-primary/70' : 'fill-border',
                isCur && p.event && 'fill-rose-500',
              )}
              strokeWidth={isCur ? 2 : 0}
            />
          )
        })}
        {cur?.event && (
          <text x={x(cur.round)} y={y(cur.cwnd) - 12} textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 font-mono text-[11px] font-bold">
            {cur.event}
          </text>
        )}
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} className="stroke-border" strokeWidth={1.5} />
        <text x={W / 2} y={H - 8} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">轮次（RTT）→</text>
        <text x={12} y={H / 2} textAnchor="middle" transform={`rotate(-90 12 ${H / 2})`} className="fill-muted-foreground font-mono text-[10px]">cwnd (MSS)</text>
      </svg>
    </div>
  )
}

/* ================= 指令流水线时空图 ================= */

const STAGE_COLORS = [
  'bg-emerald-500/80 text-white',
  'bg-emerald-700/80 text-white',
  'bg-teal-600/80 text-white',
  'bg-amber-500/90 text-white',
  'bg-rose-500/80 text-white',
  'bg-violet-500/80 text-white',
]

export function PipelineVisual({ spec, step }: { spec: PipelineSpec; step: number }) {
  const { stages, instrs } = spec
  const cycles = Math.max(...instrs.map((i) => i.delay + stages.length), stages.length)
  const cur = Math.min(step, instrs.length - 1)
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex">
          <div className="w-28 shrink-0" />
          {Array.from({ length: cycles }, (_, c) => (
            <div key={c} className="w-10 shrink-0 text-center font-mono text-[10px] text-muted-foreground">
              {c + 1}
            </div>
          ))}
        </div>
        {instrs.map((ins, r) => {
          const dim = r > cur
          return (
            <div key={r} className={cn('flex items-center transition-opacity duration-300', dim && 'opacity-30')}>
              <div
                className={cn(
                  'w-28 shrink-0 truncate pr-2 text-right font-mono text-[11px]',
                  r === cur ? 'font-bold text-primary' : 'text-muted-foreground',
                )}
              >
                {ins.name}
              </div>
              {Array.from({ length: cycles }, (_, c) => {
                const s = c - ins.delay
                const filled = s >= 0 && s < stages.length
                return (
                  <div key={c} className="w-10 shrink-0 px-0.5 py-0.5">
                    <div
                      className={cn(
                        'flex h-7 items-center justify-center rounded font-mono text-[9px] font-bold transition-colors duration-300',
                        filled ? STAGE_COLORS[s % STAGE_COLORS.length] : 'bg-muted/60 text-transparent',
                      )}
                    >
                      {filled ? stages[s] : '·'}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">横轴为时钟周期（拍），纵轴为指令按序发射</p>
      </div>
    </div>
  )
}
