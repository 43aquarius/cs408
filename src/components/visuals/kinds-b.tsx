'use client'

import * as React from 'react'
import type { FlowSpec, GraphSpec, SeqSpec } from '@/data/types'
import { simulatePages } from './pages-sim'
import { cn } from '@/lib/utils'

/* ================= 带权图算法动画 ================= */

export function GraphVisual({ spec, step }: { spec: GraphSpec; step: number }) {
  const uid = React.useId()
  const W = 640
  const H = 420
  const px = (x: number) => 44 + (x / 100) * (W - 88)
  const py = (y: number) => 40 + (y / 100) * (H - 80)
  const st = spec.steps[Math.min(step, spec.steps.length - 1)]
  const activeEdges = new Set(st?.activeEdges ?? [])
  const activeNodes = new Set(st?.activeNodes ?? [])
  const byId = new Map(spec.nodes.map((n) => [n.id, n]))

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto h-auto w-full min-w-[300px] max-w-2xl"
        role="img"
        aria-label="图算法过程图"
      >
        <defs>
          <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" className="fill-current" />
          </marker>
        </defs>
        {spec.edges.map((e, i) => {
          const a = byId.get(e.from)
          const b = byId.get(e.to)
          if (!a || !b) return null
          const key = `${e.from}-${e.to}`
          const active = activeEdges.has(key)
          const x1 = px(a.x)
          const y1 = py(a.y)
          const x2 = px(b.x)
          const y2 = py(b.y)
          const dx = x2 - x1
          const dy = y2 - y1
          const len = Math.hypot(dx, dy) || 1
          // 两端缩进到圆边
          const r = 20
          const sx = x1 + (dx / len) * r
          const sy = y1 + (dy / len) * r
          const tx = x2 - (dx / len) * r
          const ty = y2 - (dy / len) * r
          return (
            <g key={i} className="transition-all duration-300">
              <line
                x1={sx}
                y1={sy}
                x2={tx}
                y2={ty}
                markerEnd={e.directed ? `url(#${uid}-arrow)` : undefined}
                className={cn(
                  'transition-all duration-300',
                  active ? 'stroke-emerald-500' : 'stroke-border',
                  active ? '' : 'opacity-80',
                )}
                strokeWidth={active ? 3.5 : 1.6}
              />
              {e.w !== undefined && (
                <g>
                  <rect
                    x={(sx + tx) / 2 - 11}
                    y={(sy + ty) / 2 - 9}
                    width={22}
                    height={16}
                    rx={4}
                    className={cn('transition-all duration-300', active ? 'fill-emerald-500/25' : 'fill-card')}
                  />
                  <text
                    x={(sx + tx) / 2}
                    y={(sy + ty) / 2 + 3}
                    textAnchor="middle"
                    className={cn(
                      'font-mono text-[10px] font-bold',
                      active ? 'fill-emerald-600 dark:fill-emerald-300' : 'fill-muted-foreground',
                    )}
                  >
                    {e.w}
                  </text>
                </g>
              )}
            </g>
          )
        })}
        {spec.nodes.map((n) => {
          const active = activeNodes.has(n.id)
          const label = st?.labels?.[n.id]
          return (
            <g key={n.id} className="transition-all duration-300">
              <circle
                cx={px(n.x)}
                cy={py(n.y)}
                r={20}
                strokeWidth={active ? 3 : 1.8}
                className={cn(
                  'transition-all duration-300',
                  active ? 'fill-emerald-500/25 stroke-emerald-500' : 'fill-card stroke-border',
                )}
              />
              <text
                x={px(n.x)}
                y={py(n.y) + 4.5}
                textAnchor="middle"
                className={cn(
                  'font-mono text-[12px] font-bold',
                  active ? 'fill-emerald-600 dark:fill-emerald-300' : 'fill-foreground',
                )}
              >
                {n.id}
              </text>
              {label && (
                <text
                  x={px(n.x)}
                  y={py(n.y) + 36}
                  textAnchor="middle"
                  className="fill-primary font-mono text-[10px] font-bold"
                >
                  {label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ================= 页面置换动画 ================= */

export function PagesVisual({ spec, step }: { spec: Parameters<typeof simulatePages>[0]; step: number }) {
  const steps = React.useMemo(() => simulatePages(spec), [spec])
  const cur = Math.min(step, steps.length - 1)
  const faults = steps.slice(0, cur + 1).filter((s) => !s.hit).length
  const n = spec.frames
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* 访问序列 */}
          <div className="flex">
            <div className="w-14 shrink-0" />
            {steps.map((s, i) => (
              <div key={i} className="w-11 shrink-0 px-0.5 text-center">
                <div
                  className={cn(
                    'rounded-md py-1 font-mono text-xs font-bold transition-all duration-300',
                    i === cur
                      ? s.hit
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                      : i < cur
                        ? s.hit
                          ? 'bg-emerald-500/25 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                        : 'bg-muted text-muted-foreground/60',
                  )}
                >
                  {s.access}
                </div>
                <div className={cn('mt-0.5 font-mono text-[9px]', s.hit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500')}>
                  {i <= cur ? (s.hit ? '命中' : '缺页') : ''}
                </div>
              </div>
            ))}
          </div>
          {/* 页框 */}
          {Array.from({ length: n }, (_, f) => (
            <div key={f} className="flex items-center">
              <div className="w-14 shrink-0 pr-1 text-right font-mono text-[10px] text-muted-foreground">页框{f + 1}</div>
              {steps.map((s, i) => {
                const val = s.frames[f]
                const changed = i <= cur && !s.hit && val !== null && steps[i - 1]?.frames[f] !== val
                return (
                  <div key={i} className="w-11 shrink-0 px-0.5 py-0.5">
                    <div
                      className={cn(
                        'flex h-8 items-center justify-center rounded-md border font-mono text-xs font-bold transition-all duration-300',
                        changed
                          ? 'border-emerald-500 bg-emerald-500/25 text-emerald-700 dark:text-emerald-300'
                          : val !== null && i <= cur
                            ? 'border-border bg-card text-foreground/85'
                            : 'border-dashed border-border/60 text-transparent',
                        i > cur && 'opacity-30',
                      )}
                    >
                      {val ?? '-'}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground">
        {spec.algo} · {n} 页框 · 前 {cur + 1} 次访问缺页 <b className="text-rose-600 dark:text-rose-400">{faults}</b> 次
        （缺页率 {Math.round((faults / (cur + 1)) * 100)}%）
      </p>
    </div>
  )
}

/* ================= 协议时序图动画 ================= */

export function SeqVisual({ spec, step }: { spec: SeqSpec; step: number }) {
  const uid = React.useId()
  const W = 620
  const rowH = 46
  const top = 64
  const H = top + spec.messages.length * rowH + 24
  const xs = spec.actors.map((_, i) => (W * (i + 1)) / (spec.actors.length + 1))
  const cur = Math.min(step, spec.messages.length - 1)
  const ai = (name: string) => spec.actors.indexOf(name)

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full min-w-[300px] max-w-xl" role="img" aria-label="协议交互时序图">
        <defs>
          <marker id={`${uid}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" className="fill-current" />
          </marker>
        </defs>
        {spec.actors.map((a, i) => (
          <g key={a}>
            <rect x={xs[i] - 46} y={12} width={92} height={32} rx={8} className="fill-primary/15 stroke-primary/60" strokeWidth={1.5} />
            <text x={xs[i]} y={33} textAnchor="middle" className="fill-primary font-mono text-[12px] font-bold">{a}</text>
            <line x1={xs[i]} x2={xs[i]} y1={44} y2={H - 10} className="stroke-border" strokeWidth={1.2} strokeDasharray="4 4" />
          </g>
        ))}
        {spec.messages.map((m, k) => {
          const from = ai(m.from)
          const to = ai(m.to)
          if (from < 0 || to < 0) return null
          const y = top + k * rowH
          const x1 = xs[from]
          const x2 = xs[to]
          const shown = k <= cur
          const isCur = k === cur
          return (
            <g key={k} className="transition-opacity duration-300" opacity={shown ? 1 : 0.12}>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                markerEnd={`url(#${uid}-a)`}
                className={cn(
                  isCur ? 'stroke-emerald-500' : 'stroke-foreground/60',
                  m.from === m.to && 'invisible',
                )}
                strokeWidth={isCur ? 2.5 : 1.6}
              />
              <rect
                x={(x1 + x2) / 2 - Math.min(m.label.length * 6.2 + 10, 250)}
                y={y - 19}
                width={Math.min(m.label.length * 12.4 + 20, 500)}
                height={16}
                rx={4}
                className={cn(isCur ? 'fill-emerald-500/20' : 'fill-muted/70')}
              />
              <text
                x={(x1 + x2) / 2}
                y={y - 7}
                textAnchor="middle"
                className={cn(
                  'font-mono text-[10px] font-bold',
                  isCur ? 'fill-emerald-700 dark:fill-emerald-300' : 'fill-foreground/80',
                )}
              >
                {m.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ================= 流程图（静态） ================= */

export function FlowVisual({ spec }: { spec: FlowSpec }) {
  const byId = new Map(spec.nodes.map((n) => [n.id, n]))
  const incoming = new Set(spec.edges.map((e) => e.to))
  // BFS 分层：入口 = start 节点或无入边节点
  const starts = spec.nodes.filter((n) => n.type === 'start' || !incoming.has(n.id)).map((n) => n.id)
  const level: Record<string, number> = {}
  const queue: Array<{ id: string; lv: number }> = [...new Set(starts)].map((id) => ({ id, lv: 0 }))
  queue.forEach((q) => (level[q.id] = 0))
  while (queue.length > 0) {
    const { id, lv } = queue.shift()!
    spec.edges
      .filter((e) => e.from === id)
      .forEach((e) => {
        if (level[e.to] === undefined) {
          level[e.to] = lv + 1
          queue.push({ id: e.to, lv: lv + 1 })
        }
      })
  }
  // 未触达节点放到最后一层
  const maxLv = Math.max(0, ...Object.values(level))
  spec.nodes.forEach((n) => {
    if (level[n.id] === undefined) level[n.id] = maxLv + 1
  })
  const totalLv = Math.max(...Object.values(level)) + 1

  const W = 680
  const H = totalLv * 104 + 30
  const rows: Record<number, string[]> = {}
  spec.nodes.forEach((n) => {
    const lv = level[n.id] ?? 0
    ;(rows[lv] ??= []).push(n.id)
  })
  const pos: Record<string, { x: number; y: number }> = {}
  Object.entries(rows).forEach(([lv, ids]) => {
    ids.forEach((id, i) => {
      pos[id] = { x: (W * (i + 1)) / (ids.length + 1), y: Number(lv) * 104 + 56 }
    })
  })

  const lineOf = (t: string): string[] => t.split('\n')

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full min-w-[300px] max-w-2xl" role="img" aria-label="流程图">
        <defs>
          <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" className="fill-current" />
          </marker>
        </defs>
        {spec.edges.map((e, i) => {
          const a = pos[e.from]
          const b = pos[e.to]
          if (!a || !b) return null
          const down = b.y > a.y
          const x1 = down ? a.x : a.x + 76
          const y1 = down ? a.y + 26 : a.y
          const x2 = b.x
          const y2 = down ? b.y - 28 : b.y
          const mx = (x1 + x2) / 2
          const my = (y1 + y2) / 2
          const d = down
            ? `M ${x1} ${y1} L ${x2} ${y2}`
            : `M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 + 60} ${y2}, ${x2} ${y2}`
          return (
            <g key={i}>
              <path d={d} markerEnd="url(#flow-arrow)" className="stroke-foreground/50" strokeWidth={1.6} fill="none" />
              {e.label && (
                <g>
                  <rect x={mx - e.label.length * 5.6 - 4} y={my - 9} width={e.label.length * 11.2 + 8} height={16} rx={4} className="fill-card stroke-border" />
                  <text x={mx} y={my + 3} textAnchor="middle" className="fill-foreground/80 font-mono text-[10px]">{e.label}</text>
                </g>
              )}
            </g>
          )
        })}
        {spec.nodes.map((n) => {
          const p = pos[n.id]
          if (!p) return null
          const lines = lineOf(n.label)
          if (n.type === 'cond') {
            const w = Math.max(46, Math.max(...lines.map((l) => l.length)) * 11 + 18)
            const h = 56
            return (
              <g key={n.id}>
                <polygon
                  points={`${p.x},${p.y - h / 2} ${p.x + w / 2},${p.y} ${p.x},${p.y + h / 2} ${p.x - w / 2},${p.y}`}
                  className="fill-amber-500/15 stroke-amber-500/80"
                  strokeWidth={1.8}
                />
                {lines.map((l, i) => (
                  <text key={i} x={p.x} y={p.y + (i - (lines.length - 1) / 2) * 13 + 4} textAnchor="middle" className="fill-foreground font-mono text-[11px] font-bold">
                    {l}
                  </text>
                ))}
              </g>
            )
          }
          const isEnd = n.type === 'end'
          const w = Math.max(84, Math.max(...lines.map((l) => l.length)) * 12 + 24)
          return (
            <g key={n.id}>
              <rect
                x={p.x - w / 2}
                y={p.y - 24}
                width={w}
                height={48}
                rx={n.type === 'start' || isEnd ? 24 : 10}
                className={cn(
                  n.type === 'start' || isEnd
                    ? 'fill-emerald-500/20 stroke-emerald-500'
                    : 'fill-card stroke-primary/50',
                )}
                strokeWidth={1.8}
              />
              {lines.map((l, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={p.y + (i - (lines.length - 1) / 2) * 14 + 4}
                  textAnchor="middle"
                  className={cn(
                    'font-mono text-[11px] font-bold',
                    n.type === 'start' || isEnd ? 'fill-emerald-700 dark:fill-emerald-300' : 'fill-foreground',
                  )}
                >
                  {l}
                </text>
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
