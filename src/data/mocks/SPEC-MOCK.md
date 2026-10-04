# 408 全真模拟卷数据规范 v1（生成必读）

## 目标

编写 `src/data/mocks/` 下的完整模拟卷：每套 47 题 = 单选 40（每题 2 分）+ 综合 7（70 分），全卷 150 分。**核心要求：每道单选题的每一个选项都有独立讲解（optionExplanations），过程类题目必须配动画/图示讲解（visual）**。

## 文件组织（每套两个文件）

- `src/data/mocks/mockNN-c.ts`：导出 `mockNNc: Question[]` —— 40 道单选（题号 1–40），按题号升序
- `src/data/mocks/mockNN-a.ts`：导出 `mockNNa: Question[]` —— 7 道综合题（题号 41–47），按题号升序
- 参数过长时拆 `mockNN-c1.ts`（1–20）/ `mockNN-c2.ts`（21–40），在 `-c.ts` 合并导出
- **禁止**改动 `index.ts`、`types.ts`、视图组件、其他套卷文件；新建文件只 import 类型：

```ts
import type { Question } from '../types'
```

## 卷面固定结构（与真题完全一致）

| 卷面题号 | 科目 subject | 题型 | 分值 |
|---|---|---|---|
| 1–11 | 数据结构 'ds' | single | 每题 2 分 |
| 12–22 | 计算机组成原理 'co' | single | 每题 2 分 |
| 23–32 | 操作系统 'os' | single | 每题 2 分 |
| 33–40 | 计算机网络 'cn' | single | 每题 2 分 |
| 41–42 | 'ds' | application | 两题合计 23 分 |
| 43–44 | 'co' | application | 两题合计 23 分 |
| 45–46 | 'os' | application | 两题合计 15 分 |
| 47 | 'cn' | application | 9 分 |

综合题分值组合（全卷合计必须 70）：
- 41 ∈ {8,10,12,13,15}，42 = 23 − 41
- 43 ∈ {8,10,12,13,15}，44 = 23 − 43
- 45 ∈ {7,8}，46 = 15 − 45
- 47 = 9

## 单选题字段模板（模拟卷专用）

```ts
{
  id: 'mock02-01',            // mock{NN}-{两位题号}，与 number 一致
  year: 0,                    // 固定 0（非真题）
  origin: '模拟卷（二）',       // 固定值，任务简报中给出
  number: 1,                  // 卷面题号 1–40
  subject: 'ds',              // 由题号决定
  type: 'single',
  topic: '栈与队列',            // ≤8 字
  difficulty: 2,              // 1 基础 / 2 中等 / 3 较难
  source: 'mock',             // 固定 'mock'
  score: 2,
  question: '题干……？',
  options: ['…', '…', '…', '…'],   // 恰好 4 项
  answer: 'C',                // 与解析结论一致
  optionExplanations: ['A 为什么错……', 'B 为什么错……', 'C 为什么对……', 'D 为什么错……'],
  explanation: '本题思路与总体解析……',   // ≥2 句：考点定位 + 解题关键
  visual: { … },              // 过程类题目必填（见下），其余可省略
}
```

**optionExplanations 硬性要求**（本任务核心价值）：
- 恰好 4 条、与 options 顺序一一对应
- 每条 ≥ 25 字，说清「为什么对/错」的机理，禁止「A 错误」「B 不对」这类敷衍表述
- 正确项给推导/结论依据；错误项指出具体错在哪、正确说法应是什么
- 计算类错误项点出算错在哪一步
- 四条讲解合计 ≥ 160 字

## 综合题字段模板

```ts
{
  id: 'mock02-41',
  year: 0,
  origin: '模拟卷（二）',
  number: 41,
  subject: 'ds',
  type: 'application',
  topic: '散列表',
  difficulty: 3,
  source: 'mock',
  score: 13,
  question: '总题干……\n(1) ……（5分）\n(2) ……（8分）',
  code: { lang: 'c', text: '…' },        // 需要时才加
  answerText: '**(1)** 结论与完整推导步骤……\n**(2)** ……',
  explanation: '解题思路 + 关键公式 + 评分要点/易错点',
  visual: { … },                          // 树构造/置换/图算法/流水线/时序等大题强烈建议
}
```

综合题 answerText 必须给完整推导过程（表格/逐步计算），不能只给结论；各小问分值写进题干且合计 = score。

## visual 动画/图示规范（8 种，按题目类型选择）

所有种类都有 `kind` 与 `title` 字段。数字/坐标必须与题干一致并经过验算。

### 1. sort —— 数组过程动画（排序一趟、建堆、顺序表操作等）

