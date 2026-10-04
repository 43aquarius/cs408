'use client'

import * as React from 'react'

/**
 * 打字机效果：逐字输入短语，停顿后逐字删除，循环切换。
 * 尊重 prefers-reduced-motion（直接完整展示）。
 */
export function Typewriter({
  phrases,
  className,
  typeSpeed = 90,
  deleteSpeed = 45,
  holdMs = 2200,
}: {
  phrases: string[]
  className?: string
  typeSpeed?: number
  deleteSpeed?: number
  holdMs?: number
}) {
  const [text, setText] = React.useState('')
  const [idx, setIdx] = React.useState(0)
  const [deleting, setDeleting] = React.useState(false)
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  React.useEffect(() => {
    if (reduced) {
      setText(phrases[0])
      return
    }
    const current = phrases[idx % phrases.length]
    let timer: ReturnType<typeof setTimeout>

    if (!deleting && text.length < current.length) {
      timer = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed)
    } else if (!deleting && text.length === current.length) {
      timer = setTimeout(() => setDeleting(true), holdMs)
    } else if (deleting && text.length > 0) {
      timer = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed)
    } else {
      timer = setTimeout(() => {
        setDeleting(false)
        setIdx((i) => (i + 1) % phrases.length)
      }, 350)
    }
    return () => clearTimeout(timer)
  }, [text, deleting, idx, phrases, typeSpeed, deleteSpeed, holdMs, reduced])

  return (
    <span className={className} aria-live="polite">
      {reduced ? phrases[0] : text}
      <span
        aria-hidden
        className="caret-blink ml-0.5 inline-block h-[1em] w-[0.55ch] translate-y-[0.12em] bg-primary"
      />
    </span>
  )
}
