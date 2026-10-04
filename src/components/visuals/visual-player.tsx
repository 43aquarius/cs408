'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Clapperboard, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { CwndVisual, PipelineVisual, SortVisual, TreeVisual } from './kinds-a'
import { FlowVisual, GraphVisual, PagesVisual, SeqVisual } from './kinds-b'
import { simulatePages } from './pages-sim'
import type { PagesSpec, VisualSpec } from '@/data/types'
import { cn } from '@/lib/utils'

const KIND_LABEL: Record<VisualSpec['kind'], string> = {
  sort: '数组过程',
  tree: '树构造',
  graph: '图算法',
  pages: '页面置换',
  cwnd: '拥塞控制',
  pipeline: '流水线时空图',
  seq: '协议时序',
  flow: '流程图',
}

/** 各动画的总步数（flow 为静态图，无步进） */
function totalSteps(spec: VisualSpec): number {
  switch (spec.kind) {
    case 'sort':
      return spec.frames.length
    case 'tree':
      return spec.steps.length
    case 'graph':
      return spec.steps.length
    case 'pages':
      return spec.accesses.length
    case 'cwnd':
      return spec.points.length
    case 'pipeline':
      return spec.instrs.length
    case 'seq':
      return spec.messages.length
    case 'flow':
      return 0
  }
}

function stepNote(spec: VisualSpec, i: number): string {
  switch (spec.kind) {
    case 'sort':
      return spec.frames[i]?.note ?? ''
    case 'tree':
      return spec.steps[i]?.note ?? ''
    case 'graph':
      return spec.steps[i]?.note ?? ''
    case 'pages':
      return simulateNote(spec, i)
    case 'cwnd': {
      const p = spec.points[i]
      if (!p) return ''
      const ss = p.ssthresh !== undefined ? `，ssthresh=${p.ssthresh}` : ''
      const ev = p.event ? `（${p.event}）` : ''
      return `第 ${p.round} 轮：cwnd=${p.cwnd} MSS${ss}${ev}`
    }
    case 'pipeline': {
      const ins = spec.instrs[i]
      if (!ins) return ''
      return ins.note ?? `${ins.name} 于第 ${ins.delay + 1} 拍进入流水线`
    }
    case 'seq': {
      const m = spec.messages[i]
      return m ? `第 ${i + 1} 步：${m.from} → ${m.to}，${m.label}` : ''
    }
    default:
      return ''
  }
}

/* pages 的逐步说明需要先模拟（结果很小，代价可忽略） */
const pagesCache = new WeakMap<PagesSpec, ReturnType<typeof simulatePages>>()
function simulateNote(spec: PagesSpec, i: number): string {
  let steps = pagesCache.get(spec)
  if (!steps) {
    steps = simulatePages(spec)
    pagesCache.set(spec, steps)
  }
  return steps[i]?.note ?? ''
}

export function VisualPlayer({ spec }: { spec: VisualSpec }) {
  const total = totalSteps(spec)
  const [step, setStep] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)

  React.useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setStep((s) => {
        if (s >= total - 1) {
          setPlaying(false)
          return s
        }
        return s + 1
      })
    }, 1600)
    return () => clearInterval(t)
  }, [playing, total])

  const body = React.useMemo(() => {
    switch (spec.kind) {
      case 'sort':
        return <SortVisual frames={spec.frames} step={step} />
      case 'tree':
        return <TreeVisual steps={spec.steps} step={step} />
      case 'graph':
        return <GraphVisual spec={spec} step={step} />
      case 'pages':
        return <PagesVisual spec={spec} step={step} />
      case 'cwnd':
        return <CwndVisual points={spec.points} step={step} />
      case 'pipeline':
        return <PipelineVisual spec={spec} step={step} />
      case 'seq':
        return <SeqVisual spec={spec} step={step} />
      case 'flow':
        return <FlowVisual spec={spec} />
    }
  }, [spec, step])

  return (
    <div
      className="rounded-xl border border-primary/25 bg-gradient-to-b from-primary/[0.06] to-transparent p-4"
      data-visual={spec.kind}
    >
      <div className="mb-3 flex items-center gap-2">
        <Clapperboard className="h-4 w-4 text-primary" />
        <span className="font-mono text-xs font-bold text-primary">{spec.title}</span>
        <span className="rounded-full border border-primary/30 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {KIND_LABEL[spec.kind]} · 动画图解
        </span>
      </div>

      <div className="min-h-24">{body}</div>

      {total > 1 && (
        <>
          <div
            className={cn(
              'mt-3 rounded-lg border bg-card/80 px-3 py-2 font-mono text-xs leading-relaxed',
              'border-border text-foreground/85',
            )}
            aria-live="polite"
          >
            <span className="mr-1.5 font-bold text-primary">步骤 {step + 1}/{total}</span>
            {stepNote(spec, step)}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="回到第一步"
                onClick={() => {
                  setStep(0)
                  setPlaying(false)
                }}
              >
                <SkipBack className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="上一步"
                disabled={step === 0}
                onClick={() => {
                  setStep((s) => Math.max(0, s - 1))
                  setPlaying(false)
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8"
                aria-label={playing ? '暂停' : '播放'}
                onClick={() => {
                  if (step >= total - 1) setStep(0)
                  setPlaying((p) => !p)
                }}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="下一步"
                disabled={step >= total - 1}
                onClick={() => {
                  setStep((s) => Math.min(total - 1, s + 1))
                  setPlaying(false)
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="跳到最后一步"
                onClick={() => {
                  setStep(total - 1)
                  setPlaying(false)
                }}
              >
                <SkipForward className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Slider
              value={[step]}
              min={0}
              max={total - 1}
              step={1}
              className="min-w-32 flex-1"
              aria-label="动画进度"
              onValueChange={([v]) => {
                setStep(v)
                setPlaying(false)
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
