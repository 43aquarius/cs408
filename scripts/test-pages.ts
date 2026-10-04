import { simulatePages } from '../src/components/visuals/pages-sim'
const acc = ['1','2','3','4','1','2','5','1','2','3','4','5']
for (const n of [3,4]) {
  const steps = simulatePages({ kind:'pages', title:'t', algo:'FIFO', frames:n, accesses:acc })
  const faults = steps.filter(s=>!s.hit).length
  console.log(`FIFO ${n}帧 缺页=${faults}（期望 ${n===3?9:10}）`)
}
// LRU 经典：4,3,2,1,4,3,5,4,3,2,1,5 → 10 次缺页（本站2020真题口径）
const lru = simulatePages({ kind:'pages', title:'t', algo:'LRU', frames:3, accesses:['4','3','2','1','4','3','5','4','3','2','1','5'] })
console.log('LRU 3帧 缺页=', lru.filter(s=>!s.hit).length, '（期望 10）')
// CLOCK: 2019真题口径 序列 2,3,2,1,5,2,4,5,3,2,5,2 (3帧) — 检验运行无死循环
const clock = simulatePages({ kind:'pages', title:'t', algo:'CLOCK', frames:3, accesses:['2','3','2','1','5','2','4','5','3','2','5','2'] })
console.log('CLOCK 3帧 缺页=', clock.filter(s=>!s.hit).length, clock.map(s=>s.frames.join(',')).slice(0,6).join(' | '))
