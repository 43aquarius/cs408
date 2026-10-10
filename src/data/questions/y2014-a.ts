import type { Question } from '../types'

/** 2014 年 408 统考真题 · 综合应用题 41–47（共 70 分）
 * 数据结构 41–42（23 分）· 组成原理 43–44（23 分）· 操作系统 45–46（15 分）· 网络 47（9 分）
 */
export const y2014a: Question[] = [
  {
    id: 'q-2014-41',
    year: 2014,
    number: 41,
    subject: 'ds',
    type: 'application',
    topic: '二叉树WPL',
    difficulty: 3,
    source: 'real',
    templateId: 'ds-huffman',
    score: 13,
    question:
      '二叉树的带权路径长度（WPL）是二叉树中所有叶结点的带权路径长度之和。给定一棵采用二叉链表存储的二叉树 T，结点结构为（lchild, data, rchild），其中叶结点的 data 域存放其权值（均为正数）。请设计一个时间复杂度尽可能低的算法，计算 T 的 WPL。\n(1) 给出算法的基本设计思想；（4分）\n(2) 根据设计思想，用 C 或 C++ 语言描述算法，关键之处给出简要注释；（6分）\n(3) 说明你所设计算法的时间复杂度和空间复杂度。（3分）',
    answerText:
      '**(1) 设计思想**：叶结点的带权路径长度 = 权值 × 该结点到根的路径长度（边数）。对 T 做一次遍历（先序、中序、后序均可），递归时把当前深度 depth 作为参数下传：设根结点的深度为 0，每深入一层 depth 加 1；每当遇到叶结点（左右孩子均为空），就把 depth × data 累加到累加器 wpl 中。遍历结束时 wpl 即为整棵树的 WPL，只需一趟扫描。\n**(2) C 语言描述**：见代码。\n**(3) 复杂度**：每个结点恰好被访问一次，时间复杂度为 O(n)（n 为结点总数）；空间开销为递归工作栈，深度不超过树高 h，故空间复杂度为 O(h)，最坏（单支树）为 O(n)。',
    code: {
      lang: 'c',
      text: `typedef struct BiTNode {
    int data;                     /* 叶结点存放权值 */
    struct BiTNode *lchild, *rchild;
} BiTNode, *BiTree;

int wpl = 0;                      /* 全局累加器 */

void calcWPL(BiTree t, int depth)
{
    if (t == NULL) return;
    if (t->lchild == NULL && t->rchild == NULL) {
        wpl += depth * t->data;   /* 叶结点：路径长 × 权值 */
        return;
    }
    calcWPL(t->lchild, depth + 1);
    calcWPL(t->rchild, depth + 1);
}

/* 调用前令 wpl = 0，然后执行 calcWPL(T, 0) */`,
    },
    explanation:
      '本题是"带深度参数的递归遍历"范式。关键有三点：一是 WPL 只对叶结点累加，判断条件必须"左右孩子同时为空"，只判一边会把只有一个孩子的结点误当叶子；二是深度起点约定为 0（根的路径长度为 0），若从 1 开始会整体多算一层；三是深度不必显式存储在结点里，作为递归参数传递即可，这正是该算法能达到 O(n) 的原因。也可用层次遍历配合队列保存（结点指针, 深度）二元组，效果相同。',
    visual: {
      kind: 'tree',
      title: '带深度参数遍历计算 WPL（示例树）',
      steps: [
        {
          nodes: [
            { id: 't', label: 'T' },
            { id: 'a', label: 'A', parent: 't' },
            { id: 'b', label: '4', parent: 't' },
            { id: 'c', label: '1', parent: 'a' },
            { id: 'd', label: 'B', parent: 'a' },
            { id: 'e', label: '2', parent: 'd' },
            { id: 'f', label: '3', parent: 'd' },
          ],
          note: '示例树 T：叶结点权值 1、2、3、4；根的深度记 0，每深入一层深度加 1',
        },
        {
          nodes: [
            { id: 't', label: 'T' },
            { id: 'a', label: 'A', parent: 't' },
            { id: 'b', label: '4', parent: 't' },
            { id: 'c', label: '1', parent: 'a' },
            { id: 'd', label: 'B', parent: 'a' },
            { id: 'e', label: '2', parent: 'd' },
            { id: 'f', label: '3', parent: 'd' },
          ],
          highlight: ['c'],
          note: '先遍历左子树：叶 1 深度 2，WPL += 2×1 = 2',
        },
        {
          nodes: [
            { id: 't', label: 'T' },
            { id: 'a', label: 'A', parent: 't' },
            { id: 'b', label: '4', parent: 't' },
            { id: 'c', label: '1', parent: 'a' },
            { id: 'd', label: 'B', parent: 'a' },
            { id: 'e', label: '2', parent: 'd' },
            { id: 'f', label: '3', parent: 'd' },
          ],
          highlight: ['e'],
          note: '叶 2 深度 3，WPL += 3×2，累计 8',
        },
        {
          nodes: [
            { id: 't', label: 'T' },
            { id: 'a', label: 'A', parent: 't' },
            { id: 'b', label: '4', parent: 't' },
            { id: 'c', label: '1', parent: 'a' },
            { id: 'd', label: 'B', parent: 'a' },
            { id: 'e', label: '2', parent: 'd' },
            { id: 'f', label: '3', parent: 'd' },
          ],
          highlight: ['f'],
          note: '叶 3 深度 3，WPL += 3×3，累计 17',
        },
        {
          nodes: [
            { id: 't', label: 'T' },
            { id: 'a', label: 'A', parent: 't' },
            { id: 'b', label: '4', parent: 't' },
            { id: 'c', label: '1', parent: 'a' },
            { id: 'd', label: 'B', parent: 'a' },
            { id: 'e', label: '2', parent: 'd' },
            { id: 'f', label: '3', parent: 'd' },
          ],
          highlight: ['b'],
          note: '右子树叶 4 深度 1，WPL += 1×4 = 21；一次遍历即得整树 WPL，时间 O(n)',
        },
      ],
    },
  },
  {
    id: 'q-2014-42',
    year: 2014,
    number: 42,
    subject: 'ds',
    type: 'application',
    topic: '二叉排序树判定',
    difficulty: 3,
    source: 'real',
    templateId: 'ds-bst-delete',
    score: 10,
    question:
      '试设计一个算法，判断给定的一棵二叉树（二叉链表存储，各结点关键字互不相同）是否为二叉排序树（BST）。若是返回 1，否则返回 0。\n(1) 给出算法的基本设计思想，并说明为什么不能只逐个比较"结点大于其左孩子、小于其右孩子"来判定；（4分）\n(2) 用 C 或 C++ 语言描述算法，关键之处给出简要注释；（4分）\n(3) 构造一个反例，说明"只比较结点与其直接孩子"的方法会误判。（2分）',
    answerText:
      '**(1) 设计思想**：二叉排序树的中序遍历序列严格递增，且这是充要条件。因此对二叉树做一次中序遍历，用指针 pre 记录中序意义下刚访问过的结点：若某次访问时发现当前结点关键字不大于 pre 的关键字，即可断定不是 BST。只比较结点与左右孩子不够，是因为 BST 的定义要求"左子树的所有结点均小于根、右子树的所有结点均大于根"，即约束跨越整个子树，而非仅限直接孩子。\n**(2) C 语言描述**：见代码。\n**(3) 反例**：根为 50，左孩子为 30，30 的右孩子为 60。逐孩子比较全部满足（50 > 30，30 < 60），但 60 位于 50 的左子树中且 60 > 50，中序序列为 30、60、50，不递增，故该树不是二叉排序树——逐孩子比较法会把这棵树误判为 BST。',
    code: {
      lang: 'c',
      text: `typedef struct BiTNode {
    int key;
    struct BiTNode *lchild, *rchild;
} BiTNode, *BiTree;

BiTNode *pre = NULL;              /* 中序意义下的前驱 */

int isBST(BiTree t)
{
    if (t == NULL) return 1;
    if (!isBST(t->lchild)) return 0;    /* 先检查左子树 */
    if (pre != NULL && t->key <= pre->key)
        return 0;                       /* 中序序列出现非递增 */
    pre = t;                            /* 更新前驱指针 */
    return isBST(t->rchild);            /* 再检查右子树 */
}`,
    },
    explanation:
      '本题的陷阱在于"局部有序 ≠ 全局有序"：BST 的有序性是中序意义下的整体递增。用 pre 指针把普通中序遍历改造成"在线检查"，一遍即可完成判定。注意两点：一是判据用 ≤（题设关键字互异，出现相等即非法），若允许相等元素则应按 BST 定义另行讨论；二是 pre 必须在进入右子树之前更新。也可把中序结果存入数组后再检查严格递增，思路相同但多用 O(n) 空间。',
    visual: {
      kind: 'tree',
      title: '反例：逐孩子比较会误判的非 BST',
      steps: [
        {
          nodes: [
            { id: 'r', label: '50' },
            { id: 'a', label: '30', parent: 'r' },
            { id: 'b', label: '60', parent: 'a' },
          ],
          note: '反例树：根 50，左孩子 30，30 的右孩子为 60',
        },
        {
          nodes: [
            { id: 'r', label: '50' },
            { id: 'a', label: '30', parent: 'r' },
            { id: 'b', label: '60', parent: 'a' },
          ],
          highlight: ['r', 'a', 'b'],
          note: '逐孩子比较：50>30、30<60 全部满足，局部比较法会把该树误判为 BST',
        },
        {
          nodes: [
            { id: 'r', label: '50' },
            { id: 'a', label: '30', parent: 'r' },
            { id: 'b', label: '60', parent: 'a' },
          ],
          highlight: ['b', 'r'],
          note: '中序序列 30、60、50：60 在 50 的左子树中却大于 50，非严格递增，不是 BST',
        },
      ],
    },
  },
  {
    id: 'q-2014-43',
    year: 2014,
    number: 43,
    subject: 'co',
    type: 'application',
    topic: '指令格式与寻址',
    difficulty: 3,
    source: 'adapted',
    templateId: 'co-relative',
    score: 12,
    question:
      '某计算机采用 16 位定长指令字格式（原题给出指令格式图，此处文字描述）：操作码字段 OP 4 位，寻址方式字段 M 2 位，寄存器字段 R 2 位（CPU 中设置若干通用寄存器 R0～R3），形式地址字段 A 8 位。主存地址空间 64 KB，按字节编址；指令按 2 字节存放，取指令时每取一个字节 PC 自动加 1。\n(1) 该指令系统最多支持多少条指令？最多有多少个通用寄存器？最多支持多少种寻址方式？（3分）\n(2) 若 M 字段指定直接寻址，A 字段能直接寻址多大范围？若要访问整个 64 KB 主存空间，可采取什么措施？（3分）\n(3) 若 M 字段指定一次间接寻址，取出一个操作数共需访问主存多少次（不含取指令本身）？（3分）\n(4) 转移指令采用相对寻址，A 字段用补码表示，转移指令长 2 字节、执行时 PC 已指向下一条指令。求转移目标地址相对本条转移指令地址的范围。（3分）',
    answerText:
      '**(1)** OP 为 4 位，最多 2^4 = 16 条指令；R 为 2 位，最多 2^2 = 4 个通用寄存器；M 为 2 位，最多 2^2 = 4 种寻址方式。\n**(2)** A 为 8 位，直接寻址范围为 2^8 = 256 个存储单元（256 B），远小于 64 KB。要覆盖整个主存，可采用间接寻址（间址后地址由存储单元长度给出，可达 16 位）、寄存器间接寻址（寄存器位数足够时）、或页面/基址寻址（高位地址由页面寄存器、基址寄存器补足）等。\n**(3)** 一次间接寻址：先访存读出有效地址（1 次），再按有效地址取出操作数（1 次），共 2 次访存（若计入取指令的 2 次访存，则一条该类取数指令共 4 次访存）。\n**(4)** 转移指令占 2 字节，取指结束时 PC = 本条指令地址 + 2。相对寻址目标地址 = (PC) + A，A 为 8 位补码，表示 −128 ～ +127。故目标地址范围为（本条指令地址 + 2 − 128）～（本条指令地址 + 2 + 127），即以下一条指令首地址为基准向前 128 字节、向后 127 字节。',
    explanation:
      '本题把指令格式分析与寻址方式结合。固定套路：位数决定条数（2 的幂）；地址码位数决定寻址范围；间接寻址扩大范围但增加访存次数；相对寻址以"取出该指令后的 PC"为基准。最容易失分的是 (4)：基准不是转移指令自身的地址，而是 PC 已加过 2 之后的值；A 是补码，负数表示向前跳。另外 (3) 要看清"是否含取指令"，答案差 2 次。',
    visual: {
      kind: 'flow',
      title: '直接寻址与一次间接寻址取操作数流程',
      nodes: [
        { id: 's', label: '执行取数指令', type: 'start' },
        { id: 'a', label: '取指令 2 字节\nPC 自动加 2', type: 'proc' },
        { id: 'm', label: '寻址方式 M？', type: 'cond' },
        { id: 'd1', label: '直接寻址\nEA = A（8 位）', type: 'proc' },
        { id: 'd2', label: '访存 1 次取出\n操作数', type: 'proc' },
        { id: 'i1', label: '一次间址：先访存\n从 A 单元读出 EA', type: 'proc' },
        { id: 'i2', label: '再按 EA 访存\n取出操作数', type: 'proc' },
        { id: 'e', label: '操作数送 CPU', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'a' },
        { from: 'a', to: 'm' },
        { from: 'm', to: 'd1', label: '直接' },
        { from: 'd1', to: 'd2' },
        { from: 'd2', to: 'e' },
        { from: 'm', to: 'i1', label: '一次间址' },
        { from: 'i1', to: 'i2' },
        { from: 'i2', to: 'e' },
      ],
    },
  },
  {
    id: 'q-2014-44',
    year: 2014,
    number: 44,
    subject: 'co',
    type: 'application',
    topic: '指令流水线',
    difficulty: 3,
    source: 'real',
    templateId: 'co-pipeline',
    score: 11,
    question:
      '某指令流水线由取指（IF）、译码（ID）、执行（EX）、访存（MEM）、写回（WB）5 个功能段组成，每个功能段耗时 1 个时钟周期。\n(1) 连续输入 10 条互不相关（无数据相关、无控制相关）的指令，完成它们共需多少个时钟周期？此时流水线的实际吞吐率为多少？（3分）\n(2) 若不采用流水线（串行）执行同样的 10 条指令需要 50 个时钟周期，求流水执行相对串行执行的加速比。（3分）\n(3) 若连续执行的 10 条指令中有 2 条条件转移指令且均转移成功，每次转移成功使流水线损失 3 个时钟周期（其后的预取指令作废），则完成这 10 条指令共需多少个时钟周期？（5分）',
    answerText:
      '**(1)** 流水线建立期为 5 个周期，之后每个周期从末段流出一条指令：总周期 T = 5 + (10 − 1) = 14 个时钟周期。实际吞吐率 = 10 / 14 = 5/7 ≈ 0.71 条/时钟周期。\n**(2)** 加速比 = 串行时间 / 流水时间 = 50 / 14 ≈ 3.57。\n**(3)** 转移指令本身仍按流水节奏执行，10 条无冲突基线为 14 个周期；2 次转移成功各额外损失 3 个周期，总周期 = 14 + 2 × 3 = 20 个时钟周期。',
    explanation:
      '理想流水线公式 T = k + (n − 1)（k 为段数，n 为指令数）是本题主干。吞吐率定义为单位时间流出指令数；加速比必须用同一批指令的串行/流水时间相比。第 (3) 问的通用模型是"实际周期 = 理想周期 + Σ每次冒险损失"，控制相关（转移）引起的损失来自预取作废与重新建立。若再叠载数据相关停顿，同样按每次停顿拍数累加即可。',
    visual: {
      kind: 'pipeline',
      title: '10 条指令含 2 次成功转移的时空图（共 20 拍）',
      stages: ['IF', 'ID', 'EX', 'MEM', 'WB'],
      instrs: [
        { name: 'I1', delay: 0 },
        { name: 'I2', delay: 1 },
        { name: 'I3: beq（转移1）', delay: 2, note: '第 1 条转移指令且转移成功：其后预取的指令作废，损失 3 拍' },
        { name: 'I4（转移目标）', delay: 6, note: '断流 3 拍（拍 3~5 取不到有效指令）后于拍 6 重新取指' },
        { name: 'I5', delay: 7 },
        { name: 'I6', delay: 8 },
        { name: 'I7: beq（转移2）', delay: 9, note: '第 2 条转移指令成功，再损失 3 拍' },
        { name: 'I8（转移目标）', delay: 13 },
        { name: 'I9', delay: 14 },
        { name: 'I10', delay: 15, note: '末条指令拍 15 取指、拍 19 写回：共 20 拍 = 14 + 2×3' },
      ],
    },
  },
  {
    id: 'q-2014-45',
    year: 2014,
    number: 45,
    subject: 'os',
    type: 'application',
    topic: '信号量与PV',
    difficulty: 3,
    source: 'real',
    templateId: 'os-pv-model',
    score: 8,
    question:
      '某寺庙有一个可盛 10 桶水的水缸：小和尚从井中打水并倒入缸中（每次倒 1 桶），老和尚从缸中取水饮用（每次取 1 桶）。缸中水满时小和尚不可再倒，缸中水尽时老和尚不可再取；任一时刻只能有一个和尚对水缸进行操作。设有若干小和尚与老和尚并发工作，请用信号量机制协调它们。\n(1) 定义所需的信号量，说明其初值与含义；（3分）\n(2) 用 P、V 操作描述小和尚与老和尚的并发过程；（4分）\n(3) 若小和尚先申请对水缸的互斥操作权、再判断缸中是否还有空位，可能产生什么问题？（1分）',
    answerText:
      '**(1)** 三个信号量：empty = 10，表示缸中还可容纳的水桶数（空位资源）；full = 0，表示缸中现存的水桶数（产品资源）；mutex = 1，实现对水缸操作的互斥。\n**(2)** 见代码：小和尚打水后先 P(empty)（缸满则等待）再 P(mutex)，倒水入缸后 V(mutex)、V(full)；老和尚先 P(full)（缸空则等待）再 P(mutex)，取水后 V(mutex)、V(empty)。\n**(3)** 若把 P(mutex) 放在 P(empty) 之前，缸满时小和尚会"抱着互斥权"阻塞在 empty 上，老和尚因得不到 mutex 而无法取水，双方互相等待，系统死锁。必须遵守"先资源信号量、后互斥信号量"的 P 操作次序。',
    code: {
      lang: 'c',
      text: `semaphore empty = 10;   /* 缸中空位数（可再倒的桶数） */
semaphore full  = 0;    /* 缸中现有水桶数 */
semaphore mutex = 1;    /* 对水缸操作的互斥 */

process 小和尚 {
    while (TRUE) {
        从井中打一桶水;
        P(empty);            /* 缸未满才能倒 */
        P(mutex);            /* 互斥使用水缸 */
        将水倒入缸中;
        V(mutex);
        V(full);             /* 缸中水量 +1 */
    }
}
process 老和尚 {
    while (TRUE) {
        P(full);             /* 缸中有水才能取 */
        P(mutex);
        从缸中取出一桶水;
        V(mutex);
        V(empty);            /* 空位 +1 */
    }
}`,
    },
    explanation:
      '这是容量为 10 的单缓冲生产者—消费者模型：empty/full 是资源信号量，mutex 是互斥信号量。判分要点：初值（资源信号量等于容量与初态产品数，互斥信号量为 1）、P 的次序（先资源后互斥，颠倒即死锁，正是第 (3) 问）、V 的次序（相对自由，但先释放互斥更自然）。若题目改为"多个水缸"或"分苹果/橘子"两类产品，则需为每类产品单独设置同步信号量。',
    visual: {
      kind: 'flow',
      title: '水缸问题的 PV 流程（先资源后互斥）',
      nodes: [
        { id: 's', label: '和尚取/倒水循环', type: 'start' },
        { id: 'q', label: '小和尚？', type: 'cond' },
        { id: 'p1', label: '从井中打一桶水', type: 'proc' },
        { id: 'p2', label: 'P(empty)\n缸未满才倒', type: 'proc' },
        { id: 'p3', label: 'P(mutex)\n互斥用水缸', type: 'proc' },
        { id: 'p4', label: '倒水入缸', type: 'proc' },
        { id: 'p5', label: 'V(mutex)\nV(full)', type: 'proc' },
        { id: 'c1', label: 'P(full)\n缸有水才取', type: 'proc' },
        { id: 'c2', label: 'P(mutex)\n互斥用水缸', type: 'proc' },
        { id: 'c3', label: '从缸中取一桶水', type: 'proc' },
        { id: 'c4', label: 'V(mutex)\nV(empty)', type: 'proc' },
        { id: 'e', label: '循环继续', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'q' },
        { from: 'q', to: 'p1', label: '是（倒水）' },
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5' },
        { from: 'p5', to: 'e' },
        { from: 'q', to: 'c1', label: '否（取水）' },
        { from: 'c1', to: 'c2' },
        { from: 'c2', to: 'c3' },
        { from: 'c3', to: 'c4' },
        { from: 'c4', to: 'e' },
      ],
    },
  },
  {
    id: 'q-2014-46',
    year: 2014,
    number: 46,
    subject: 'os',
    type: 'application',
    topic: '文件共享与链接',
    difficulty: 2,
    source: 'adapted',
    score: 7,
    question:
      '某文件系统采用类似 UNIX 的目录结构：目录项由文件名和指向索引结点（inode）的编号组成，inode 中设有链接计数 count（即指向该 inode 的目录项个数）。用户 A 在自己的目录下创建了文件 F；随后用户 B 为在自己的目录中共享 F，建立了一个指向 F 的 inode 的链接（硬链接）。（原题给出目录结构图，此处文字描述。）\n(1) 说明此时与文件 F 相关的目录结构，并给出 F 的 inode 中 count 的值；（2分）\n(2) 若用户 A 随后删除其目录中的文件 F（删除目录项），F 的数据是否仍可被访问？count 变为多少？（3分）\n(3) 若用户 B 此后也删除其链接，文件系统应对 F 的 inode 与数据块作何处理？（2分）',
    answerText:
      '**(1)** A 的目录与 B 的目录中各存在一个目录项（文件名可以不同，例如 A 下名为 F、B 下名为 G），两个目录项都通过 inode 编号指向 F 的同一个 inode。inode 与文件数据块在系统中只有一份，被两个用户共享；此时 count = 2。\n**(2)** 仍可访问。删除 A 的目录项只是"取消链接"：系统将 count 由 2 减为 1，并从 A 的目录中撤销该目录项；count > 0 期间不回收 inode 与数据块，B 仍可通过自己目录中的链接访问同一文件内容。\n**(3)** B 删除链接后 count 由 1 减为 0，此时该 inode 及其管理的所有数据块、间接地址块才被文件系统真正回收（置为空闲），文件被彻底删除。可见硬链接机制下"删除文件"的实质是删除一个名字，仅当最后一个名字消失时才释放存储空间。',
    explanation:
      '本题考查硬链接与引用计数的语义。核心结论有三：一是硬链接是"多个目录项 → 一个 inode"，共享同一份数据，故 count 反映指向它的目录项数；二是删除只做减计数，减到 0 才回收，这保证了删除任一链接不影响其他用户；三是与符号链接（软链接）对比——软链接文件中存放路径名、不增加 count，原文件被删后软链接会失效。这些性质是"文件共享"类题目的通用判分点。',
  },
  {
    id: 'q-2014-47',
    year: 2014,
    number: 47,
    subject: 'cn',
    type: 'application',
    topic: 'TCP拥塞控制',
    difficulty: 3,
    source: 'real',
    templateId: 'cn-cwnd',
    score: 9,
    question:
      '主机甲与主机乙之间建立了一条 TCP 连接，双方约定的最大报文段长度 MSS = 1 KB。连接建立后，主机甲的初始拥塞窗口 cwnd = 1 MSS，初始慢开始门限 ssthresh = 8 KB。假设忽略报文段发送、传播与处理时延，甲每经过一个 RTT 收到全部确认后，按慢开始/拥塞避免规律调整 cwnd。\n(1) 写出第 1～6 个 RTT 周期开始时（即各轮发送数据时）cwnd 的大小，并指出从第几个 RTT 起改用拥塞避免算法；（4分）\n(2) 若第 6 个 RTT 结束时发生超时（按此时 cwnd = 10 KB 处理），给出新的 ssthresh 与 cwnd，并写出其后第 1、2 个 RTT 开始时的 cwnd；（3分）\n(3) 简述慢开始与拥塞避免两个阶段 cwnd 的变化规律。（2分）',
    answerText:
      '**(1)** 各 RTT 开始时的 cwnd（单位 KB）依次为：1、2、4、8、9、10。第 1～3 轮为慢开始，每经过一个 RTT cwnd 加倍；第 4 轮开始时 cwnd 已达到 ssthresh = 8 KB，从该轮起执行拥塞避免，每轮只线性增加 1 KB（8 → 9 → 10）。\n**(2)** 超时后：新 ssthresh = 超时时 cwnd 的一半 = 10 / 2 = 5 KB；cwnd 重置为 1 个 MSS = 1 KB，重新进入慢开始。其后第 1 个 RTT 开始时 cwnd = 1 KB，第 2 个 RTT 开始时 cwnd = 2 KB（尚未达到 5 KB，仍按每轮加倍增长）。\n**(3)** 慢开始阶段：cwnd 从 1 MSS 起，每经过一个 RTT 按指数规律加倍，直到达到 ssthresh 或出现拥塞；拥塞避免阶段：cwnd ≥ ssthresh 后每经过一个 RTT 仅加 1 个 MSS，线性增长，直到发生拥塞或受接收窗口限制。',
    explanation:
      '本题考查 TCP 拥塞控制的窗口演化。关键点：一是"达到门限的当轮即切换算法"，即 cwnd 涨到 ssthresh 时由指数转线性；二是超时处理规则——ssthresh = max(当前 cwnd 的一半, 2 MSS)，cwnd 归 1，重走慢开始（若收到 3 个重复确认则走快重传/快恢复，ssthresh 减半而 cwnd 不归 1，本题是超时情形）；三是实际发送窗口取 min(rwnd, cwnd)。画"锯齿图"或按 RTT 列表是求解这类题最稳妥的方式。',
    visual: {
      kind: 'cwnd',
      title: '拥塞窗口逐轮演化（MSS = 1 KB，单位 KB）',
      points: [
        { round: 1, cwnd: 1, ssthresh: 8 },
        { round: 2, cwnd: 2, ssthresh: 8 },
        { round: 3, cwnd: 4, ssthresh: 8 },
        { round: 4, cwnd: 8, ssthresh: 8 },
        { round: 5, cwnd: 9, ssthresh: 8 },
        { round: 6, cwnd: 10, ssthresh: 8, event: '超时' },
        { round: 7, cwnd: 1, ssthresh: 5 },
        { round: 8, cwnd: 2, ssthresh: 5 },
      ],
    },
  },
]
