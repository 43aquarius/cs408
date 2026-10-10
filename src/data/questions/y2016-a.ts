import type { Question } from '../types'

/** 2016 年 408 统考真题 · 综合应用题 41–47（共 70 分）
 * 数据结构 41–42（23 分）· 组成原理 43–44（23 分）· 操作系统 45–46（15 分）· 网络 47（9 分）
 */
export const y2016a: Question[] = [
  {
    id: 'q-2016-41',
    year: 2016,
    number: 41,
    subject: 'ds',
    type: 'application',
    topic: '中序线索二叉树',
    difficulty: 3,
    source: 'real',
    score: 13,
    question:
      '已知二叉树采用二叉链表存储，结点结构为（lchild, ltag, data, rtag, rchild）。其中 ltag/rtag 为 0 时表示 lchild/rchild 是孩子指针，为 1 时是线索（分别指向该结点的中序前驱与中序后继）。\n(1) 给出中序线索化（建立中序线索二叉树）的算法思想；（4 分）\n(2) 写出中序线索化的算法（利用全局指针 pre 记录刚访问过的结点），关键之处给出注释；（5 分）\n(3) 写出在中序线索二叉树中求某结点中序后继的算法，并说明如何利用它实现既不用栈、也不递归的中序遍历。（4 分）',
    code: {
      lang: 'c',
      text: `typedef struct ThrNode {
    int data;
    struct ThrNode *lchild, *rchild;
    int ltag, rtag;          /* 0: 孩子  1: 线索 */
} ThrNode, *ThrTree;

ThrNode *pre = NULL;         /* 全局：刚访问过的结点 */

void inThread(ThrTree p) {   /* 中序线索化 */
    if (p == NULL) return;
    inThread(p->lchild);     /* 1. 线索化左子树 */
    if (p->lchild == NULL) { /* 2. 建前驱线索 */
        p->ltag = 1;
        p->lchild = pre;
    }
    if (pre != NULL && pre->rchild == NULL) {
        pre->rtag = 1;       /* 3. pre 的后继就是 p */
        pre->rchild = p;
    }
    pre = p;                 /* 4. 更新 pre */
    inThread(p->rchild);     /* 5. 线索化右子树 */
}

ThrNode *next(ThrNode *p) {  /* 求中序后继 */
    if (p->rtag == 1) return p->rchild;   /* 线索直接给出 */
    ThrNode *q = p->rchild;  /* 右子树最左结点 */
    while (q->ltag == 0) q = q->lchild;
    return q;
}`,
    },
    answerText:
      '**(1) 思想**：按中序次序遍历二叉树，访问每个结点时，若其左指针为空则改为指向前驱（ltag=1）；同时检查刚访问过的前一结点 pre：若其右指针为空则改为指向当前结点（后继，rtag=1）。遍历结束时整棵树的中序次序被"穿"成一条线索链。\n**(2) 算法**：见代码 inThread，五个步骤次序不能乱——先左子树，再建当前结点的前驱线索与前驱结点的后继线索，然后更新 pre，最后右子树。\n**(3) 求后继**：见代码 next——rtag=1 时线索直接就是后继；否则后继是右子树中"最左下"的结点。遍历时先找到中序起点（根的最左下结点），反复求后继直到为空，全程无需栈、无需递归，空间复杂度 O(1)（不含线索本身）。',
    explanation:
      '线索化是"利用 n+1 个空指针域"的典范：n 个结点的二叉链表有 2n 个指针，实际用掉 n−1 个，剩 n+1 个空链域恰好可存前驱/后继线索。判卷关键点：①pre 必须在建立前驱线索之后再指向当前结点；②线索化中"当前结点的后继线索"是借下一结点之手（或说 pre 之手）建立的，两结点配合完成；③求后继的两种情形（线索 vs 右子树最左下）必须都写。',
    visual: {
      kind: 'tree',
      title: '中序线索化示例：A(B(D,E),C(,F))',
      steps: [
        {
          nodes: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B', parent: 'A' }, { id: 'C', label: 'C', parent: 'A' },
            { id: 'D', label: 'D', parent: 'B' }, { id: 'E', label: 'E', parent: 'B' },
            { id: 'F', label: 'F', parent: 'C' },
          ],
          note: '示例树：中序次序 D B E A C F；pre 初值为空，按中序逐个访问并利用空链域建线索',
        },
        {
          nodes: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B', parent: 'A' }, { id: 'C', label: 'C', parent: 'A' },
            { id: 'D', label: 'D', parent: 'B' }, { id: 'E', label: 'E', parent: 'B' },
            { id: 'F', label: 'F', parent: 'C' },
          ],
          highlight: ['D'],
          note: '访问 D：左指针空 → ltag=1、lchild=pre（此刻 pre 为空）；随后 pre←D',
        },
        {
          nodes: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B', parent: 'A' }, { id: 'C', label: 'C', parent: 'A' },
            { id: 'D', label: 'D', parent: 'B' }, { id: 'E', label: 'E', parent: 'B' },
            { id: 'F', label: 'F', parent: 'C' },
          ],
          highlight: ['D', 'B'],
          note: '访问 B：pre=D 右指针空 → rtag=1、D 的 rchild 指向 B（后继线索）；B 孩子俱全，pre←B',
        },
        {
          nodes: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B', parent: 'A' }, { id: 'C', label: 'C', parent: 'A' },
            { id: 'D', label: 'D', parent: 'B' }, { id: 'E', label: 'E', parent: 'B' },
            { id: 'F', label: 'F', parent: 'C' },
          ],
          highlight: ['B', 'E'],
          note: '访问 E：E 左指针空 → ltag=1、lchild=pre(B)（前驱线索）；B 右孩子非空不必处理，pre←E',
        },
        {
          nodes: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B', parent: 'A' }, { id: 'C', label: 'C', parent: 'A' },
            { id: 'D', label: 'D', parent: 'B' }, { id: 'E', label: 'E', parent: 'B' },
            { id: 'F', label: 'F', parent: 'C' },
          ],
          highlight: ['E', 'A'],
          note: '访问 A：pre=E 右指针空 → rtag=1、E 的 rchild 指向 A（后继线索）；A 孩子俱全，pre←A',
        },
        {
          nodes: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B', parent: 'A' }, { id: 'C', label: 'C', parent: 'A' },
            { id: 'D', label: 'D', parent: 'B' }, { id: 'E', label: 'E', parent: 'B' },
            { id: 'F', label: 'F', parent: 'C' },
          ],
          highlight: ['A', 'C'],
          note: '访问 C：C 左指针空 → ltag=1、lchild=pre(A)（前驱线索）；A 右孩子非空，pre←C',
        },
        {
          nodes: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B', parent: 'A' }, { id: 'C', label: 'C', parent: 'A' },
            { id: 'D', label: 'D', parent: 'B' }, { id: 'E', label: 'E', parent: 'B' },
            { id: 'F', label: 'F', parent: 'C' },
          ],
          highlight: ['C', 'F'],
          note: '访问 F：F 左指针空 → ltag=1、lchild=pre(C)；遍历结束，最末结点 F 的后继为空',
        },
      ],
    },
  },
  {
    id: 'q-2016-42',
    year: 2016,
    number: 42,
    subject: 'ds',
    type: 'application',
    topic: '邻接矩阵的幂',
    difficulty: 3,
    source: 'real',
    score: 10,
    question:
      '设 A 是有向图 G = (V, E) 的邻接矩阵，A[i][j] = 1 表示存在从顶点 i 到顶点 j 的一条有向边，否则为 0。顶点编号为 1～4，且 A[1][2] = A[2][3] = A[2][4] = A[3][4] = A[4][1] = 1，其余元素为 0。\n(1) 说明矩阵 A^k（A 的 k 次幂，按普通矩阵乘法）中元素 A^k[i][j] 的含义；（4 分）\n(2) 计算 A^2，并指出从顶点 1 出发长度恰好为 2 的路径有几条，各是什么；（4 分）\n(3) 若把矩阵改为布尔运算（乘=与、加=或）再求幂，元素含义有何变化？（2 分）',
    answerText:
      '**(1)** A^k[i][j] 表示**从顶点 i 到顶点 j 的、长度恰好为 k 的（有向）路径的条数**（路径允许顶点重复）。归纳证明：k = 1 时即邻接矩阵定义；若 A^k[i][j] = Σ_t A^(k-1)[i][t]·A[t][j]，每项非零当且仅当"存在 i 到 t 的长 k−1 路径"且"存在边 t→j"，枚举中转点 t 恰好枚举了所有长 k 路径的倒数第二个顶点。\n**(2)** A^2[1][3] = A[1][2]A[2][3] = 1，A^2[1][4] = A[1][2]A[2][4] = 1，其余 A^2[1][*] 为 0；此外 A^2[3][1] = A[3][4]A[4][1] = 1，A^2[2][2] = A[2][3]A[3][2]? = 0，A^2[2][1]? A[2][3]A[3][1]=0、A[2][4]A[4][1] = 1 → A^2[2][1] = 1。故从顶点 1 出发长度恰为 2 的路径有 **2 条**：1→2→3 与 1→2→4。\n**(3)** 布尔幂只回答"存在性"：元素为 1 表示存在长度为 k 的路径，为 0 表示不存在，不再反映条数。反复布尔自乘可求可达性（传递闭包）。',
    explanation:
      '本题考查图与线性代数的结合，是近年分析题的典型风格。要点有三：①A^k 计数的路径允许顶点/边重复（如 1→2→1→2 属于长 3 路径），与"简单路径"不同；②k 的意义是"恰好"，不是"不超过"——不超过 k 需要逐次累加 A + A² + … + A^k；③布尔化之后从计数退化为存在性判断。求 A² 时逐元素按公式展开即可，注意矩阵乘法不可交换。',
    visual: {
      kind: 'graph',
      title: 'A 与 A²：长度为 2 的路径',
      nodes: [
        { id: '1', x: 15, y: 25 },
        { id: '2', x: 50, y: 12 },
        { id: '3', x: 85, y: 45 },
        { id: '4', x: 50, y: 80 },
      ],
      edges: [
        { from: '1', to: '2', directed: true },
        { from: '2', to: '3', directed: true },
        { from: '2', to: '4', directed: true },
        { from: '3', to: '4', directed: true },
        { from: '4', to: '1', directed: true },
        { from: '1', to: '3', directed: true },
        { from: '1', to: '4', directed: true },
        { from: '2', to: '1', directed: true },
        { from: '3', to: '1', directed: true },
        { from: '4', to: '2', directed: true },
      ],
      steps: [
        {
          activeEdges: ['1-2', '2-3', '2-4', '3-4', '4-1'],
          note: '邻接矩阵 A 的 5 条有向边：A[i][j]=1 当且仅当存在边 i→j',
        },
        {
          activeEdges: ['1-2', '2-3', '2-4', '1-3', '1-4'],
          labels: { '1': '源点', '3': 'A²[1][3]=1', '4': 'A²[1][4]=1' },
          note: 'A²[1][j]=Σt A[1][t]·A[t][j]：从 1 出发长度恰为 2 的路径共 2 条——1→2→3 与 1→2→4',
        },
        {
          activeEdges: ['2-1', '3-1', '4-2'],
          labels: { '2': 'A²[2][1]=1', '3': 'A²[3][1]=1', '4': 'A²[4][2]=1' },
          note: '其余非零元：2→4→1、3→4→1、4→1→2；另有 A²[2][4]=1（路径 2→3→4，恰与原有边并存）',
        },
      ],
    },
  },
  {
    id: 'q-2016-43',
    year: 2016,
    number: 43,
    subject: 'co',
    type: 'application',
    topic: 'Cache 组相联',
    difficulty: 3,
    source: 'real',
    templateId: 'co-cache-split',
    score: 13,
    question:
      '某计算机主存地址为 20 位（最大 1 MB），按字节编址。Cache 数据区容量 16 KB，行长（块大小）32 B，采用 4 路组相联映射，替换算法为 LRU。\n(1) 写出主存地址的划分（标记、组号、块内地址各占多少位）；（4 分）\n(2) 设访问 Cache 需 20 ns，访问主存需 200 ns，某程序执行时 Cache 命中率为 95%（未命中时需先访主存装入块再访问）。求 Cache—主存层次的平均访问时间与访问效率；（5 分）\n(3) 简述写直达（write through）与写回（write back）两种写策略的差异及各自对一致性与速度的影响。（4 分）',
    answerText:
      '**(1)** 块内地址 = log₂32 = 5 位；Cache 总行数 = 16 KB ÷ 32 B = 512 行，4 路组相联 → 组数 = 512 ÷ 4 = 128 = 2^7，组号 7 位；标记 = 20 − 7 − 5 = **8 位**。地址结构：标记 8 位｜组号 7 位｜块内地址 5 位。\n**(2)** 平均访问时间 Ta = 0.95 × 20 + 0.05 × (20 + 200) = 19 + 11 = **30 ns**（未命中时探查 Cache 的 20 ns 与访主存 200 ns 串行）。访问效率 e = Tc / Ta = 20/30 ≈ **66.7%**。\n**(3)** 写直达：写命中时同时写 Cache 与主存，实现简单、一致性有保证，但每次写都要访问主存（常配写缓冲），写速度受主存限制。写回：只写 Cache，置脏位，块被替换时才写回主存，写速度快、主存带宽占用小，但存在不一致窗口，替换时可能多一次写回开销；通常配合写分配策略使用。',
    explanation:
      '组相联地址划分的固定顺序：先块内位数（由行长决定），再组号位数（由 Cache 容量 ÷ 行长 ÷ 路数决定），高位全部是标记。第(2)问要留意题设"未命中时间是否含 Cache 探查"，本题为 20+200 串行模型；也有教材用 0.95×20 + 0.05×200 = 29 ns 的并行模型，答题时写明所用公式即可。第(3)问的采分点是"一致性 vs 速度"的取舍与脏位的作用。',
    visual: {
      kind: 'flow',
      title: '4 路组相联：20 位地址拆分与平均访问时间',
      nodes: [
        { id: 's', label: '主存地址 20 位\n（1 MB，字节编址）', type: 'start' },
        { id: 'n1', label: '块内地址\n= log₂32 = 5 位', type: 'proc' },
        { id: 'n2', label: '总行数 = 16KB÷32B\n= 512 行', type: 'proc' },
        { id: 'n3', label: '组数=512÷4=128', type: 'proc' },
        { id: 'n4', label: '组号 = log₂128\n= 7 位', type: 'proc' },
        { id: 'n5', label: '标记 = 20−7−5\n= 8 位', type: 'proc' },
        { id: 'n6', label: '结构：标记8｜组号7｜块内5', type: 'proc' },
        { id: 'n7', label: 'Ta=0.95×20\n+0.05×(20+200)', type: 'proc' },
        { id: 'n8', label: '= 30 ns\n效率 20/30≈66.7%', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'n1' },
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3' },
        { from: 'n3', to: 'n4' },
        { from: 'n4', to: 'n5' },
        { from: 'n5', to: 'n6' },
        { from: 'n6', to: 'n7', label: '第(2)问' },
        { from: 'n7', to: 'n8' },
      ],
    },
  },
  {
    id: 'q-2016-44',
    year: 2016,
    number: 44,
    subject: 'co',
    type: 'application',
    topic: 'I/O 方式开销',
    difficulty: 3,
    source: 'real',
    score: 10,
    question:
      '某设备的数据传输率为 9.6 KB/s，CPU 主频为 60 MHz（即每秒 60M 个时钟周期）。现分别用三种方式实现该设备的输入：\n① 程序查询方式：每传送 1 个字节查询一次设备状态，每次查询平均执行 200 个时钟周期；\n② 中断方式：每传送 32 B 产生一次中断，每次中断服务（含现场保护与恢复）共需 1000 个时钟周期；\n③ DMA 方式：每次传送 4 KB 一块，DMA 预处理与后处理共需 2000 个时钟周期。\n(1) 分别计算三种方式下 CPU 用于该设备 I/O 的时间占 CPU 总时间的百分比；（7 分）\n(2) 由计算结果说明选择 I/O 方式的原则。（3 分）',
    answerText:
      '**(1)**\n① 查询方式：每秒传送 9.6 KB = 9600 次，每次 200 周期，共 9600 × 200 = 1.92M 周期，占比 = 1.92M / 60M = **3.2%**；\n② 中断方式：每秒中断 9600 / 32 = 300 次，每次 1000 周期，共 300 × 1000 = 0.3M 周期，占比 = **0.5%**；\n③ DMA 方式：每秒 9600 / 4096 ≈ 2.34 次，每次 2000 周期，共约 4688 周期，占比 ≈ 4688 / 60M ≈ **0.008%（约十万分之八）**。\n**(2)** 数据率越高、单次传送量越小，查询与中断的开销越大。查询方式 CPU 与设备串行工作，仅适合低速、简单的场合；中断方式按"块"减少介入次数，适合中低速设备；DMA 把 CPU 从逐字/逐块的控制中解放出来，只参与头尾两次管理，适合高速、大批量传输的设备。选择原则：**以数据率和数据量为标尺，让 CPU 的干预频率与设备速度匹配**。',
    explanation:
      '本题三问共用同一模型：占比 = 每秒传输次数 × 每次开销 ÷ 主频。易错点：①换算 4 KB = 4096 B 而不是 4000；②查询方式按字节、中断按 32 B 块、DMA 按 4 KB 块，"每次"的含义各不相同；③结果数量级（百分之几 → 千分之几 → 万分之几）正是三种方式效率差距的直观体现，最后的小结论常作为独立采分点。',
    visual: {
      kind: 'flow',
      title: '三种 I/O 方式的 CPU 开销对比',
      nodes: [
        { id: 's', label: '设备 9.6 KB/s\nCPU 主频 60 MHz', type: 'start' },
        { id: 'q1', label: '查询：每字节\n查一次状态', type: 'proc' },
        { id: 'q2', label: '9600 次/秒×200\n= 1.92M 周期', type: 'proc' },
        { id: 'q3', label: '占比 3.2%', type: 'end' },
        { id: 'z1', label: '中断：每 32 B\n一次中断', type: 'proc' },
        { id: 'z2', label: '300 次/秒×1000\n= 0.3M 周期', type: 'proc' },
        { id: 'z3', label: '占比 0.5%', type: 'end' },
        { id: 'd1', label: 'DMA：每 4 KB\n一块传送', type: 'proc' },
        { id: 'd2', label: '2.34 次/秒×2000\n≈ 4688 周期', type: 'proc' },
        { id: 'd3', label: '占比≈0.008%', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'q1' },
        { from: 'q1', to: 'q2' },
        { from: 'q2', to: 'q3' },
        { from: 's', to: 'z1' },
        { from: 'z1', to: 'z2' },
        { from: 'z2', to: 'z3' },
        { from: 's', to: 'd1' },
        { from: 'd1', to: 'd2' },
        { from: 'd2', to: 'd3' },
      ],
    },
  },
  {
    id: 'q-2016-45',
    year: 2016,
    number: 45,
    subject: 'os',
    type: 'application',
    topic: '银行家算法',
    difficulty: 3,
    source: 'real',
    templateId: 'os-banker',
    score: 7,
    question:
      '某系统有 A、B、C 三类资源，数量分别为 10、5、7。当前有 5 个进程，分配与最大需求如下：\nP0 已分 (0,1,0)、最大 (7,5,3)；P1 已分 (2,0,0)、最大 (3,2,2)；P2 已分 (3,0,2)、最大 (9,0,2)；P3 已分 (2,1,1)、最大 (2,2,2)；P4 已分 (0,0,2)、最大 (4,3,3)。\n(1) 计算当前剩余资源向量与各进程的需求（Need）矩阵；（2 分）\n(2) 判断当前状态是否安全，若安全给出一个安全序列；（3 分）\n(3) 若此时进程 P1 提出请求 (1,0,2)，系统能否立即满足？为什么？（2 分）',
    answerText:
      '**(1)** 剩余 Available = (10,5,7) − (7,2,7) = **(3,3,2)**；Need = Max − Allocation：P0 (7,4,3)、P1 (1,2,2)、P2 (6,0,0)、P3 (0,1,1)、P4 (4,3,1)。\n**(2) 安全**。试探：Available (3,3,2) 可满足 P1 (1,2,2) → P1 完成后 Available = (5,3,2)；可满足 P3 (0,1,1) → (7,4,3)；可满足 P4 (4,3,1) → (7,4,5)；可满足 P0 (7,4,3) → (7,5,5)；最后满足 P2 (6,0,0) → (10,5,7)。安全序列：**P1 → P3 → P4 → P0 → P2**（不唯一）。\n**(3)** 可以。先做安全性试探：预分配后 Available = (2,3,0)，P1 的 Allocation = (3,0,2)、Need = (0,2,0)；序列 P1 → P3 → P4 → P0 → P2 依然安全（(2,3,0) 先满足 P1 (0,2,0) → (5,3,2)，后续同上）。故按银行家算法可立即分配；若分配后找不到安全序列才拒绝。',
    explanation:
      '银行家算法的固定四步：算 Need → 找 Need ≤ Available 的进程 → 假定其完成并回收资源 → 重复直到全序列（安全）或卡死（不安全）。第(3)问必须先做"试探性分配 + 重新安全性检查"，不能只看请求是否 ≤ 剩余量——请求 (1,0,2) 同时满足"≤ Need (1,2,2)"与"≤ Available (3,3,2)"两个前提，第三关才是安全性。答题时把每一步的 Available 变化列成表，既不易错又是采分点。',
    visual: {
      kind: 'flow',
      title: '银行家算法：安全性检查逐轮回收',
      nodes: [
        { id: 's', label: '安全性检查\nWork=(3,3,2)', type: 'start' },
        { id: 'p1', label: 'P1:Need(1,2,2)', type: 'proc' },
        { id: 'p3', label: 'P3:Need(0,1,1)', type: 'proc' },
        { id: 'p4', label: 'P4:Need(4,3,1)', type: 'proc' },
        { id: 'p0', label: 'P0:Need(7,4,3)', type: 'proc' },
        { id: 'p2', label: 'P2:Need(6,0,0)', type: 'proc' },
        { id: 'e', label: '安全序列\nP1→P3→P4→P0→P2', type: 'end' },
        { id: 'r0', label: '第(3)问\nP1 请求(1,0,2)', type: 'start' },
        { id: 'r2', label: '请求≤Need(1,2,2)\n且≤可用(3,3,2)', type: 'proc' },
        { id: 'r3', label: '试分配后仍找到\n安全序列', type: 'proc' },
        { id: 'r4', label: '可立即分配', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'p1', label: 'Need≤Work' },
        { from: 'p1', to: 'p3', label: '回收后(5,3,2)' },
        { from: 'p3', to: 'p4', label: '(7,4,3)' },
        { from: 'p4', to: 'p0', label: '(7,4,5)' },
        { from: 'p0', to: 'p2', label: '(7,5,5)' },
        { from: 'p2', to: 'e', label: '全部完成' },
        { from: 'r0', to: 'r2' },
        { from: 'r2', to: 'r3' },
        { from: 'r3', to: 'r4' },
      ],
    },
  },
  {
    id: 'q-2016-46',
    year: 2016,
    number: 46,
    subject: 'os',
    type: 'application',
    topic: '读者写者问题',
    difficulty: 3,
    source: 'real',
    templateId: 'os-pv-model',
    score: 8,
    question:
      '某共享文件允许多个进程同时读，但任一进程写时必须独占（读写互斥、写写互斥、读读相容）。请用信号量机制解决这一"读者优先"的读者—写者问题。\n(1) 给出所需信号量与变量及其初值、含义；（3 分）\n(2) 写出读者进程与写者进程的同步算法（伪代码）；（4 分）\n(3) 指出该解法中写者可能遇到的问题。（1 分）',
    code: {
      lang: 'c',
      text: `int count = 0;            /* 正在读的读者数 */
semaphore mutex = 1;       /* 保护 count */
semaphore rw    = 1;       /* 读写互斥（对文件的访问权） */

reader:                     /* 读者进程 */
    while (TRUE) {
        P(mutex);
        if (count == 0) P(rw);  /* 第一个读者锁文件 */
        count++;
        V(mutex);
        读文件;
        P(mutex);
        count--;
        if (count == 0) V(rw);  /* 最后一个读者解锁 */
        V(mutex);
    }

writer:                     /* 写者进程 */
    while (TRUE) {
        P(rw);                 /* 与所有读者、写者互斥 */
        写文件;
        V(rw);
    }`,
    },
    answerText:
      '**(1)** 设整型变量 count（初值 0，记录当前正在读的读者数）；信号量 mutex（初值 1，保护对 count 的互斥修改）；信号量 rw（初值 1，实现对文件的读写互斥——读者整体与写者互斥）。\n**(2)** 算法见代码：第一个进入的读者执行 P(rw) 把写者挡在外面，最后一个退出的读者执行 V(rw) 归还访问权；中间的读者既不加锁也不解锁，从而实现"读读相容"。\n**(3)** 读者优先意味着只要还有读者在读，后续到达的读者可以源源不断地进入，写者可能长期等待而**饥饿**。改进方案是"写者优先/读写公平"：再设一个信号量 w = 1，读者进入前先 P(w)、读完 V(w)，使写者到达后能隔断后续读者。',
    explanation:
      '读者—写者是 PV 同步三大经典模型之一，核心技巧是"第一个来锁门、最后一个走解锁"，把"一群读者"对文件的占用统一为一个 rw 信号量。三个易错点：①count 的修改必须夹在 mutex 的 P/V 之间；②判断 count==0 必须在 count++ 之前（进入时）与 count-- 之后（退出时）分别检查；③写者只对 rw 做 P/V，绝不能碰 mutex，否则读者会被计数锁卡死。',
    visual: {
      kind: 'flow',
      title: '读者优先：count+mutex+rw 逻辑',
      nodes: [
        { id: 's', label: '读者写者（读优先）', type: 'start' },
        { id: 'a1', label: '读者：P(mutex)', type: 'proc' },
        { id: 'a2', label: 'count==0？', type: 'cond' },
        { id: 'a3', label: 'P(rw)\n第一个读者锁文件', type: 'proc' },
        { id: 'a4', label: 'count++\nV(mutex)，读文件', type: 'proc' },
        { id: 'a5', label: '读完 P(mutex)\ncount--', type: 'proc' },
        { id: 'a6', label: 'count==0？', type: 'cond' },
        { id: 'a7', label: 'V(rw)\n最后一个读者解锁', type: 'proc' },
        { id: 'a8', label: 'V(mutex) 后退出', type: 'end' },
        { id: 'b1', label: '写者：P(rw)', type: 'proc' },
        { id: 'b2', label: '写文件', type: 'proc' },
        { id: 'b3', label: 'V(rw) 退出\n（写者可能饥饿）', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'a1' },
        { from: 'a1', to: 'a2' },
        { from: 'a2', to: 'a3', label: '是' },
        { from: 'a3', to: 'a4' },
        { from: 'a2', to: 'a4', label: '否' },
        { from: 'a4', to: 'a5' },
        { from: 'a5', to: 'a6' },
        { from: 'a6', to: 'a7', label: '是' },
        { from: 'a7', to: 'a8' },
        { from: 'a6', to: 'a8', label: '否' },
        { from: 's', to: 'b1' },
        { from: 'b1', to: 'b2' },
        { from: 'b2', to: 'b3' },
      ],
    },
  },
  {
    id: 'q-2016-47',
    year: 2016,
    number: 47,
    subject: 'cn',
    type: 'application',
    topic: 'RIP 路由更新',
    difficulty: 3,
    source: 'real',
    score: 9,
    question:
      '路由器 R 的路由表当前为：目的网络 Net1，距离 4，下一跳 R2；Net2，距离 3，下一跳 R1；Net3，距离 5，下一跳 R3。R 从相邻路由器 R1 收到如下路由信息：Net1 距离 2，Net2 距离 3，Net4 距离 1。按 RIP 协议（距离向量算法）的规则：\n(1) 更新后 R 的路由表各项（目的网络、距离、下一跳）各是什么？说明每条的处理依据；（5 分）\n(2) RIP 的"坏消息传播慢"（计数到无穷）问题是什么？举一简例说明；（2 分）\n(3) RIP 与 OSPF 分别基于什么算法？各自适用的网络规模有何差别？（2 分）',
    answerText:
      '**(1)** 先把 R1 通告的距离全部 +1（R 到各网络须再经过 R1 一跳）：Net1 变 3、Net2 变 4、Net4 变 2。逐条处理：\n- Net1：原表有且下一跳就是 R1 → 无条件更新为新距离 3，下一跳 R1（同一下一跳必须更新，距离变小不是必要条件）；\n- Net2：原表有、下一跳同为 R1 → 更新为 4，下一跳 R1；\n- Net4：原表没有 → 新增表项：距离 2，下一跳 R1；\n- Net3：通告中未出现 → 保持 5，下一跳 R3 不变。\n更新后的路由表：Net1（3，R1）、Net2（4，R1）、Net3（5，R3）、Net4（2，R1）。\n**(2)** 若 R1 到某网络的链路失效，R1 把相应距离改为 16（不可达）前，可能先收到 R 发来的"经我 3 跳可达"的旧信息，转而认为经 R 可达（距离 4），R 又从 R1 学回（5）……两路由器互相"学习"对方的过时路由，距离逐次加 1 直到 16 才判定不可达，期间形成路由环，收敛极慢。\n**(3)** RIP 基于距离向量算法，以跳数为度量、周期性整表交换，适合小规模网络（最大 15 跳）；OSPF 基于链路状态算法，洪泛链路状态通告、全网同步拓扑后用 Dijkstra 最短路径计算，收敛快、支持分区与大规模网络。',
    explanation:
      'RIP 更新四规则要逐条对号入座：①相同下一跳——无论距离变大变小一律采用新值；②新目的网络——添加（距离+1，下一跳为发来者）；③不同下一跳且新距离更小——更新；④其余情况保持不变。第(2)问的示例要体现"互相引用对方的旧路由导致距离交替上升"；第(3)问的关键对比词是"距离向量 vs 链路状态、跳数 vs 开销（可含时延）、慢收敛 vs 快收敛、小规模 vs 大规模"。',
    visual: {
      kind: 'flow',
      title: 'RIP 距离矢量：逐条套用更新规则',
      nodes: [
        { id: 's', label: '收到 R1 通告：\nNet1=2 Net2=3\nNet4=1', type: 'start' },
        { id: 'p', label: '先全部加 1：\nNet1=3 Net2=4\nNet4=2', type: 'proc' },
        { id: 'n1', label: 'Net1：下一跳同为 R1\n4→3 无条件替换', type: 'proc' },
        { id: 'n2', label: 'Net2：下一跳同为 R1\n3→4 无条件替换', type: 'proc' },
        { id: 'n4', label: 'Net4：本表没有\n新增(2, R1)', type: 'proc' },
        { id: 'n3', label: 'Net3：通告未出现\n保持(5, R3)', type: 'proc' },
        { id: 'e', label: '距离≥16 视为\n不可达，丢弃', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'p' },
        { from: 'p', to: 'n1' },
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n4' },
        { from: 'n4', to: 'n3' },
        { from: 'n3', to: 'e' },
      ],
    },
  },
]
