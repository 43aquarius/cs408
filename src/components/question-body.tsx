'use client'

import * as React from 'react'
import { Check, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/code-block'
import { RichText } from '@/components/rich-text'
import { letterOf, TYPE_LABEL } from '@/data/types'
import type { Question } from '@/data/types'
import { VisualPlayer } from '@/components/visuals/visual-player'
import { SolutionTemplate } from '@/components/solution-template'
import { QuestionFavNote } from '@/components/fav-note'
import { useProgress } from '@/lib/store'
import { cn } from '@/lib/utils'

interface QuestionBodyProps {
  q: Question
  /** 练习模式：选择后立即判定并记录；复盘模式：直接展示答案 */
  mode?: 'practice' | 'review'
  /** 复盘模式：用户当时的选择 */
  reviewSelected?: string
  /** 练习模式下作答完成后的回调 */
  onAnswered?: (result: 'correct' | 'wrong') => void
  /** 外部受控选择（键盘操作时由父组件传入），单选题 */
  externalSelected?: string
}

const LETTER_CLASS = 'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-semibold'

export function QuestionBody({
  q,
  mode = 'practice',
  reviewSelected,
  onAnswered,
  externalSelected,
}: QuestionBodyProps) {
  const submitAnswer = useProgress((s) => s.submitAnswer)
  const markApplication = useProgress((s) => s.markApplication)
  const hasRecord = useProgress((s) => !!s.records[q.id])
  const [selected, setSelected] = React.useState<string | null>(null)
  const [revealed, setRevealed] = React.useState(false)
  const [selfMarked, setSelfMarked] = React.useState<'mastered' | 'unmastered' | null>(null)

  // 切换题目时重置本地状态
  React.useEffect(() => {
    setSelected(null)
    setRevealed(false)
    setSelfMarked(null)
  }, [q.id])

  const answered = mode === 'review' ? true : selected !== null || externalSelected != null
  const current = mode === 'review' ? reviewSelected ?? null : externalSelected ?? selected

  const pick = (letter: string) => {
    if (mode === 'review' || selected !== null) return
    setSelected(letter)
    const result = letter === q.answer ? 'correct' : 'wrong'
    submitAnswer(q.id, result)
    onAnswered?.(result)
  }

  const correctLetter = q.type === 'single' ? q.answer : undefined
  const isCorrect = mode === 'review' ? reviewSelected === correctLetter : selected === correctLetter

  return (
    <div className="flex flex-col gap-4">
      {/* 题干 */}
      <RichText text={q.question} className="text-[15px] font-medium" />
      {q.code && <CodeBlock code={q.code.text} lang={q.code.lang} />}

      {/* 单选题选项 */}
      {q.type === 'single' && q.options && (
        <div className="flex flex-col gap-2" role="listbox" aria-label="选项">
          {q.options.map((opt, i) => {
            const letter = letterOf(i)
            const isPicked = current === letter
            const showCorrect = answered && letter === correctLetter
            const showWrong = answered && isPicked && letter !== correctLetter
            return (
              <button
                key={letter}
                type="button"
                role="option"
                data-option={`${q.id}-${letter}`}
                onClick={() => pick(letter)}
                disabled={answered || mode === 'review'}
                aria-selected={isPicked}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 text-left text-sm outline-none transition-all',
                  'hover:border-primary/50 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring',
                  (answered || mode === 'review') && 'cursor-default',
                  !answered && mode === 'practice' && 'cursor-pointer',
                  showCorrect && 'border-emerald-500 bg-emerald-500/10',
                  showWrong && 'border-rose-500 bg-rose-500/10',
                  !showCorrect && !showWrong && 'border-border',
                  isPicked && !showCorrect && !showWrong && 'border-primary bg-accent/40',
                )}
              >
                <span
                  className={cn(
                    LETTER_CLASS,
                    'bg-card text-muted-foreground',
                    showCorrect && 'border-emerald-500 bg-emerald-500 text-white',
                    showWrong && 'border-rose-500 bg-rose-500 text-white',
                    isPicked && !showCorrect && !showWrong && 'border-primary text-primary',
                  )}
                >
                  {letter}
                </span>
                <span className="flex-1 leading-relaxed">{opt}</span>
                {showCorrect && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                {showWrong && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white">
                    <X className="h-3 w-3" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* 综合题：查看参考答案 + 自评 */}
      {q.type === 'application' && mode === 'practice' && !revealed && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setRevealed(true)}
          className="gap-2 self-start"
        >
          <Eye className="h-4 w-4" />
          查看{TYPE_LABEL.application}参考答案
        </Button>
      )}

      {(q.type === 'application' && (revealed || mode === 'review')) && (
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="mb-2 font-mono text-xs font-semibold text-primary">✦ 参考答案</p>
            <RichText text={q.answerText ?? ''} className="text-sm" />
          </div>
          {mode === 'practice' && !selfMarked && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">对照答案自评：</span>
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  markApplication(q.id, true)
                  setSelfMarked('mastered')
                  onAnswered?.('correct')
                }}
              >
                已掌握
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  markApplication(q.id, false)
                  setSelfMarked('unmastered')
                  onAnswered?.('wrong')
                }}
              >
                未掌握
              </Button>
            </div>
          )}
          {selfMarked && (
            <p className="font-mono text-xs text-muted-foreground">
              已记录：{selfMarked === 'mastered' ? '✓ 已掌握' : '✗ 已加入错题本'}
            </p>
          )}
        </div>
      )}

      {/* 逐选项讲解（模拟卷 / 精选题库） */}
      {q.type === 'single' && answered && q.optionExplanations && q.optionExplanations.length > 0 && (
        <div className="rounded-xl border border-primary/25 bg-card/70 p-4" data-option-explanations>
          <p className="mb-3 font-mono text-xs font-bold text-primary">◆ 逐项解析 · 每个选项为什么对 / 错</p>
          <div className="flex flex-col gap-2">
            {q.optionExplanations.map((exp, i) => {
              if (!exp) return null
              const letter = letterOf(i)
              const correct = letter === q.answer
              return (
                <div
                  key={letter}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 text-sm leading-relaxed',
                    correct
                      ? 'border-emerald-500/50 bg-emerald-500/[0.08]'
                      : 'border-border bg-muted/30',
                  )}
                >
                  <span
                    className={cn(
                      LETTER_CLASS,
                      'shrink-0',
                      correct
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'bg-card text-muted-foreground',
                    )}
                  >
                    {letter}
                  </span>
                  <span className="flex-1 text-foreground/85">{exp}</span>
                  {correct && (
                    <span className="shrink-0 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ 正确答案
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 通用解题模板：这一类题的固定解法（单选答完 / 综合题看答案后显示） */}
      {q.templateId && (answered || (q.type === 'application' && revealed)) && (
        <SolutionTemplate id={q.templateId} />
      )}

      {/* 动画 / 图示讲解 */}
      {q.visual && (answered || mode === 'review' || q.type === 'application') && (
        <VisualPlayer spec={q.visual} />
      )}

      {/* 判定与解析 */}
      {q.type === 'single' && answered && (
        <div
          className={cn(
            'rounded-lg border p-4',
            (mode === 'review' ? isCorrect : selected === correctLetter)
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-rose-500/40 bg-rose-500/5',
          )}
        >
          <p className="mb-1 font-mono text-xs font-semibold">
            {mode === 'review' ? (
              <span className={isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                你的答案：{reviewSelected ?? '未作'} {isCorrect ? '✓ 正确' : '✗ 错误'} · 正确答案：{correctLetter}
              </span>
            ) : selected === correctLetter ? (
              <span className="text-emerald-600 dark:text-emerald-400">✓ 回答正确</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400">
                ✗ 回答错误，正确答案是 {correctLetter}
              </span>
            )}
          </p>
          <RichText text={q.explanation} className="text-sm text-foreground/85" />
        </div>
      )}

      {/* 复盘模式下综合题直接展示解析 */}
      {q.type === 'application' && mode === 'review' && (
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="mb-1 font-mono text-xs font-semibold text-primary">✦ 解析</p>
          <RichText text={q.explanation} className="text-sm text-foreground/85" />
        </div>
      )}

      {/* 练习模式下综合题自评后的解析 */}
      {q.type === 'application' && mode === 'practice' && revealed && (
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="mb-1 font-mono text-xs font-semibold text-primary">✦ 解析</p>
          <RichText text={q.explanation} className="text-sm text-foreground/85" />
        </div>
      )}

      {/* 收藏 + 备注（作答后 / 复盘模式 / 综合题 / 曾做过均展示） */}
      {(answered || mode === 'review' || q.type === 'application' || hasRecord) && (
        <QuestionFavNote qid={q.id} />
      )}
    </div>
  )
}
