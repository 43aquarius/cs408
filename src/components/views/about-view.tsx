'use client'

import * as React from 'react'
import { BookMarked, Database, GitBranch, Keyboard, Moon, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TOTAL, YEARS, countBySubject, CURATED, MOCKS, ALL_QUESTIONS } from '@/data'
import { SUBJECTS, SUBJECT_ORDER } from '@/data/types'

export function AboutView() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <p className="font-mono text-xs text-primary">$ man 408lab</p>
        <h1 className="text-2xl font-bold">关于 408Lab</h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          408Lab 是一个为考研计算机统考（科目代码 408）打造的在线刷题站，
          采用程序员博客式的界面语言：打字机问候、悬浮卡片、可复制代码块与三态主题。
          所有作答数据保存在你的浏览器本地，无需注册登录。
        </p>
      </header>

      <Card className="bg-card/90 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <Database className="h-4 w-4 text-primary" />
          题库说明
        </h2>
        <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
          <li>
            · 全国统考 408 自 <b className="text-foreground">2009 年</b>起开考，本站完整收录
            <b className="text-foreground">
              {YEARS[0]}–{YEARS[YEARS.length - 1]} 年（近 20 年）
            </b>
            的 <b className="text-foreground">18 套整卷</b>：每套 47 题（40 道单选 + 7 道综合应用，共 150 分），
            卷面题号、分值与真实试卷一致，合计 <b className="text-foreground">{TOTAL}</b> 题：
            {SUBJECT_ORDER.map((c) => `${SUBJECTS[c].name} ${countBySubject(c)} 题`).join('、')}。
          </li>
          <li>
            · 题目标注 <b className="text-foreground">真题</b> 者为历年原题；标注{' '}
            <b className="text-foreground">真题改编</b> 者为涉及图形（电路图、树形图、网络拓扑等）的真题，
            按原题考点进行了<b className="text-foreground">文本化改编</b>（部分配 ASCII 示意图）。
          </li>
          <li>
            · 题库依据历年真题整理，个别题目表述与官方出版版本可能略有差异；
            <b className="text-foreground">最新一届（{YEARS[YEARS.length - 1]} 年）</b>依据考生回忆版考点整理。
          </li>
          <li>
            · 每道题均附解析；综合应用题提供设计思路、参考实现（C 语言）与复杂度分析的参考答案，
            支持“查看答案 + 自评掌握程度”的练习模式。
          </li>
          <li>
            · 除真题外，本站另设 <b className="text-foreground">精选题库</b>（{CURATED.length} 题：数据结构 / 组成原理 / 操作系统 / 计算机网络四科各 80 题，
            高质量自创与经典改编，含逐选项讲解与动画）与 <b className="text-foreground">十套全真模拟卷</b>（共 {MOCKS.length} 题，
            每套 47 题对标真实卷面，每题逐选项详解，过程题配动画/图示讲解），
            全库合计 <b className="text-foreground">{ALL_QUESTIONS.length}</b> 题。
          </li>
          <li>· 题库仅供个人备考学习使用，请勿用于商业用途。</li>
        </ul>
      </Card>

      <Card className="bg-card/90 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <BookMarked className="h-4 w-4 text-primary" />
          408 考试简介
        </h2>
        <div className="text-sm leading-relaxed text-muted-foreground">
          <p className="mb-3">
            计算机学科专业基础综合（408）满分 <b className="text-foreground">150 分</b>，考试时间 180 分钟：
            单项选择题 40 题 × 2 分 = 80 分，综合应用题共 70 分。
          </p>
          <ul className="space-y-1.5 font-mono text-xs">
            {SUBJECT_ORDER.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <i className={`h-1.5 w-1.5 rounded-full ${SUBJECTS[c].dot}`} />
                {SUBJECTS[c].name}（{SUBJECTS[c].en}）
                <span className="ml-auto">{SUBJECTS[c].score}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card className="bg-card/90 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <Keyboard className="h-4 w-4 text-primary" />
          使用技巧
        </h2>
        <ul className="space-y-2 font-mono text-xs leading-relaxed text-muted-foreground">
          <li>· 刷题训练中：<kbd className="rounded border bg-muted px-1.5 py-0.5">A</kbd>–<kbd className="rounded border bg-muted px-1.5 py-0.5">D</kbd> 或 <kbd className="rounded border bg-muted px-1.5 py-0.5">1</kbd>–<kbd className="rounded border bg-muted px-1.5 py-0.5">4</kbd> 快速选择，<kbd className="rounded border bg-muted px-1.5 py-0.5">Enter</kbd> 下一题，<kbd className="rounded border bg-muted px-1.5 py-0.5">←</kbd> 回看上一题</li>
          <li>· 模拟考试：答题卡可点击跳题、标记存疑题目；时间耗尽自动交卷；支持真题整卷与十套模拟卷</li>
          <li>· 错题自动进错题本；重练答对或手动“标记已掌握”后移出</li>
          <li>· 右上角三态切换：
            <Star className="inline h-3 w-3" /> 浅色 /
            <Moon className="mx-0.5 inline h-3 w-3" /> 深色 / 跟随系统，切换带平滑过渡
          </li>
        </ul>
      </Card>

      <Card className="bg-card/90 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <GitBranch className="h-4 w-4 text-primary" />
          技术栈
        </h2>
        <p className="font-mono text-xs leading-relaxed text-muted-foreground">
          next@16 · react@19 · typescript · tailwindcss@4 · shadcn/ui · zustand · lucide-react
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70">
          祝你上岸。commit early, commit often, and ship that acceptance letter.
        </p>
      </Card>
    </div>
  )
}