```ts
visual: {
  kind: 'sort',
  title: '以 47 为基准的一趟划分',
  frames: [
    { arr: [47, 29, 71, 79, 19, 11, 41], pivot: 0, compared: [6], note: '基准 47 固定于下标 0；j=6 指向 41 < 47' },
    { arr: [41, 29, 71, 79, 19, 11, 47], pivot: 6, settled: [6], note: '相遇后基准归位下标 6，左侧全部不大于 47' },
  ],
}
```
- `arr` 本步数组状态；`pivot` 基准所在下标；`compared` 正在比较下标；`settled` 刚交换/已就位下标；`range` 当前处理区间 `[lo,hi]`
- frames 3–10 步为宜，每步 note 一句话讲清本步发生什么

### 2. tree —— 二叉树/森林构造动画（BST 插入、AVL 旋转、哈夫曼、堆）

```ts
visual: {
  kind: 'tree',
  title: '哈夫曼树构造过程',
  steps: [
    { nodes: [{ id: 'a', label: '5' }, { id: 'b', label: '29' }, { id: 'c', label: '7' }, { id: 'd', label: '8' }, { id: 'e', label: '14' }, { id: 'f', label: '23' }, { id: 'g', label: '3' }, { id: 'h', label: '11' }], note: '初始森林：8 棵单节点树' },
    { nodes: [{ id: 'n1', label: '8' }, { id: 'g', label: '3', parent: 'n1' }, { id: 'a', label: '5', parent: 'n1' }], highlight: ['n1', 'g', 'a'], note: '取最小 3 与 5 合并成 8' },
  ],
}
```
- 每个 step 给出整棵树的全部节点：`{ id: 唯一标识, label: 圈内文字(≤4字), parent: 父节点id（根省略） }`
- 组件按「叶节点从左到右排序、父居中」自动布局
- steps 3–8 步，highlight 高亮本步新增/变化节点

### 3. graph —— 带权图算法动画（Dijkstra/Prim/Kruskal/拓扑）

```ts
visual: {
  kind: 'graph',
  title: 'Dijkstra 求 A 到各点最短路',
  nodes: [
    { id: 'A', x: 8, y: 50 }, { id: 'B', x: 38, y: 12 }, { id: 'C', x: 38, y: 88 },
    { id: 'D', x: 72, y: 30 }, { id: 'E', x: 72, y: 72 },
  ],
  edges: [
    { from: 'A', to: 'B', w: 10 }, { from: 'A', to: 'C', w: 3 },
    { from: 'B', to: 'D', w: 1 }, { from: 'C', to: 'D', w: 8 },
    { from: 'C', to: 'E', w: 2 }, { from: 'D', to: 'E', w: 4 },
  ],
  steps: [
    { labels: { A: '0', B: '∞', C: '∞', D: '∞', E: '∞' }, note: '初始化：dist[A]=0，其余 ∞' },
    { activeNodes: ['A'], activeEdges: ['A-B', 'A-C'], labels: { A: '0', B: '10', C: '3' }, note: '从 A 出发松弛：dist[B]=10，dist[C]=3' },
    { activeNodes: ['A', 'C'], activeEdges: ['C-E', 'C-D'], labels: { A: '0', B: '10', C: '3', D: '11', E: '5' }, note: '选最近的 C(3) 确定其最短路，松弛 D、E' },
  ],
}
```
- nodes 坐标 0–100（归一化画布），布局分散避免重叠；edges 的 w 为权值、directed: true 画箭头
- activeEdges 用 'from-to' 字符串；labels 为节点旁距离标注（可写 '∞→10' 表示更新）
- steps 按算法轮次推进，每步 note 说明本轮选了谁、松弛了谁

### 4. pages —— 页面置换动画（组件自动精确模拟，只需给参数）

```ts
visual: {
  kind: 'pages',
  title: 'LRU 置换过程（3 页框）',
  algo: 'LRU',            // 'FIFO' | 'LRU' | 'CLOCK' | 'OPT'
  frames: 3,
  accesses: ['4', '3', '2', '1', '4', '3', '5', '4', '3', '2', '1', '5'],
}
```
- 组件内置四种算法标准实现，自动逐步演示并统计缺页率，只需给访问序列与页框数
- 题干中的访问序列、页框数必须与此一致

### 5. cwnd —— TCP 拥塞窗口演化折线

```ts
visual: {
  kind: 'cwnd',
  title: '慢启动与拥塞避免',
  points: [
    { round: 1, cwnd: 1, ssthresh: 8 }, { round: 2, cwnd: 2, ssthresh: 8 },
    { round: 3, cwnd: 4, ssthresh: 8 }, { round: 4, cwnd: 8, ssthresh: 8 },
    { round: 5, cwnd: 9, ssthresh: 8 }, { round: 6, cwnd: 10, ssthresh: 8, event: '超时' },
    { round: 7, cwnd: 1, ssthresh: 5 }, { round: 8, cwnd: 2, ssthresh: 5 },
  ],
}
```
- round 从 1 起（RTT 轮次）；每点给 cwnd 与当前 ssthresh；事件点标 event（'超时'、'3-ACK'）
- 演化规则必须与教材一致（慢启动指数增长、达 ssthresh 转线性、超时 ssthresh=cwnd/2 且 cwnd=1）
- 若题面为「收到 3 个冗余 ACK 的快恢复」，按快恢复口径书写 cwnd 与 ssthresh

