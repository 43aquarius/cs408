'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 三态主题切换：浅色 / 跟随系统 / 深色。
 * 切换时由 globals.css 的全局 transition 提供平滑色彩过渡。
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, themes } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const options = [
    { key: 'light', label: '浅色', icon: Sun },
    { key: 'system', label: '系统', icon: Monitor },
    { key: 'dark', label: '深色', icon: Moon },
  ] as const

  if (!mounted) {
    return <div className="h-9 w-[104px]" aria-hidden />
  }

  // next-themes 在 class 模式下 theme 可能是 'system'
  const current = themes.includes(theme as string) ? theme : 'system'

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border bg-card/80 p-0.5 backdrop-blur"
      role="radiogroup"
      aria-label="主题模式"
    >
      {options.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={current === key}
          aria-label={label}
          title={label}
          onClick={() => setTheme(key)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring',
            current === key
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
      <span className="sr-only">
        当前生效主题：{resolvedTheme === 'dark' ? '深色' : '浅色'}
      </span>
    </div>
  )
}
