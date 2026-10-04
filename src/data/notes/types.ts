/**
 * 经验笔记数据模型
 *
 * 内容以「类别 → 章节 → 内容块」三层组织：
 * - 类别（NoteCategory）：备考指南 / 四大科目笔记 / 考情与易错 等
 * - 章节（NoteChapter）：一篇完整笔记（如「树与二叉树」）
 * - 内容块（NoteBlock）：段落 / 列表 / 代码 / 表格 / 提示框 / 步骤 / 要点卡
 *
 * 段落与列表文本支持轻量富文本：**加粗** 与 `行内代码`（复用 RichText 渲染）。
 */

export type CalloutTone = 'tip' | 'warn' | 'key'

export type NoteBlock =
  /** 段落（支持 **加粗**、`行内代码`、\n 换行） */
  | { kind: 'p'; text: string }
  /** 章内子标题 */
  | { kind: 'h'; text: string }
  /** 无序/有序列表 */
  | { kind: 'list'; items: string[]; ordered?: boolean }
  /** 代码块（复用带复制按钮的 CodeBlock，lang 默认 c） */
  | { kind: 'code'; lang?: string; title?: string; text: string }
  /** 对比表格 */
  | { kind: 'table'; head: string[]; rows: string[][] }
  /** 提示框：tip=建议 / warn=易错警告 / key=核心结论 */
  | { kind: 'callout'; tone: CalloutTone; title?: string; text: string }
  /** 步骤（解题流程/操作流程） */
  | { kind: 'steps'; items: string[] }
  /** 要点网格卡（速记卡） */
  | { kind: 'kv'; items: Array<{ k: string; v: string }> }

export interface NoteChapter {
  /** 唯一 id，如 'ds-tree' */
  id: string
  title: string
  /** 一句话简介（目录与章节头部展示） */
  brief: string
  /** 预计阅读分钟数 */
  minutes: number
  /** 标签，如 ['高频', '必背'] */
  tags?: string[]
  /**
   * 考频联动关键词：与题库 Question.topic 做包含匹配（双向），
   * 用于展示「本站真题 N 题 · 覆盖 X 年」并支持一键跳转刷题。
   */
  topicKeywords?: string[]
  blocks: NoteBlock[]
}

export interface NoteCategory {
  /** 唯一 id，如 'ds'、'guide' */
  id: string
  title: string
  /** 副标题，如 'Data Structures · 45 分' */
  subtitle: string
  /** 视图层映射的图标 key（见 notes-view 的 ICONS） */
  icon: string
  /** 类别排序权重（小在前） */
  order: number
  chapters: NoteChapter[]
}

export const CALLOUT_META: Record<
  CalloutTone,
  { label: string; icon: 'lightbulb' | 'alert' | 'key'; cls: string }
> = {
  tip: {
    label: '经验之谈',
    icon: 'lightbulb',
    cls: 'border-sky-500/40 bg-sky-500/[0.06]',
  },
  warn: {
    label: '易错警示',
    icon: 'alert',
    cls: 'border-rose-500/40 bg-rose-500/[0.06]',
  },
  key: {
    label: '核心结论',
    icon: 'key',
    cls: 'border-emerald-500/40 bg-emerald-500/[0.06]',
  },
}
