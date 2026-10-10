import type { Question } from '../types'

/** 2026 届 408 统考（2025 年 12 月）· 综合应用题 41–47（共 70 分）
 * 数据结构 41–42（23 分）· 组成原理 43–44（23 分）· 操作系统 45–46（15 分）· 网络 47（9 分）
 */
export const y2026a: Question[] = [
  {
    id: 'q-2026-41',
    year: 2026,
    number: 41,
    subject: 'ds',
    type: 'application',
    topic: '二叉树的宽度',
    difficulty: 3,
    source: 'real',
    score: 15,
    question:
      '设二叉树采用二叉链表存储，结点结构为（lchild, data, rchild），T 为指向根结点的指针。二叉树的宽度定义为：结点数最多的那一层上的结点总数（空树的宽度为 0）。请设计一个尽可能高效的算法，求给定二叉树的宽度。\n(1) 描述算法的基本设计思想；（5 分）\n(2) 描述算法的详细实现步骤；（3 分）\n(3) 根据设计思想和实现步骤，用 C 语言描述算法，关键之处给出简要注释；（5 分）\n(4) 说明你所设计算法的时间复杂度和空间复杂度。（2 分）',
    answerText:
      '**(1) 设计思想**：对二叉树进行层次遍历（BFS），逐层"整批"处理结点。处理每层之前先记下此刻队列中的结点个数 cnt，它恰好等于该层的结点数；用 cnt 更新当前最大宽度 maxw，然后把这一层结点全部出队，并将其非空孩子入队（入队的孩子正是下一层）。所有层处理完后，maxw 即为二叉树的宽度。\n**(2) 实现步骤**：① 若 T 为空，返回 0；② 根结点入队；③ 当队列非空时循环：cnt = 队中当前结点数；若 cnt > maxw 则 maxw = cnt；再循环 cnt 次——出队一个结点，把它的非空左、右孩子依次入队；④ 循环结束（队列空）时返回 maxw。\n**(3) C 语言描述**：见下方代码。\n**(4) 复杂度**：时间复杂度 O(n)，每个结点恰好入队、出队各一次；空间复杂度 O(n)，辅助队列最坏需容纳最宽一层的全部结点（约 ⌈n/2⌉ + 1 个）。',
    code: {
      lang: 'c',
      text: `typedef struct BiTNode {
    int data;
    struct BiTNode *lchild, *rchild;
} BiTNode, *BiTree;

/* 求二叉树的宽度（最宽一层的结点数），MaxSize >= 结点总数 */
int Width(BiTree T)
{
    if (T == NULL) return 0;
    BiTree Q[MaxSize];           /* 辅助队列（数组实现） */
    int front = 0, rear = 0;     /* 队头、队尾指针 */
    int maxw = 0, i;
    Q[rear++] = T;               /* 根结点入队 */
    while (front < rear) {       /* 还有结点未处理 */
        int cnt = rear - front;  /* 当前层结点数 */
        if (cnt > maxw) maxw = cnt;
        for (i = 0; i < cnt; i++) {   /* 当前层整批出队 */
            BiTree p = Q[front++];
            if (p->lchild) Q[rear++] = p->lchild;
            if (p->rchild) Q[rear++] = p->rchild;
        }                        /* 入队的孩子即下一层 */
    }
    return maxw;
}`,
    },
    explanation:
      '"每层开始前记录队列长度"是层次遍历类算法的关键技巧：队列在任意时刻最多保存相邻两层的结点，而在整批出队开始的那一瞬，队中恰好只有本层结点，rear − front 即本层宽度。常见错误做法：① 用普通遍历加全局深度计数递归统计各层结点数（需 O(h) 深度数组，虽也可行但代码更长）；② 在循环内既出队又随意改变 front/rear，导致层数统计错乱；③ 忘记空树返回 0。本题与"求树高"相对：一个横向计数、一个纵向计数，都依托同一个 BFS 骨架。',
    visual: {
      kind: 'tree',
      title: '求二叉树宽度：BFS 逐层计数（示例树）',
      steps: [
        {
          nodes: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B', parent: 'A' }, { id: 'C', label: 'C', parent: 'A' },
            { id: 'D', label: 'D', parent: 'B' }, { id: 'E', label: 'E', parent: 'B' },
            { id: 'F', label: 'F', parent: 'C' }, { id: 'G', label: 'G', parent: 'C' },
            { id: 'H', label: 'H', parent: 'D' }, { id: 'I', label: 'I', parent: 'D' },
          ],
          highlight: ['A'],
          note: '示例树（演示算法）：根入队，出队前队列 [A]，cnt=1，maxw=1（空树直接返回 0）',
        },
        {
          nodes: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B', parent: 'A' }, { id: 'C', label: 'C', parent: 'A' },
            { id: 'D', label: 'D', parent: 'B' }, { id: 'E', label: 'E', parent: 'B' },
            { id: 'F', label: 'F', parent: 'C' }, { id: 'G', label: 'G', parent: 'C' },
            { id: 'H', label: 'H', parent: 'D' }, { id: 'I', label: 'I', parent: 'D' },
          ],
          highlight: ['B', 'C'],
          note: '第 1 层整批出队、孩子入队后：队列 [B,C]，cnt=2，maxw=2',
        },
        {
          nodes: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B', parent: 'A' }, { id: 'C', label: 'C', parent: 'A' },
            { id: 'D', label: 'D', parent: 'B' }, { id: 'E', label: 'E', parent: 'B' },
            { id: 'F', label: 'F', parent: 'C' }, { id: 'G', label: 'G', parent: 'C' },
            { id: 'H', label: 'H', parent: 'D' }, { id: 'I', label: 'I', parent: 'D' },
          ],
          highlight: ['D', 'E', 'F', 'G'],
          note: '第 3 层：队列 [D,E,F,G]，cnt=4，maxw=4——全程最宽的一层',
        },
        {
          nodes: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B', parent: 'A' }, { id: 'C', label: 'C', parent: 'A' },
            { id: 'D', label: 'D', parent: 'B' }, { id: 'E', label: 'E', parent: 'B' },
            { id: 'F', label: 'F', parent: 'C' }, { id: 'G', label: 'G', parent: 'C' },
            { id: 'H', label: 'H', parent: 'D' }, { id: 'I', label: 'I', parent: 'D' },
          ],
          highlight: ['H', 'I'],
          note: '第 4 层：cnt=2，maxw 保持 4；队空循环结束，返回宽度 4',
        },
      ],
    },
  },
  {
    id: 'q-2026-42',
    year: 2026,
    number: 42,
    subject: 'ds',
    type: 'application',
    topic: '最佳归并树',
    difficulty: 3,
    source: 'real',
    score: 8,
    question:
      '对某磁盘文件进行外部排序，经置换-选择等处理得到 8 个初始归并段，其长度（单位：磁盘块）依次为 4、6、8、10、12、14、16、18。现采用 3 路平衡归并。\n(1) 构造 3 路最佳归并树时是否需要增设虚段？若需要，虚段的个数与长度是多少？（2 分）\n(2) 给出该 3 路最佳归并树的归并方案（说明每一轮参与归并的段及产生的新段长度）；（4 分）\n(3) 按该最佳归并树完成归并，每个磁盘块被读一次、写一次各计一次 I/O，则整个归并过程总共需要读写多少块？（2 分）',
    answerText:
      '**(1)** 需要增设虚段。判断式：(n − 1) mod (k − 1) = (8 − 1) mod (3 − 1) = 1 ≠ 0，故需补 u = (k − 1) − 1 = 1 个长度为 0 的虚段，使叶结点数凑成 9，才能构成严格 3 叉的归并树。\n**(2)** 9 个叶（含虚段 0），按"每次归并当前最短的 3 个段"构造：\n第一轮：0（虚段）+ 4 + 6 → 新段 10；\n第二轮：8 + 10（原第 4 段）+ 10（第一轮新段）→ 新段 28；\n第三轮：12 + 14 + 16 → 新段 42；\n第四轮：18 + 28 + 42 → 最终段 88（恰等于各段总长 4+6+8+10+12+14+16+18 = 88，可自行校验）。\n各叶深度：18 在第 1 层；8、10、12、14、16 在第 2 层；虚段 0、4、6 在第 3 层。\n**(3)** 带权路径长度 WPL = (0 + 4 + 6)×3 + (8 + 10 + 12 + 14 + 16)×2 + 18×1 = 30 + 120 + 18 = 168（校验：各内部结点之和 10 + 28 + 42 + 88 = 168）。每块每被"归并"一次就读一次、写一次，故总读写块数 = 2 × WPL = **336 块**。',
    explanation:
      '最佳归并树就是 k 叉哈夫曼树：让短段多走几趟、长段少走几趟，总 I/O 最小。两个易错点：一是忘判 (n−1) mod (k−1)，k 叉哈夫曼只有当叶数满足该式为 0 时才是严格 k 叉树，否则必须补虚段（本题补 1 个 0）；二是把"读写次数"只算成 WPL——每块在每轮归并中先被读出再被写入，I/O 次数是权值和的两倍。WPL 的两种算法（叶权×深度求和 = 内部结点权值求和）应互相校验，根结点权值等于全部初始段长度之和（88）可作为树构造正确的快速自检。',
    visual: {
      kind: 'tree',
      title: '3 路最佳归并树（补 1 个虚段，WPL=168）',
      steps: [
        {
          nodes: [
            { id: 'v0', label: '虚0' },
            { id: 's4', label: '4' }, { id: 's6', label: '6' }, { id: 's8', label: '8' },
            { id: 's10', label: '10' }, { id: 's12', label: '12' }, { id: 's14', label: '14' },
            { id: 's16', label: '16' }, { id: 's18', label: '18' },
          ],
          note: '(8−1) mod (3−1)=1≠0 → 需补 1 个长度 0 的虚段，凑成 9 个叶（严格 3 叉）',
        },
        {
          nodes: [
            { id: 'n10', label: '10' },
            { id: 'v0', label: '虚0', parent: 'n10' },
            { id: 's4', label: '4', parent: 'n10' }, { id: 's6', label: '6', parent: 'n10' },
            { id: 's8', label: '8' }, { id: 's10', label: '10' }, { id: 's12', label: '12' },
            { id: 's14', label: '14' }, { id: 's16', label: '16' }, { id: 's18', label: '18' },
          ],
          highlight: ['n10', 'v0', 's4', 's6'],
          note: '第 1 轮：当前最短的 3 个段 虚0+4+6 → 新段 10',
        },
        {
          nodes: [
            { id: 'n28', label: '28' },
            { id: 's8', label: '8', parent: 'n28' },
            { id: 's10', label: '10', parent: 'n28' },
            { id: 'n10', label: '10', parent: 'n28' },
            { id: 'v0', label: '虚0', parent: 'n10' },
            { id: 's4', label: '4', parent: 'n10' }, { id: 's6', label: '6', parent: 'n10' },
            { id: 's12', label: '12' }, { id: 's14', label: '14' }, { id: 's16', label: '16' }, { id: 's18', label: '18' },
          ],
          highlight: ['n28', 's8', 's10', 'n10'],
          note: '第 2 轮：8 + 原段 10 + 第 1 轮新段 10 → 新段 28',
        },
        {
          nodes: [
            { id: 'n28', label: '28' },
            { id: 's8', label: '8', parent: 'n28' },
            { id: 's10', label: '10', parent: 'n28' },
            { id: 'n10', label: '10', parent: 'n28' },
            { id: 'v0', label: '虚0', parent: 'n10' },
            { id: 's4', label: '4', parent: 'n10' }, { id: 's6', label: '6', parent: 'n10' },
            { id: 'n42', label: '42' },
            { id: 's12', label: '12', parent: 'n42' }, { id: 's14', label: '14', parent: 'n42' }, { id: 's16', label: '16', parent: 'n42' },
            { id: 's18', label: '18' },
          ],
          highlight: ['n42', 's12', 's14', 's16'],
          note: '第 3 轮：12 + 14 + 16 → 新段 42',
        },
        {
          nodes: [
            { id: 'r88', label: '88' },
            { id: 's18', label: '18', parent: 'r88' },
            { id: 'n28', label: '28', parent: 'r88' },
            { id: 'n42', label: '42', parent: 'r88' },
            { id: 's8', label: '8', parent: 'n28' },
            { id: 's10', label: '10', parent: 'n28' },
            { id: 'n10', label: '10', parent: 'n28' },
            { id: 'v0', label: '虚0', parent: 'n10' },
            { id: 's4', label: '4', parent: 'n10' }, { id: 's6', label: '6', parent: 'n10' },
            { id: 's12', label: '12', parent: 'n42' },
            { id: 's14', label: '14', parent: 'n42' }, { id: 's16', label: '16', parent: 'n42' },
          ],
          highlight: ['r88', 's18', 'n28', 'n42'],
          note: '第 4 轮：18+28+42 → 根 88（=各段总和）；WPL=168，总读写 2×168=336 块',
        },
      ],
    },
  },
  {
    id: 'q-2026-43',
    year: 2026,
    number: 43,
    subject: 'co',
    type: 'application',
    topic: '数据通路',
    difficulty: 3,
    source: 'adapted',
    score: 13,
    question:
      '某计算机字长 16 位，主存按字编址，主存读/写各占 1 个时钟周期；CPU 内部采用单总线结构：一条内部总线连接程序计数器 PC、指令寄存器 IR、地址寄存器 MAR、数据寄存器 MDR、通用寄存器 R0～R3、暂存器 Y、暂存器 Z 与 ALU。Y 用于暂存送入 ALU 的一个操作数，Z 用于锁存 ALU 的运算结果。（原题带 CPU 数据通路图，此处以文字描述部件与连接。）总线一次传送、ALU 一次运算各占 1 个时钟周期；取指令时 PC 的自动加 1 由专用逻辑完成，不占额外节拍。指令 ADD R1, (R2) 的功能是 R1 ← R1 + M[(R2)]，其中 (R2) 表示以 R2 的内容为主存地址。\n(1) 写出取指周期的微操作序列（各节拍完成的操作）；（3 分）\n(2) 写出该指令执行周期的微操作序列，并说明 Y、Z 两个部件在其中的作用；（6 分）\n(3) 该指令从取指到执行结束共需多少个时钟周期？若 CPU 主频为 50 MHz，则执行该指令共需多长时间？（4 分）',
    answerText:
      '**(1) 取指周期（3 拍）**：\n① PC → MAR；\n② 发读命令，M(MAR) → MDR（同一节拍内专用逻辑完成 PC + 1 → PC）；\n③ MDR → IR。\n**(2) 执行周期（5 拍）**：\n① R2 → MAR；\n② 发读命令，M(MAR) → MDR（取出操作数 M[(R2)]）；\n③ MDR → Y；\n④ R1 → 总线（送 ALU 的另一输入），ALU 执行加法，结果 → Z；\n⑤ Z → R1。\nY 的作用：单总线同一时刻只允许一个部件向总线发送数据，ALU 的两个操作数必须分两拍取得，先取得的一个（本题为存储器操作数）要暂存在 Y 中，等另一个操作数上总线时同时送入 ALU。Z 的作用：第 ④ 拍总线正被 R1 占用，ALU 的输出不能立即回送总线（否则与输入冲突），必须先锁存到 Z，下一拍再由 Z 经总线送往 R1。\n**(3)** 取指 3 拍 + 执行 5 拍 = 8 个时钟周期。主频 50 MHz，时钟周期 = 1 / (50×10^6) = 20 ns，故执行时间为 8 × 20 ns = 160 ns。',
    explanation:
      '本题考查单总线 CPU 的微操作级数据通路。写微操作序列的固定套路：数据进主存必须先装 MAR（地址）、经 MDR（数据）中转；数据进运算器必须经 Y/Z 中转——Y 与 Z 正是为"单总线同一拍只能传一个数"而设。容易出错的地方：① 把 PC→MAR 与读主存并成一步（少算节拍）；② 漏写 R2→MAR（间址操作数也要先送地址）；③ 误认为 ALU 结果可以直接写回 R1——第 ④ 拍总线上是 R1 的值，结果必须先落 Z。统计时钟周期时按"微操作数=节拍数"逐项相加，最后用主频换算时间。',
    visual: {
      kind: 'flow',
      title: 'ADD R1,(R2) 单总线数据通路：8 拍 / 160 ns',
      nodes: [
        { id: 's', label: 'ADD R1,(R2)\nR1←R1+M[(R2)]', type: 'start' },
        { id: 'p1', label: '取指① PC→MAR', type: 'proc' },
        { id: 'p2', label: '取指② 读主存\nMDR←M，PC+1', type: 'proc' },
        { id: 'p3', label: '取指③ MDR→IR', type: 'proc' },
        { id: 'p4', label: '执行① R2→MAR', type: 'proc' },
        { id: 'p5', label: '执行② 读主存\nMDR←M[(R2)]', type: 'proc' },
        { id: 'p6', label: '执行③ MDR→Y', type: 'proc' },
        { id: 'p7', label: '执行④ R1→总线\nALU 加，结果→Z', type: 'proc' },
        { id: 'p8', label: '执行⑤ Z→R1', type: 'proc' },
        { id: 'y1', label: 'Y：暂存先到的\n操作数', type: 'proc' },
        { id: 'z1', label: 'Z：ALU 结果\n先锁存下拍再送', type: 'proc' },
        { id: 'e', label: '共 3+5=8 拍\n50MHz→160ns', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'p1' },
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5' },
        { from: 'p5', to: 'p6' },
        { from: 'p6', to: 'p7', label: 'Y 的作用' },
        { from: 'p7', to: 'p8', label: 'Z 的作用' },
        { from: 'p8', to: 'e' },
        { from: 'p6', to: 'y1' },
        { from: 'p7', to: 'z1' },
      ],
    },
  },
  {
    id: 'q-2026-44',
    year: 2026,
    number: 44,
    subject: 'co',
    type: 'application',
    topic: '流水线数据相关',
    difficulty: 3,
    source: 'real',
    templateId: 'co-pipeline',
    score: 10,
    question:
      '某按序执行的 5 段指令流水线为 IF（取指）、ID（译码/取数）、EX（执行）、MEM（访存）、WB（写回）。寄存器堆在 ID 段读、在 WB 段写，同一时钟周期内允许"先写后读"。流水线具备 EX 段→EX 段、MEM 段→EX 段两条定向（旁路）路径，无结构相关，无转移指令。执行如下指令序列：\nI1: LOAD R1, 0(R2)\nI2: ADD R3, R1, R4\nI3: SUB R5, R3, R1\n（I1 完成 R1 ← M[R2]；I2 完成 R3 ← R1 + R4；I3 完成 R5 ← R3 − R1。）\n(1) 不采用定向技术时，指出指令间的数据相关，并求 I2、I3 各需停顿的时钟周期数及三条指令全部执行完所需的时钟周期总数；（4 分）\n(2) 采用定向技术时，I2、I3 各需停顿的时钟周期数及所需时钟周期总数；（4 分）\n(3) 结合本题说明定向技术的作用及其不能消除的停顿。（2 分）',
    answerText:
      '**(1) 无定向**：存在三组 RAW（先写后读）相关：I1→I2（R1）、I2→I3（R3）、I1→I3（R1）。无定向时必须等写入 WB 后才能在 ID 段读到（同拍先写后读）。时间表（数字为时钟周期）：\nI1：IF 1，ID 2，EX 3，MEM 4，WB 5；\nI2：IF 2，ID 3～5（停 2 拍等 I1 写回 R1），EX 6，MEM 7，WB 8；\nI3：IF 3，受阻 4～5，ID 6～8（停 2 拍等 I2 写回 R3），EX 9，MEM 10，WB 11。\nI2 停 2 拍、I3 停 2 拍，总共 **11** 个时钟周期。\n**(2) 有定向**：I1 的 R1 要到 MEM 段（第 4 拍）末才产生，而 I2 的 EX 原排在第 4 拍，来不及同拍取用，属"装载—使用"（load-use）相关，I2 仍须停 1 拍（EX 推迟到第 5 拍，由 MEM→EX 定向取得 R1）；I3 所需的 R3 由 I2 第 5 拍 EX 的结果经 EX→EX 定向送入第 6 拍的 EX，R1 更早已可得，故 I3 不再停顿。时间表：\nI1：IF 1，ID 2，EX 3，MEM 4，WB 5；\nI2：IF 2，ID 3～4（停 1 拍），EX 5，MEM 6，WB 7；\nI3：IF 3，受阻 4，ID 5，EX 6，MEM 7，WB 8。\nI2 停 1 拍、I3 停 0 拍，总共 **8** 个时钟周期。\n**(3)** 定向技术把结果从产生段（EX 或 MEM）直接引到需要它的段，绕开"必须先写回寄存器堆"的限制，消除了绝大多数 RAW 相关的停顿（本题 I3 的 2 拍停顿全部消除）。但它无法消除 load-use 相关带来的 1 拍停顿：LOAD 的数据在 MEM 段末才得到，紧随其后指令的 EX 段必须后移一拍，除非由编译器在两者之间调度一条与该数据无关的指令来填补气泡。',
    explanation:
      '解此类题先画 5 行时间表，再逐条检查 RAW：找出"写方 WB 拍"与"读方 ID 拍"的关系。无定向时的判定规则：读方 ID 拍 ≥ 写方 WB 拍（利用同拍先写后读）；有定向时则比较"结果产生段"与"需求段"：ALU 结果产生于 EX 末拍，可从下一拍起定向（EX→EX）；访存结果产生于 MEM 末拍，需需求段在其后一拍（MEM→EX），故紧邻的 load-use 必停 1 拍。统计总时间看最后一条指令的 WB 拍号。易错点：把 I3 的受阻误算成 I3 自身的停顿——流水线中的"气泡"归属于引发停顿的指令（I2），后继指令只是被动顺延。',
    visual: {
      kind: 'pipeline',
      title: '无定向：LOAD–ADD–SUB 数据相关（共 11 拍）',
      stages: ['IF', 'ID', 'EX', 'MEM', 'WB'],
      instrs: [
        {
          name: 'I1: LOAD R1,0(R2)',
          delay: 0,
          note: 'I1：IF1、ID2、EX3、MEM4，第 5 拍 WB 段末写回 R1',
        },
        {
          name: 'I2: ADD R3,R1,R4',
          delay: 3,
          note: 'I2 停 2 拍等 R1 写回（ID 占 3~5 拍），EX6、MEM7、WB8',
        },
        {
          name: 'I3: SUB R5,R3,R1',
          delay: 6,
          note: 'I3 再停 2 拍等 R3 写回（ID 占 6~8 拍），WB 11 → 共 11 拍；改用定向后：I2 停 1 拍、I3 停 0 拍，共 8 拍',
        },
      ],
    },
  },
  {
    id: 'q-2026-45',
    year: 2026,
    number: 45,
    subject: 'os',
    type: 'application',
    topic: '页面置换算法',
    difficulty: 3,
    source: 'real',
    templateId: 'os-page-replace',
    score: 8,
    question:
      '某请求分页系统采用固定分配局部置换策略，进程 P 分得 3 个页框（初始为空），采用简单 CLOCK（最近未用近似）置换算法：各页框组成循环队列，装入新页时访问位置 1、指针指向下一个页框；命中时将对应页的访问位置 1（指针不动）；缺页时从指针处开始扫描，访问位为 1 则清 0 并前移，遇到访问位为 0 的页将其淘汰并装入新页（访问位置 1），指针移到下一个页框。进程 P 的页面访问序列（按时间先后）为：\n1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5\n(1) 逐次给出每次访问的处理结果（命中或缺页，缺页时注明淘汰的页），并写出被淘汰页面的先后顺序；（5 分）\n(2) 计算该访问序列下的缺页率；（1 分）\n(3) 有人认为"LRU 一定比 CLOCK 的缺页次数少"。用本序列验证：LRU 在同样 3 个页框下共缺页 10 次，据此判断该说法是否成立，并说明原因。（2 分）',
    answerText:
      '**(1)** 各页框初始为空、指针指向 0 号页框，逐次处理：\n访问 1：缺页，装入（帧 0）；访问 2：缺页，装入（帧 1）；访问 3：缺页，装入（帧 2）；\n访问 4：缺页，扫描一圈将 1、2、3 的访问位全部清 0，回到帧 0 淘汰 1，装入 4；\n访问 1：缺页，帧 1 的 2 访问位为 0，淘汰 2，装入 1；\n访问 2：缺页，帧 2 的 3 访问位为 0，淘汰 3，装入 2；\n访问 5：缺页，扫描一圈将 4、1、2 清 0，回到帧 0 淘汰 4，装入 5；\n访问 1：命中（置访问位 1）；访问 2：命中（置访问位 1）；\n访问 3：缺页，扫描一圈将 1、2、5 清 0，淘汰帧 1 的 1，装入 3；\n访问 4：缺页，帧 2 的 2 访问位为 0，淘汰 2，装入 4；\n访问 5：命中。\n被淘汰页面的先后顺序：**1 → 2 → 3 → 4 → 1 → 2**；共缺页 9 次、命中 3 次。\n**(2)** 缺页率 = 9 / 12 = **75%**。\n**(3)** 该说法不成立。本题 CLOCK 缺页 9 次而 LRU 缺页 10 次（LRU 在访问 10、11、12 处依次淘汰 5、1、2，装入 3、4、5 而均缺页），LRU 反而多 1 次。任何固定算法都存在对己不利的访问序列：CLOCK/FIFO 按"进入先后+二次机会"淘汰，恰好保住了本序列中被再次访问的 1、2；而 LRU 在中期把 5、1、2 的先后"最久未用"关系翻转了多次。只能说 LRU 基于时间局部性、平均表现更好，不能保证每个序列都最优。',
    explanation:
      'CLOCK 手工模拟的三个铁律：命中只置访问位、指针不动；淘汰后新页访问位置 1 且指针越过该帧框；扫描时"遇 1 清 0 前移、遇 0 淘汰"。本题前 6 次访问全缺页（与 FIFO 行为一致，因为页面全被装入不久），差异出现在两次命中把 1、2 的访问位抬起来，使第 10、11 次缺页时 1、2 获得二次机会、淘汰的是别的页。第 (3) 问是概念深化：置换算法只有期望意义（期望缺页率）与个体差异，OPT 是唯一可证的最优下界，LRU/CLOCK 都可能被特定序列击败；FIFO 还可能出现 Belady 异常（本序列配 4 个页框时 FIFO 缺页升至 10 次）。',
    visual: {
      kind: 'pages',
      title: '简单 CLOCK 置换（3 页框：缺页 9 次；同序列 LRU 为 10 次）',
      algo: 'CLOCK',
      frames: 3,
      accesses: ['1', '2', '3', '4', '1', '2', '5', '1', '2', '3', '4', '5'],
    },
  },
  {
    id: 'q-2026-46',
    year: 2026,
    number: 46,
    subject: 'os',
    type: 'application',
    topic: '进程同步',
    difficulty: 3,
    source: 'real',
    templateId: 'os-pv-model',
    score: 7,
    question:
      '桌上有一个能放水果的盘子，最多可容纳 5 个水果。父亲专门向盘中放苹果，母亲专门向盘中放橘子；女儿专等吃盘中的苹果，儿子专等吃盘中的橘子。向盘中放水果或从盘中取水果都必须互斥进行（一次只能一人使用盘子），且盘空时取水果者必须等待、盘满时放水果者必须等待。\n(1) 定义实现上述同步所需的信号量，说明每个信号量的初值与含义；（3 分）\n(2) 用 P、V 操作写出父亲、母亲、女儿、儿子四个进程的同步算法。（4 分）',
    answerText:
      '**(1)** 需要 4 个信号量：\nplate：初值 5，表示盘中剩余的空位数（放水果前申请）；\napple：初值 0，表示盘中现有苹果数（女儿申请）；\norange：初值 0，表示盘中现有橘子数（儿子申请）；\nmutex：初值 1，实现对盘子的互斥使用。\n**(2)** 四个进程的同步算法见下方代码。要点：放水果者"先 P(plate) 再 P(mutex)"，取水果者"先 P(apple/orange) 再 P(mutex)"；完成操作后先 V(mutex)，再 V(apple/orange) 或 V(plate)（V 的先后次序不影响正确性）。',
    code: {
      lang: 'c',
      text: `semaphore plate  = 5;   /* 盘中空位数 */
semaphore apple  = 0;   /* 盘中苹果数 */
semaphore orange = 0;   /* 盘中橘子数 */
semaphore mutex  = 1;   /* 互斥使用盘子 */

father() {              /* 父亲进程：放苹果 */
    while (TRUE) {
        准备一个苹果;
        P(plate);  P(mutex);   /* 先资源后互斥 */
        将苹果放入盘中;
        V(mutex);  V(apple);
    }
}
mother() {              /* 母亲进程：放橘子 */
    while (TRUE) {
        准备一个橘子;
        P(plate);  P(mutex);
        将橘子放入盘中;
        V(mutex);  V(orange);
    }
}
daughter() {            /* 女儿进程：吃苹果 */
    while (TRUE) {
        P(apple);  P(mutex);
        从盘中取出一个苹果;
        V(mutex);  V(plate);
        吃苹果;
    }
}
son() {                 /* 儿子进程：吃橘子 */
    while (TRUE) {
        P(orange); P(mutex);
        从盘中取出一个橘子;
        V(mutex);  V(plate);
        吃橘子;
    }
}`,
    },
    explanation:
      '本题是"带容量约束的双品种生产者—消费者"模型：plate/apple/orange 三个资源信号量分别管理空位、苹果与橘子，mutex 管互斥，比单品种情形多出的关键是"按品种取用"。最易失分点是 P 操作次序：若把 P(mutex) 放在 P(plate)（或 P(apple/orange)）之前，当盘满（或盘空）时，放（取）水果者会抱着盘子互斥锁阻塞，对方永远拿不到 mutex，双方互相等待形成死锁——必须"先资源、后互斥"。另外注意吃水果动作放在临界区之外，避免长时间占用盘子。',
    visual: {
      kind: 'flow',
      title: '水果盘问题：plate/apple/orange/mutex 的 PV 流程',
      nodes: [
        { id: 's', label: 'plate=5\napple=0\norange=0\nmutex=1', type: 'start' },
        { id: 'q', label: '放还是取？', type: 'cond' },
        { id: 'p1', label: '父/母：P(plate)\n再 P(mutex)', type: 'proc' },
        { id: 'p2', label: '将苹果或橘子\n放入盘中', type: 'proc' },
        { id: 'p3', label: 'V(mutex)\nV(apple)\n或 V(orange)', type: 'proc' },
        { id: 'c1', label: '女/儿：P(品种)\n再 P(mutex)', type: 'proc' },
        { id: 'c2', label: '取出自己\n专吃的水果', type: 'proc' },
        { id: 'c3', label: 'V(mutex)\nV(plate)', type: 'proc' },
        { id: 'x1', label: '先 P(mutex)\n后 P(资源)？', type: 'cond' },
        { id: 'x2', label: '盘满时抱着\nmutex 阻塞', type: 'proc' },
        { id: 'x3', label: '取方拿不到锁\n→ 死锁', type: 'end' },
        { id: 'e', label: '循环继续', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'q' },
        { from: 'q', to: 'p1', label: '放（父/母）' },
        { from: 'q', to: 'c1', label: '取（女/儿）' },
        { from: 'p1', to: 'p2', label: '先资源后互斥' },
        { from: 'p1', to: 'x1', label: '若次序颠倒' },
        { from: 'x1', to: 'x2', label: '是' },
        { from: 'x2', to: 'x3' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'e' },
        { from: 'c1', to: 'c2' },
        { from: 'c2', to: 'c3' },
        { from: 'c3', to: 'e' },
      ],
    },
  },
  {
    id: 'q-2026-47',
    year: 2026,
    number: 47,
    subject: 'cn',
    type: 'application',
    topic: '子网划分与ARP',
    difficulty: 2,
    source: 'real',
    templateId: 'cn-vlsm',
    score: 9,
    question:
      '主机 H1 配置的 IP 地址为 192.168.72.166，子网掩码为 255.255.255.192；本网段路由器（默认网关）的 IP 地址为 192.168.72.129。\n(1) 求主机 H1 所在子网的子网地址、广播地址与可用 IP 地址个数；（3 分）\n(2) 主机 H1 要与 IP 地址为 192.168.72.100 的主机 H2 通信，IP 分组能否直接交付（不经过路由器）？请说明理由，并指出 H1 发出的帧的目的 MAC 地址应如何获得；（3 分）\n(3) 主机 H1 要与 IP 地址为 192.168.72.185 的主机 H3 通信，H1 发出的帧的目的 MAC 地址又应如何获得？（3 分）',
    answerText:
      '**(1)** 掩码 255.255.255.192 即 /26，第 4 字节的块大小为 64。166 = 1010 0110B，与 1100 0000B（192）相与得 128，故子网地址为 **192.168.72.128/26**，地址范围 192.168.72.128～192.168.72.191；广播地址为 **192.168.72.191**；主机号占 6 位，可用 IP 地址数 = 2^6 − 2 = **62** 个（192.168.72.129～192.168.72.190，其中 .129 已被网关占用）。\n**(2)** 不能直接交付。100 = 0110 0100B，与 192 相与得 64，故 H2 属于子网 192.168.72.64/26，与 H1 不在同一子网，分组必须交给默认网关 192.168.72.129 间接交付。H1 先用 ARP 解析**网关（192.168.72.129）的 MAC 地址**（ARP 请求在本子网内广播、网关应答），随后把发往 H2 的 IP 分组封装成目的 MAC 为网关 MAC 的帧发出，由网关继续转发。\n**(3)** 185 = 1011 1001B，落在 128～191 内，与 H1 同属子网 192.168.72.128/26，分组直接交付。此时 H1 用 ARP 解析的是 **H3（192.168.72.185）本身的 MAC 地址**：H1 在本子网内广播 ARP 请求（目的 MAC = FF-FF-FF-FF-FF-FF），H3 匹配到自己的 IP 后单播应答，H1 将结果写入 ARP 高速缓存后即可封装并发送帧。',
    explanation:
      '本题把子网划分与 ARP 的"问谁要 MAC"结合起来，是网络部分大题的高频模型。第 (1) 问的口诀：掩码 /26 → 第 4 字节按 64 分块，子网地址 = 主机地址与掩码相与，广播地址 = 子网地址 + 块大小 − 1。第 (2)(3) 问的核心判断是"目的 IP 与本机是否同网段"：同网段直接交付、ARP 问目的主机；不同网段间接交付、ARP 问默认网关——帧的目的 MAC 永远是"下一跳"设备的 MAC，而 IP 分组的目的地址始终保持最终目的（NAT 等中间设备不在此列）。',
    visual: {
      kind: 'flow',
      title: '/26 子网判断与 ARP：帧目的 MAC 问谁',
      nodes: [
        { id: 's', label: 'H1=192.168.\n72.166 /26', type: 'start' },
        { id: 'p1', label: '166 与 192 相与\n=128', type: 'proc' },
        { id: 'p2', label: '子网 .128/26\n广播 .191', type: 'proc' },
        { id: 'p3', label: '可用主机\n2^6−2=62 个', type: 'proc' },
        { id: 'c1', label: '目的与 H1\n同子网？', type: 'cond' },
        { id: 'p4', label: 'H2=.100：\n100 相与得 64', type: 'proc' },
        { id: 'p5', label: '≠128 → 不同网\n间接交付', type: 'proc' },
        { id: 'p6', label: 'ARP 问网关\n.129 的 MAC', type: 'proc' },
        { id: 'p7', label: 'H3=.185：\n仍属 .128/26', type: 'proc' },
        { id: 'p8', label: '直接交付：\nARP 问 H3 本身', type: 'proc' },
        { id: 'e1', label: '帧的目的 MAC\n=下一跳的 MAC', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'p1' },
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'c1' },
        { from: 'c1', to: 'p4', label: '否（H2）' },
        { from: 'c1', to: 'p7', label: '是（H3）' },
        { from: 'p4', to: 'p5' },
        { from: 'p5', to: 'p6' },
        { from: 'p7', to: 'p8' },
        { from: 'p6', to: 'e1' },
        { from: 'p8', to: 'e1' },
      ],
    },
  },
]
