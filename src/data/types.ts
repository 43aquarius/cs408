export type SubjectCode = 'ds' | 'co' | 'os' | 'cn'
export type QuestionType = 'single' | 'application'
export type Difficulty = 1 | 2 | 3
export type SourceKind = 'real' | 'adapted' | 'curated' | 'mock'

export interface CodeBlockData {
  lang: string
  text: string
}

/* ============ 动画 / 图示讲解配置（VisualSpec） ============ */

/** 数组类过程动画：排序一趟、堆调整、顺序表插入删除、归并等 */
export interface SortFrame {
  /** 当前数组状态 */
  arr: Array<number | string>
  /** 本步说明（一句话） */
  note: string
  /** 基准 / 关键值所在下标（黄色高亮格） */
  pivot?: number
  /** 正在比较的下标（主题色高亮） */
  compared?: number[]
  /** 刚交换 / 已就位的下标（绿色高亮） */
  settled?: number[]
  /** 当前处理区间 [lo, hi]（下划线标出） */
  range?: [number, number]
}

/** 二叉树 / 森林构造过程：BST 插入、AVL 旋转、哈夫曼合并、堆建堆等 */
export interface TreeStep {
  /** 本步树的全部节点（parent 形成森林；label 为显示文本） */
  nodes: Array<{ id: string; label: string; parent?: string }>
  /** 高亮节点 id */
  highlight?: string[]
  /** 本步说明 */
  note: string
}

/** 带权图算法：Dijkstra / Prim / Kruskal / 拓扑排序等 */
export interface GraphSpec {
  kind: 'graph'
  title: string
  /** 节点坐标（0–100 归一化画布） */
  nodes: Array<{ id: string; x: number; y: number }>
  /** 边；directed 时画箭头 */
  edges: Array<{ from: string; to: string; w?: number; directed?: boolean }>
  /** 演进步骤 */
  steps: Array<{
    /** 激活的边 'from-to'（如 'A-B'） */
    activeEdges?: string[]
    /** 激活 / 已确定的节点 */
    activeNodes?: string[]
    /** 节点旁的临时标注，如距离 { A: '0', B: '∞→10' } */
    labels?: Record<string, string>
    note: string
  }>
}

/** 页面置换过程（FIFO/LRU/CLOCK/OPT 由组件精确模拟） */
export interface PagesSpec {
  kind: 'pages'
  title: string
  algo: 'FIFO' | 'LRU' | 'CLOCK' | 'OPT'
  /** 页框数 */
  frames: number
  /** 访问序列，如 ['1','2','3','4','1','2','5','1','2','3','4','5'] */
  accesses: string[]
}

/** TCP 拥塞窗口演化折线 */
export interface CwndSpec {
  kind: 'cwnd'
  title: string
  /** 每轮拥塞窗口值；event 标注事件（如 '超时'、'3-ACK'） */
  points: Array<{ round: number; cwnd: number; ssthresh?: number; event?: string }>
}

/** 指令流水线时空图 */
export interface PipelineSpec {
  kind: 'pipeline'
  title: string
  /** 各段名称，如 ['IF','ID','EX','MEM','WB'] */
  stages: string[]
  /** 指令；delay = 进入首段的拍号（0 起，含停顿），组件自动铺满各段 */
  instrs: Array<{ name: string; delay: number; note?: string }>
}

/** 协议时序图：握手挥手、ARP、DNS、HTTP、DHCP、访问全过程等 */
export interface SeqSpec {
  kind: 'seq'
  title: string
  /** 2–4 个角色，如 ['客户', '服务器'] */
  actors: string[]
  /** 消息按时间序逐步展示 */
  messages: Array<{ from: string; to: string; label: string }>
}

/** 流程图：缺页处理、中断处理、PV 操作、地址变换等 */
export interface FlowSpec {
  kind: 'flow'
  title: string
  nodes: Array<{ id: string; label: string; type: 'start' | 'proc' | 'cond' | 'end' }>
  edges: Array<{ from: string; to: string; label?: string }>
}

export type VisualSpec =
  | ({ kind: 'sort'; title: string; frames: SortFrame[] })
  | ({ kind: 'tree'; title: string; steps: TreeStep[] })
  | GraphSpec
  | PagesSpec
  | CwndSpec
  | PipelineSpec
  | SeqSpec
  | FlowSpec

/* ============ 题目数据模型 ============ */

export interface Question {
  id: string
  /** 真实年份；精选题库与模拟卷为 0 */
  year: number
  /** 真实卷面题号（1–47：单选 1–40，综合应用 41–47） */
  number: number
  subject: SubjectCode
  type: QuestionType
  /** 知识点，如 “栈与队列” */
  topic: string
  difficulty: Difficulty
  source: SourceKind
  /** 分值：单选每题 2 分；综合题为该题真实分值 */
  score: number
  /** 题干，支持 \n 换行、`行内代码`、**加粗** */
  question: string
  code?: CodeBlockData
  /** 单选题选项（不含 A. 前缀） */
  options?: string[]
  /** 单选题答案字母 */
  answer?: string
  /** 综合题参考答案（支持同样的富文本记法） */
  answerText?: string
  /** 解析 */
  explanation: string
  /** year=0 时的来源展示名：'精选题库' 或 '模拟卷（一）' 等 */
  origin?: string
  /** 逐选项讲解（与 options 一一对应），模拟卷单选题必填 */
  optionExplanations?: string[]
  /** 动画 / 图示讲解 */
  visual?: VisualSpec
  /**
   * 通用解题模板 id（见 src/data/templates）：
   * 该题属于相对固定的题型时，讲解区附上这一题型的通用解法步骤。
   */
  templateId?: string
}

export const SUBJECTS: Record<
  SubjectCode,
  { name: string; en: string; score: string; color: string; dot: string }
> = {
  ds: { name: '数据结构', en: 'Data Structures', score: '45 分', color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  co: { name: '计算机组成原理', en: 'Computer Organization', score: '45 分', color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  os: { name: '操作系统', en: 'Operating Systems', score: '35 分', color: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
  cn: { name: '计算机网络', en: 'Computer Networks', score: '25 分', color: 'text-teal-600 dark:text-teal-400', dot: 'bg-teal-500' },
}

export const SUBJECT_ORDER: SubjectCode[] = ['ds', 'co', 'os', 'cn']

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: '基础',
  2: '中等',
  3: '较难',
}

export const TYPE_LABEL: Record<QuestionType, string> = {
  single: '单选题',
  application: '综合应用',
}

export const SOURCE_LABEL: Record<SourceKind, string> = {
  real: '真题',
  adapted: '真题改编',
  curated: '精选题库',
  mock: '模拟卷',
}

/** 408 卷面蓝图：单选 1-11 DS、12-22 CO、23-32 OS、33-40 CN；综合 41-47 固定科目 */
export function subjectOfNumber(n: number): SubjectCode {
  if (n <= 11) return 'ds'
  if (n <= 22) return 'co'
  if (n <= 32) return 'os'
  return 'cn'
}

/** 综合题固定蓝图：41-42 DS、43-44 CO、45-46 OS、47 CN（分值 23+23+15+9=70） */
export function appSubjectOfNumber(n: number): SubjectCode {
  if (n <= 42) return 'ds'
  if (n <= 44) return 'co'
  if (n <= 46) return 'os'
  return 'cn'
}

export function letterOf(i: number): string {
  return String.fromCharCode(65 + i)
}
