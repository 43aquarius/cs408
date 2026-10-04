'use client'

import React from 'react'

/**
 * 轻量 C/C++ 代码语法着色（零依赖）。
 * 按顺序匹配：注释 → 字符串 → 预处理 → 关键字 → 类型 → 数字。
 */
const KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue', 'switch',
  'case', 'default', 'sizeof', 'typedef', 'struct', 'union', 'enum', 'static',
  'const', 'extern', 'register', 'volatile', 'goto', 'inline', 'define',
  'include', 'ifdef', 'ifndef', 'endif',
])
const TYPES = new Set([
  'int', 'char', 'float', 'double', 'void', 'long', 'short', 'unsigned',
  'signed', 'bool', 'size_t', 'semaphore', 'LNode', 'LinkList', 'BiTree',
  'ArcNode', 'ALGraph', 'TRUE', 'FALSE', 'MAXQ', 'MAXV',
])

export function highlightCode(code: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  const re =
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(^[ \t]*#[a-z]+)|\b([A-Za-z_][A-Za-z0-9_]*)\b|\b(0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?[fFhH]?)\b/gm
  let last = 0
  let m: RegExpExecArray | null
  let key = 0

  const push = (text: string, cls?: string) => {
    if (!text) return
    out.push(
      cls ? (
        <span key={key++} className={cls}>
          {text}
        </span>
      ) : (
        <React.Fragment key={key++}>{text}</React.Fragment>
      ),
    )
  }

  while ((m = re.exec(code)) !== null) {
    push(code.slice(last, m.index))
    if (m[1]) {
      push(m[1], 'text-emerald-600/70 dark:text-emerald-400/60 italic')
    } else if (m[2]) {
      push(m[2], 'text-amber-700 dark:text-amber-300')
    } else if (m[3]) {
      push(m[3], 'text-rose-600 dark:text-rose-400')
    } else if (m[4]) {
      const w = m[4]
      if (KEYWORDS.has(w)) push(w, 'text-rose-600 dark:text-rose-400 font-medium')
      else if (TYPES.has(w)) push(w, 'text-teal-700 dark:text-teal-300')
      else if (/^[A-Z][A-Z0-9_]+$/.test(w)) push(w, 'text-amber-700 dark:text-amber-300')
      else push(w)
    } else if (m[5]) {
      push(m[5], 'text-orange-700 dark:text-orange-300')
    }
    last = m.index + m[0].length
  }
  push(code.slice(last))
  return out
}