### 6. pipeline —— 指令流水线时空图

```ts
visual: {
  kind: 'pipeline',
  title: '5 段流水线（含一次 load-use 停顿）',
  stages: ['IF', 'ID', 'EX', 'MEM', 'WB'],
  instrs: [
    { name: 'lw  R1, 0(R2)', delay: 0 },
    { name: 'add R3, R1, R4', delay: 1, note: '依赖 lw 的结果，插 1 拍气泡后进入 IF' },
    { name: 'sub R5, R3, R6', delay: 2, note: '依赖 add，同样停顿 1 拍' },
  ],
}
```
- delay = 该指令进入 IF 的拍号（0 起），含所有停顿；组件自动铺满后续各段
- 每条指令的 note 说明为什么在此拍发射（有无冒险、气泡几拍）

### 7. seq —— 协议时序图动画（握手挥手/ARP/DNS/HTTP/DHCP/访问全过程）

```ts
visual: {
  kind: 'seq',
  title: 'TCP 三次握手',
  actors: ['客户', '服务器'],
  messages: [
    { from: '客户', to: '服务器', label: 'SYN=1, seq=x' },
    { from: '服务器', to: '客户', label: 'SYN=1, ACK=1, seq=y, ack=x+1' },
    { from: '客户', to: '服务器', label: 'ACK=1, seq=x+1, ack=y+1' },
  ],
}
```
- actors 2–4 个；messages 按时间序，label ≤ 30 字；from/to 必须是 actors 中的名字

### 8. flow —— 流程图（缺页处理/中断/地址变换/PV 等，静态全览）

```ts
visual: {
  kind: 'flow',
  title: '缺页中断处理流程',
  nodes: [
    { id: 's', label: '开始', type: 'start' },
    { id: 'a', label: 'CPU 访问虚地址', type: 'proc' },
    { id: 'b', label: '页在内存？', type: 'cond' },
    { id: 'c', label: '产生缺页中断\n转入处理程序', type: 'proc' },
    { id: 'd', label: '有空闲页框？', type: 'cond' },
    { id: 'e', label: '执行页面置换', type: 'proc' },
    { id: 'f', label: '调页入框\n更新页表', type: 'proc' },
    { id: 'g', label: '重新执行被中断指令', type: 'proc' },
    { id: 'h', label: '结束', type: 'end' },
  ],
  edges: [
    { from: 's', to: 'a' }, { from: 'a', to: 'b' },
    { from: 'b', to: 'c', label: '否' }, { from: 'b', to: 'g', label: '是' },
    { from: 'c', to: 'd' }, { from: 'd', to: 'e', label: '否' },
    { from: 'd', to: 'f', label: '是' }, { from: 'e', to: 'f' },
    { from: 'f', to: 'g' }, { from: 'g', to: 'h' },
  ],
}
```
- node label 每行 ≤ 12 字，可 \n 换行（最多 2 行）；type：start/end 圆角、proc 矩形、cond 菱形判断
- 边的 label 写「是/否」等分支条件；整体自上而下单入口

## 内容质量（最重要的要求）

1. **题目自洽**：题干条件完备、无歧义；答案唯一且与解析、optionExplanations 三方一致
2. **数值验算**：所有计算题（复杂度、WPL、ASL、Cache、浮点、流水线、分页、子网、带宽……）必须手工逐位验算，动画 frames/points/steps 的数字同样要与验算一致
3. **风格对齐真题**：措辞、陷阱设置、选项干扰方式向 408 真题看齐；不得照抄真题库已有题目（可换数值/换角度改编；同卷内不得自我重复，也不得与统考真题题干雷同）
4. 严禁占位文本（「略」「TODO」「待补充」）
5. 每套卷 visual 动画 ≥ 6 个，四科都要有分布；凡涉及过程/演化/时序的题目（排序过程、树构造、图算法、页面置换、流水线、协议交互、拥塞控制、流程）必须配 visual
6. 每套卷至少 12 道题难度 3（较难），至少 10 道题难度 1（基础）；答案字母分布不得集中于某两个字母
7. 富文本记法与站内一致：换行 \n；行内代码反引号；**加粗**双星号；幂写 2^10；十六进制带 H 后缀

## 自检（写完必做）

```bash
bun /home/z/my-project/scripts/verify-mocks.ts mock02   # 换成你的卷号（两位）
```

修复所有 ERROR 直至 ALL CHECKS PASSED。然后人工抽查 3 道单选：answer 字母、正确选项内容、explanation 结论、optionExplanations 对应条目四方一致。
