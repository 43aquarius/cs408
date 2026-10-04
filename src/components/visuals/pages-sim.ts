import type { PagesSpec } from '@/data/types'

export interface PagesStep {
  access: string
  hit: boolean
  /** 本步结束后各页框内容 */
  frames: Array<string | null>
  evicted?: string
  note: string
}

/**
 * 页面置换模拟器：FIFO / LRU / CLOCK（最近未用+访问位）/ OPT（最佳置换）。
 * 纯函数，供 PagesVisual 渲染逐步动画。
 */
export function simulatePages(spec: PagesSpec): PagesStep[] {
  const { algo, frames: n, accesses } = spec
  const cur: Array<string | null> = Array(n).fill(null)
  const steps: PagesStep[] = []
  const loadOrder: string[] = [] // FIFO 调入顺序
  const lastUse: Record<string, number> = {} // LRU 最近访问时间
  const refBit: Record<string, number> = {} // CLOCK 访问位
  let pointer = 0 // CLOCK 指针

  accesses.forEach((p, i) => {
    if (cur.includes(p)) {
      if (algo === 'LRU') lastUse[p] = i
      if (algo === 'CLOCK') refBit[p] = 1
      steps.push({
        access: p,
        hit: true,
        frames: [...cur],
        note: `访问 ${p}：命中（${algo === 'CLOCK' ? '访问位置 1' : '无需置换'}）`,
      })
      return
    }

    let slot = cur.indexOf(null)
    let evicted: string | undefined
    let why = '装入空闲页框'

    if (slot < 0) {
      if (algo === 'FIFO') {
        const victim = loadOrder.shift()
        if (victim !== undefined) {
          slot = cur.indexOf(victim)
          evicted = victim
          why = `淘汰 ${victim}（最早调入）`
        }
      } else if (algo === 'LRU') {
        let best = Infinity
        let bestIdx = 0
        cur.forEach((pg, j) => {
          if (pg !== null && (lastUse[pg] ?? -1) < best) {
            best = lastUse[pg] ?? -1
            bestIdx = j
          }
        })
        slot = bestIdx
        evicted = cur[slot] ?? undefined
        why = `淘汰 ${evicted}（最久未访问）`
      } else if (algo === 'CLOCK') {
        // 扫描：访问位 1 → 清零前移；访问位 0 → 淘汰
        for (let scan = 0; scan < 2 * n + 1; scan++) {
          const pg = cur[pointer]
          if (pg !== null && refBit[pg]) {
            refBit[pg] = 0
            pointer = (pointer + 1) % n
          } else {
            slot = pointer
            evicted = pg ?? undefined
            pointer = (pointer + 1) % n
            break
          }
        }
        why = `淘汰 ${evicted}（循环扫描到访问位 0）`
      } else {
        // OPT：未来最久不再使用
        let farthest = -1
        let bestIdx = 0
        cur.forEach((pg, j) => {
          if (pg === null) return
          let next = Infinity
          for (let k = i + 1; k < accesses.length; k++) {
            if (accesses[k] === pg) {
              next = k
              break
            }
          }
          if (next > farthest) {
            farthest = next
            bestIdx = j
          }
        })
        slot = bestIdx
        evicted = cur[slot] ?? undefined
        why = `淘汰 ${evicted}（此后最久不会用到${farthest === Infinity ? '，不再访问' : ''}）`
      }
    }

    if (evicted !== undefined) delete refBit[evicted]
    cur[slot] = p
    loadOrder.push(p)
    lastUse[p] = i
    refBit[p] = 1

    steps.push({
      access: p,
      hit: false,
      frames: [...cur],
      evicted,
      note: `访问 ${p}：缺页，${why}`,
    })
  })

  return steps
}
