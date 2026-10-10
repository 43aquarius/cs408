import type { Question } from '../types'

/** 2024 年 408 统考真题 · 综合应用题 41–47（共 70 分）
 * 数据结构 41–42（23 分）· 组成原理 43–44（23 分）· 操作系统 45–46（15 分）· 网络 47（9 分）
 * 按考生回忆与流传版本还原；含图题目已文本化（source: 'adapted'）
 */
export const y2024a: Question[] = [
  {
    id: 'q-2024-41',
    year: 2024,
    number: 41,
    subject: 'ds',
    type: 'application',
    topic: '二叉树算法',
    difficulty: 3,
    source: 'adapted',
    score: 13,
    question:
      '二叉树采用二叉链表存储，结点包含 data、lchild、rchild 三个域。二叉树的"宽度"定义为各层结点数的最大值。设计一个尽可能高效的算法求二叉树的宽度，并分析算法的时间与空间复杂度。\n(1) 描述算法的基本设计思想；（5 分）\n(2) 根据设计思想，用 C 语言描述算法，关键之处给出注释；（6 分）\n(3) 说明算法的时间复杂度和空间复杂度。（2 分）',
    code: {
      lang: 'c',
      text: `#define MAXQ 1000
typedef struct BiTNode {
    int data;
    struct BiTNode *lchild, *rchild;
} BiTNode, *BiTree;

int width(BiTree T) {
    if (!T) return 0;
    BiTree q[MAXQ], p;
    int front = 0, rear = 0;     /* 队列，front 队头、rear 队尾下一位置 */
    int last = 0;                /* 本层最后一个结点在队列中的下标 */
    int w = 0, maxw = 0;         /* w: 本层计数, maxw: 最大宽度 */
    q[rear++] = T;
    while (front < rear) {
        p = q[front++];
        w++;                     /* 出队一个结点，本层计数加 1 */
        if (p->lchild) q[rear++] = p->lchild;
        if (p->rchild) q[rear++] = p->rchild;
        if (front > last) {      /* 本层结点全部出队 */
            if (w > maxw) maxw = w;
            w = 0;
            last = rear - 1;     /* 队尾即下一层的最后一个结点 */
        }
    }
    return maxw;
}`,
    },
    answerText:
      '**(1) 设计思想**：按层遍历（BFS）二叉树并"分层计数"。借助队列实现层序遍历，用变量 last 记录当前层最后一个结点在队列中的下标：每当出队指针 front 越过 last，说明一层恰好处理完毕，将本层计数 w 与历史最大宽度 maxw 比较，并把 last 更新为当前队尾元素的下标（即下一层的最后一个结点）。全部结点处理完毕后，maxw 即为二叉树的宽度。\n**(2) C 语言描述**：见上方代码。\n**(3) 复杂度**：每个结点进队、出队各一次，时间复杂度 O(n)；辅助空间为队列，最坏情况（最宽一层约 n/2 个结点）为 O(n)，另用常数个变量，空间复杂度 O(n)。',
    explanation:
      '"分层处理"是层序遍历最重要的扩展模式：last 指针法、双队列法、按层计数法殊途同归，核心都是给 BFS 加上"层边界"信息。另一种可行解法是先序递归遍历时传入层数 level，用数组 count[level]++ 统计各层结点数，时间同为 O(n)、空间 O(h)（递归栈）加 O(宽度)（计数数组）。相比之下队列迭代法不依赖递归深度，更为稳妥。阅卷采分点：分层机制的正确描述（5 分）、代码中 last 的更新时机（6 分）、复杂度结论（2 分）。',
    visual: {
      kind: 'flow',
      title: '层序遍历求宽度：队列 + last 指针分层计数',
      nodes: [
        { id: 's', label: '根 T 入队\nlast=w=maxw=0', type: 'start' },
        { id: 'p1', label: '出队 p，w++\np 的孩子入队', type: 'proc' },
        { id: 'c1', label: 'front > last？', type: 'cond' },
        { id: 'p2', label: '本层出完：\nmaxw 与 w 取大', type: 'proc' },
        { id: 'p3', label: 'w 清零，\nlast = rear−1', type: 'proc' },
        { id: 'c2', label: 'front < rear？', type: 'cond' },
        { id: 'e', label: '返回 maxw\n时间 O(n)\n空间 O(n)', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'p1' },
        { from: 'p1', to: 'c1' },
        { from: 'c1', to: 'p1', label: '否：继续出队' },
        { from: 'c1', to: 'p2', label: '是：本层结束' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'c2' },
        { from: 'c2', to: 'p1', label: '是：处理下一层' },
        { from: 'c2', to: 'e', label: '否：队空' },
      ],
    },
  },
  {
    id: 'q-2024-42',
    year: 2024,
    number: 42,
    subject: 'ds',
    type: 'application',
    topic: '最短路径',
    difficulty: 3,
    source: 'adapted',
    templateId: 'ds-dijkstra',
    score: 10,
    question:
      '已知无向带权图 G：顶点集 V = {v0, v1, v2, v3, v4, v5}，边集 E = {(v0,v1,4), (v0,v2,1), (v1,v2,2), (v1,v3,3), (v2,v3,6), (v3,v4,2), (v3,v5,6), (v4,v5,1)}，边按（顶点, 顶点, 权值）描述。（原题带图，此处以集合描述。）\n(1) 用矩阵描述 G 的邻接矩阵（无边处记 ∞）；（2 分）\n(2) 用 Dijkstra 算法求 v0 到其余各顶点的最短路径，写出每一轮选定顶点后 dist[] 数组的状态；（5 分）\n(3) 给出 v0 到 v1、v3、v5 的最短路径（顶点序列）及路径长度。（3 分）',
    answerText:
      '**(1)** 邻接矩阵（对称，对角线为 0）：\nv0 行：0, 4, 1, ∞, ∞, ∞\nv1 行：4, 0, 2, 3, ∞, ∞\nv2 行：1, 2, 0, 6, ∞, ∞\nv3 行：∞, 3, 6, 0, 2, 6\nv4 行：∞, ∞, ∞, 2, 0, 1\nv5 行：∞, ∞, ∞, 6, 1, 0\n**(2)** Dijkstra 从 v0 出发，每轮选取 dist 最小且尚未确定的顶点并松弛其邻接点：\n初始 dist = [0, 4, 1, ∞, ∞, ∞]\n第 1 轮选 v2（dist=1）：更新 v1 = min(4, 1+2) = 3，v3 = 1+6 = 7 → [0, 3, 1, 7, ∞, ∞]\n第 2 轮选 v1（dist=3）：更新 v3 = min(7, 3+3) = 6 → [0, 3, 1, 6, ∞, ∞]\n第 3 轮选 v3（dist=6）：更新 v4 = 6+2 = 8，v5 = 6+6 = 12 → [0, 3, 1, 6, 8, 12]\n第 4 轮选 v4（dist=8）：更新 v5 = min(12, 8+1) = 9 → [0, 3, 1, 6, 8, 9]\n第 5 轮选 v5（dist=9）：数组不再变化。\n**(3)** v0→v1：路径 v0, v2, v1，长度 3；v0→v3：路径 v0, v2, v1, v3，长度 6；v0→v5：路径 v0, v2, v1, v3, v4, v5，长度 9。',
    explanation:
      'Dijkstra 是基于贪心策略的单源最短路径算法：每轮把"当前 dist 最小"的未确定顶点加入集合 S，其 dist 值即被最终确定，再用该顶点松弛（更新）其邻接点的 dist。算法要求边权非负，否则"贪心选择后不再改变"的前提被破坏。手工模拟时务必逐轮写清"选了谁、更新了谁"，这既是正确性的自检手段，也是阅卷采分点；路径本身可通过记录每个顶点的前驱回溯得到。',
    visual: {
      kind: 'graph',
      title: 'Dijkstra 从 v0 出发：加入顺序 v2→v1→v3→v4→v5',
      nodes: [
        { id: 'v0', x: 8, y: 50 },
        { id: 'v1', x: 38, y: 14 },
        { id: 'v2', x: 38, y: 86 },
        { id: 'v3', x: 64, y: 48 },
        { id: 'v4', x: 90, y: 84 },
        { id: 'v5', x: 90, y: 12 },
      ],
      edges: [
        { from: 'v0', to: 'v1', w: 4 },
        { from: 'v0', to: 'v2', w: 1 },
        { from: 'v1', to: 'v2', w: 2 },
        { from: 'v1', to: 'v3', w: 3 },
        { from: 'v2', to: 'v3', w: 6 },
        { from: 'v3', to: 'v4', w: 2 },
        { from: 'v3', to: 'v5', w: 6 },
        { from: 'v4', to: 'v5', w: 1 },
      ],
      steps: [
        {
          activeNodes: ['v0'],
          labels: { v1: '4', v2: '1', v3: '∞', v4: '∞', v5: '∞' },
          note: '初始化（S={v0}）：dist=[0,4,1,∞,∞,∞]，无直连边记 ∞',
        },
        {
          activeNodes: ['v0', 'v2'],
          activeEdges: ['v0-v2'],
          labels: { v2: '1定', v1: '4→3', v3: '∞→7' },
          note: '第 1 轮选 v2（1）入 S；松弛：dist[v1]=min(4,1+2)=3，dist[v3]=1+6=7',
        },
        {
          activeNodes: ['v0', 'v2', 'v1'],
          activeEdges: ['v0-v2', 'v1-v2'],
          labels: { v1: '3定', v3: '7→6' },
          note: '第 2 轮选 v1（3）入 S；松弛：dist[v3]=min(7,3+3)=6',
        },
        {
          activeNodes: ['v0', 'v2', 'v1', 'v3'],
          activeEdges: ['v0-v2', 'v1-v2', 'v1-v3'],
          labels: { v3: '6定', v4: '∞→8', v5: '∞→12' },
          note: '第 3 轮选 v3（6）入 S；松弛：dist[v4]=6+2=8，dist[v5]=6+6=12',
        },
        {
          activeNodes: ['v0', 'v2', 'v1', 'v3', 'v4'],
          activeEdges: ['v0-v2', 'v1-v2', 'v1-v3', 'v3-v4'],
          labels: { v4: '8定', v5: '12→9' },
          note: '第 4 轮选 v4（8）入 S；松弛：dist[v5]=min(12,8+1)=9',
        },
        {
          activeNodes: ['v0', 'v2', 'v1', 'v3', 'v4', 'v5'],
          activeEdges: ['v0-v2', 'v1-v2', 'v1-v3', 'v3-v4', 'v4-v5'],
          labels: { v5: '9定' },
          note: '第 5 轮选 v5（9），S 收齐。最短路：v0,v2,v1（3）；v0,v2,v1,v3（6）；v0,v2,v1,v3,v4,v5（9）',
        },
      ],
    },
  },
  {
    id: 'q-2024-43',
    year: 2024,
    number: 43,
    subject: 'co',
    type: 'application',
    topic: '数据表示与运算',
    difficulty: 3,
    source: 'adapted',
    templateId: 'co-complement',
    score: 13,
    question:
      '阅读如下 C 程序段（32 位编译环境：int 为 32 位补码整数，float 为 IEEE 754 单精度浮点数）：\n(1) 第一条 printf 的输出是什么？从补码运算的角度解释原因；（5 分）\n(2) 第二条 printf 的输出是什么？从二进制表示的角度解释 0.1、0.2、0.3 参与运算时发生了什么；（5 分）\n(3) 给出浮点数比较的正确做法并说明理由。（3 分）',
    code: {
      lang: 'c',
      text: `int a = 2147483647;
a = a + 1;
printf("%d\\n", a);          /* 输出 1 */

float x = 0.1f, y = 0.2f, z = 0.3f;
if (x + y == z)
    printf("YES\\n");         /* 输出 2 */
else
    printf("NO\\n");`,
    },
    answerText:
      '**(1)** 输出 −2147483648。2147483647 = 2^31 − 1，补码为 0x7FFF FFFF；加 1 后按模 2^32 运算得 0x8000 0000，该编码在补码体系中表示最小负数 −2^31。有符号整数加法溢出在补码机器上不是错误而是"回绕"：最高位产生的进位被自然丢弃，剩余 32 位按补码重新解释。\n**(2)** 输出 NO。0.1、0.2、0.3 的二进制表示都是无限循环小数（例如 0.1 = 0.000110011…B），单精度格式连同隐含位只有 24 位有效数字，存入 x、y、z 时各自被舍入为最接近的可表示数，机器值都不等于精确的十进制值；x + y 的运算结果又经历一次对阶与舍入。于是 x + y 的机器值与 z 的机器值在末位上不相等，"=="逐位比较的结果为假，输出 NO。\n**(3)** 正确做法是用误差容忍度比较：判断 |(x + y) − z| < ε（ε 为问题允许的误差限，如 10^-6）。因为浮点格式只能精确表示分母为 2 的幂的小数，几乎所有十进制小数都只能近似表示，相等判断必须以"距离足够近"代替"逐位相同"。',
    explanation:
      '本题把"定点数的表示范围"与"浮点数的表示精度"两个考点合并在一段 C 程序中：整数溢出是环绕的、不报错；浮点误差是系统性的、不可回避的。第 (2) 问的三个采分点：无限循环小数、24 位有效数字的截断舍入、运算结果的再次舍入。工程实践与考试结论一致：浮点数不能用 == 直接比较，0.1 + 0.2 != 0.3 的根源在于表示能力而非运算逻辑。',
    visual: {
      kind: 'flow',
      title: '整数回绕与浮点舍入：printf 1 输出 −2147483648，printf 2 输出 NO',
      nodes: [
        { id: 's', label: 'int a=2^31−1\n补码 7FFF FFFF', type: 'start' },
        { id: 'p1', label: 'a+1 模 2^32 回绕\n最高位进位丢弃', type: 'proc' },
        { id: 'p2', label: '0x8000 0000\n按补码 = −2^31', type: 'proc' },
        { id: 'p3', label: 'printf 输出\n−2147483648', type: 'proc' },
        { id: 'c1', label: 'printf 2：\nx+y 与 z？', type: 'cond' },
        { id: 'p4', label: '0.1/0.2/0.3\n二进制无限循环', type: 'proc' },
        { id: 'p5', label: '存入 float 已舍入\nx+y 计算再舍入', type: 'proc' },
        { id: 'p6', label: '误差累积\n逐位比较不可靠', type: 'proc' },
        { id: 'c2', label: 'x+y == z？', type: 'cond' },
        { id: 'n1', label: '输出 NO（本题）', type: 'end' },
        { id: 'p7', label: '比较正确做法：\n|(x+y)−z| < ε', type: 'proc' },
        { id: 'e', label: 'ε 为允许误差限', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'p1' },
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'c1', label: '下一条 printf' },
        { from: 'c1', to: 'p4', label: '逐位比较' },
        { from: 'p4', to: 'p5' },
        { from: 'p5', to: 'p6' },
        { from: 'p6', to: 'c2' },
        { from: 'c2', to: 'n1', label: '假（本题）' },
        { from: 'c2', to: 'p7', label: '真：也是侥幸' },
        { from: 'p7', to: 'e' },
      ],
    },
  },
  {
    id: 'q-2024-44',
    year: 2024,
    number: 44,
    subject: 'co',
    type: 'application',
    topic: 'Cache 计算',
    difficulty: 3,
    source: 'real',
    templateId: 'co-cache-split',
    score: 10,
    question:
      '某计算机主存地址为 24 位，按字节编址。Cache 数据区容量为 8 KB，块大小 16 B，采用直接映射方式；访问 Cache 命中需要 1 个时钟周期，不命中时本次访问共需 21 个时钟周期，Cache 命中率为 95%。\n(1) 主存地址应如何划分？给出标记（Tag）、Cache 行号、块内偏移各自占的位数；（3 分）\n(2) 主存地址 12345H 映射到 Cache 的哪一行？该行中应保存的 Tag 是多少？（4 分）\n(3) 计算该系统的平均访存时间（以时钟周期计）。（3 分）',
    answerText:
      '**(1)** 块大小 16 B = 2^4 B，块内偏移 4 位；Cache 共 8 KB / 16 B = 512 行 = 2^9，行号 9 位；Tag = 24 − 9 − 4 = 11 位。地址格式：Tag(11 位) | 行号(9 位) | 块内偏移(4 位)。\n**(2)** 主存块号 = 12345H >> 4 = 1234H（十进制 4660）。直接映射行号 = 块号 mod 512 = 4660 mod 512 = 52，即映射到第 52 行；Tag = 块号的高位 = 4660 >> 9 = 9。访问该地址时取出第 52 行保存的 Tag 与 9 比较，相等且有效位为 1 即命中。\n**(3)** 平均访存时间 = 95% × 1 + 5% × 21 = 0.95 + 1.05 = 2 个时钟周期。',
    explanation:
      '直接映射的地址划分"三步走"：先由块大小确定块内偏移位数，再由 Cache 总行数确定行号位数，剩余高位全部作为 Tag。第 (2) 问用"块号 mod 行数"求目标行，是直接映射"每个主存块只能进入唯一行"的直接推论；注意题目地址 12345H 的低 4 位 5H 是块内偏移，不参与行号计算。第 (3) 问的口径是"不命中时本次访问共 21 拍"（已包含失败的 Cache 查找），因此直接加权即可，无需再写成 1 + 20 的形式。',
    visual: {
      kind: 'flow',
      title: '直接映射地址三段拆分 + 12345H 定位 + 平均访存 2 拍',
      nodes: [
        { id: 's', label: '主存 24 位\n直接映射 Cache 8KB\n块 16B，命中 95%', type: 'start' },
        { id: 'p1', label: '块内偏移 = log₂16\n= 4 位', type: 'proc' },
        { id: 'p2', label: '行数 8KB÷16B=512\n行号占 9 位', type: 'proc' },
        { id: 'p3', label: 'Tag = 24−9−4\n= 11 位', type: 'proc' },
        { id: 'p4', label: '块号 = 12345H≫4\n= 1234H = 4660', type: 'proc' },
        { id: 'p5', label: '映射行 = 4660\nmod 512 = 52 行', type: 'proc' },
        { id: 'p6', label: 'Tag = 4660≫9\n= 9（存于 52 行）', type: 'proc' },
        { id: 'c1', label: '取 52 行：Tag=9\n且有效位为 1？', type: 'cond' },
        { id: 'h1', label: '命中：1 拍', type: 'proc' },
        { id: 'm1', label: '不命中：21 拍', type: 'proc' },
        { id: 'p7', label: '加权：95%×1 +\n5%×21 = 2 拍', type: 'proc' },
        { id: 'e', label: '平均访存 2 拍', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'p1' },
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5' },
        { from: 'p5', to: 'p6' },
        { from: 'p6', to: 'c1' },
        { from: 'c1', to: 'h1', label: '是' },
        { from: 'c1', to: 'm1', label: '否' },
        { from: 'h1', to: 'p7' },
        { from: 'm1', to: 'p7' },
        { from: 'p7', to: 'e' },
      ],
    },
  },
  {
    id: 'q-2024-45',
    year: 2024,
    number: 45,
    subject: 'os',
    type: 'application',
    topic: '调度计算',
    difficulty: 2,
    source: 'real',
    templateId: 'os-schedule-metrics',
    score: 8,
    question:
      '某单处理机系统采用不可抢占式短作业优先（SJF）调度算法。时刻 0 作业 P1 到达（估计运行 8 个单位时间）；时刻 1 作业 P2 到达（4 个单位）；时刻 2 作业 P3 到达（9 个单位）；时刻 3 作业 P4 到达（5 个单位）。\n(1) 写出 4 个作业的调度次序，并给出每段的起止时刻；（4 分）\n(2) 计算每个作业的周转时间以及平均周转时间。（4 分）',
    answerText:
      '**(1)** t = 0 时仅 P1 就绪，先运行 P1（0 ~ 8）。t = 8 时刻就绪队列中有 P2、P3、P4（估计运行时间 4、9、5），按 SJF 依次调度：P2（8 ~ 12）→ P4（12 ~ 17）→ P3（17 ~ 26）。\n**(2)** 周转时间 = 完成时刻 − 到达时刻：P1 = 8 − 0 = 8；P2 = 12 − 1 = 11；P4 = 17 − 3 = 14；P3 = 26 − 2 = 24。平均周转时间 = (8 + 11 + 14 + 24) / 4 = 57 / 4 = 14.25 个单位时间。',
    explanation:
      '不可抢占 SJF 的解题关键是在"每个作业完成的时刻"重新审视就绪队列：P1 运行期间其余三个作业陆续到达，t = 8 时按估计时间 4 < 5 < 9 排出 P2 → P4 → P3 的次序。可以证明 SJF 在给定作业集合下平均等待时间（等价地平均周转时间）最小，这由交换论证得出：把更长的作业提前调度只会增加总等待时间；其代价是长作业可能饥饿。计算时务必用"完成时刻 − 到达时刻"，且 P3 的到达时刻是 2 而不是 0。',
  },
  {
    id: 'q-2024-46',
    year: 2024,
    number: 46,
    subject: 'os',
    type: 'application',
    topic: '位示图',
    difficulty: 2,
    source: 'real',
    templateId: 'os-bitmap',
    score: 7,
    question:
      '某文件系统采用位示图管理磁盘空闲空间：位示图按 32 位的字组织，每一位对应一个物理盘块，块号从 0 开始，第 i 字的第 j 位（i、j 均从 0 开始计）对应块号 32i + j。磁盘共有 4096 个盘块。\n(1) 位示图共需要多少个字？（2 分）\n(2) 块号 500 对应位示图中哪个字的哪一位？（2 分）\n(3) 与空闲盘块链法相比，位示图法管理空闲空间的主要优点是什么？（3 分）',
    answerText:
      '**(1)** 4096 / 32 = 128，位示图共需 128 个字。\n**(2)** 500 = 32 × 15 + 20，故块号 500 对应第 15 字的第 20 位（均从 0 计）。\n**(3)** ① 位示图可常驻内存，分配和回收盘块时直接将相应位清 0 / 置 1，不需要额外的磁盘 I/O；② 可以方便地寻找一组连续的空闲块，支持文件的连续分配与成组分配，而链表法的空闲块在物理上不连续、需逐个摘链；③ 所占空间大小固定、与盘块总数成正比，管理简单。',
    explanation:
      '位示图把"盘块使用情况"压缩为位向量，位号与块号的换算公式（字号 = 块号 ÷ 字长，位号 = 块号 mod 字长）是必考计算，注意题目中 i、j 的起始编号约定（本题均从 0 开始，若从 1 开始则结果要相应加 1）。与链表法对比时，采分点集中在"常驻内存、免磁盘 I/O"与"易于寻找连续空闲块"两条；链表法的优势是不占额外空间（指针复用空闲块本身），两者常放在一起考查。',
  },
  {
    id: 'q-2024-47',
    year: 2024,
    number: 47,
    subject: 'cn',
    type: 'application',
    topic: 'DHCP 与 DNS',
    difficulty: 3,
    source: 'adapted',
    score: 9,
    question:
      '某以太网局域网内接有主机 H、DHCP 服务器 D 和路由器 R（R 为该局域网的默认网关，其另一个接口连接 Internet 上的 Web 服务器 S，S 的域名为 www.test.com）。主机 H 刚接入该局域网（没有 IP 地址，无任何缓存），用户随即在浏览器地址栏输入 http://www.test.com 访问 S。（拓扑按文字描述，原题带图。）\n(1) 说明 H 获取 IP 地址（及子网掩码、默认网关等配置信息）的过程中，H 与 D 之间依次交互的 4 种 DHCP 报文，以及这些报文的封装与传输方式；（4 分）\n(2) H 随后解析域名 www.test.com：说明 H 发出的 DNS 查询使用的传输层协议与端口号，以及主机向本地域名服务器查询的典型方式；（2 分）\n(3) H 向 S 发送 TCP 连接建立请求（SYN 报文段）时，H 发出的以太网帧的源/目的 MAC 地址各是什么？IP 分组的源/目的 IP 地址各是什么？（设 H 已通过 ARP 获得 R 的 MAC 地址）（3 分）',
    answerText:
      '**(1)** ① H 广播 DHCPDISCOVER（发现）报文（封装在 UDP 中，目的端口 67，IP 目的地址 255.255.255.255）；② 网络中的 DHCP 服务器 D 以 DHCPOFFER（提供）报文回应，给出可用的 IP 地址及配置参数；③ H 从（可能多个）OFFER 中选择一个，广播 DHCPREQUEST（请求）报文正式请求该配置；④ D 回送 DHCPACK（确认）报文，H 取得 IP 地址、子网掩码、默认网关与 DNS 服务器地址等配置。所获地址有租用期限制，到期前需续租。\n**(2)** DNS 查询报文封装在 UDP 中传输，使用熟知端口 53。主机向本地域名服务器的查询通常采用递归查询：本地服务器代替 H 继续向根/顶级/权限域名服务器查询（本地服务器与各级服务器之间多为迭代查询），最终把解析结果返回 H。\n**(3)** 帧的源 MAC = H 自己的 MAC 地址；因 S 位于 Internet 另一端、与 H 不在同一网络，帧的目的 MAC = 默认网关 R 的 MAC 地址。IP 分组的源 IP = H 的 IP 地址，目的 IP = S 的 IP 地址（由域名解析得到）。IP 地址端到端保持不变，MAC 地址每经过一个路由器就更换一次，这体现了"IP 负责主机到主机的端到端通信、链路层负责逐跳交付"的分工。',
    explanation:
      '本题串起"主机开机上网"的完整协议链：DHCP（获得配置）→ DNS（解析域名）→ ARP（获得网关 MAC）→ TCP/HTTP（访问服务器）。三组核心采分点：DHCP 四步交互（DORA）与 UDP 67/68 端口、DNS 的 UDP 53 与递归查询方式、帧与 IP 分组中地址的分工（MAC 逐跳变、IP 端到端不变）。第 (3) 问最常见的错误是把 S 的 MAC 写入帧目的地址——S 不在本局域网，帧只能交给网关 R。',
    visual: {
      kind: 'seq',
      title: 'H 从入网到访问 S：DHCP（DORA）→ DNS → TCP 三次握手',
      actors: ['主机 H', 'DHCP 服务器 D', '本地域名服务器', 'Web 服务器 S'],
      messages: [
        { from: '主机 H', to: 'DHCP 服务器 D', label: '① DHCPDISCOVER（广播，UDP 目的端口 67）' },
        { from: 'DHCP 服务器 D', to: '主机 H', label: '② DHCPOFFER（提供 IP 及配置参数）' },
        { from: '主机 H', to: 'DHCP 服务器 D', label: '③ DHCPREQUEST（广播确认所选配置）' },
        { from: 'DHCP 服务器 D', to: '主机 H', label: '④ DHCPACK（含掩码、网关、DNS 地址）' },
        { from: '主机 H', to: '本地域名服务器', label: '⑤ DNS 查询 www.test.com（UDP 53，递归）' },
        { from: '本地域名服务器', to: '主机 H', label: '⑥ DNS 应答：返回 S 的 IP 地址' },
        { from: '主机 H', to: 'Web 服务器 S', label: '⑦ TCP SYN（帧目的 MAC=网关 R；IP 目的=S）' },
        { from: 'Web 服务器 S', to: '主机 H', label: '⑧ SYN+ACK（IP 端到端，MAC 逐跳更换）' },
        { from: '主机 H', to: 'Web 服务器 S', label: '⑨ ACK：连接建立，随后 HTTP 请求' },
      ],
    },
  },
]
