import type { Question } from '../types'

/** 2019 年 408 统考真题 · 综合应用题 41–47（共 70 分）
 * 数据结构 41–42（23 分）· 组成原理 43–44（23 分）· 操作系统 45–46（15 分）· 网络 47（9 分）
 */
export const y2019a: Question[] = [
  {
    id: 'q-2019-41',
    year: 2019,
    number: 41,
    subject: 'ds',
    type: 'application',
    topic: '栈与队列',
    difficulty: 3,
    source: 'adapted',
    score: 8,
    question:
      '队列 Q 只允许在队尾插入、队头删除；现有两个顺序栈 S1 和 S2（容量均为 n，初始为空），要求用这两个栈模拟队列 Q 的入队和出队操作。\n(1) 描述用 S1、S2 模拟队列入队、出队操作的基本思想；（4 分）\n(2) 该结构在什么情况下队满、什么情况下队空？给出判满、判空的条件；（2 分）\n(3) 该“队列”最多能同时容纳多少个元素？（2 分）',
    answerText:
      '**(1) 设计思想**：让 S1 专作入队栈，S2 专作出队栈。**入队（enqueue）**：若 S1 已满且 S2 为空，则先把 S1 中全部元素依次弹出并压入 S2（顺序恰好倒转，S2 栈顶即最先入队的元素），再将要入队的元素压入 S1；若 S1 满而 S2 非空，则队满，入队失败；否则直接把新元素压入 S1。**出队（dequeue）**：若 S2 非空，弹出 S2 栈顶即队头元素；若 S2 为空而 S1 非空，先把 S1 全部元素倒入 S2，再弹出 S2 栈顶；若两栈皆空，则队空，出队失败。\n**(2)** 队空条件：S1 与 S2 均为空（S1.top = −1 且 S2.top = −1）。队满条件：S1 已满（S1.top = n − 1）且 S2 非空（S2.top ≥ 0）——此时无法倒转也无法压栈。注意 S1 满而 S2 空时并不算满，倒转后即可继续入队。\n**(3)** 两栈可同时装满，故该“队列”最多可容纳 **2n** 个元素。',
    explanation:
      '本题考查栈与队列的逻辑互实现，核心是“两次倒转恢复原序”：栈把序列倒转一次，从一个栈倒入另一个栈再倒转一次，回到先进先出次序。易错点有二：一是判满不能只看 S1 满，必须同时 S2 非空才真满（S2 为空时倒转可腾出空间）；二是倒转操作只在出队需要且 S2 空时执行，避免每次入队都倒栈造成 O(n) 均摊退化——每个元素至多被压栈 4 次（入 S1、倒 S2 各两次压弹），均摊每次操作 O(1)。',
    visual: {
      kind: 'flow',
      title: '双栈模拟队列：S1 入队栈、S2 出队栈（最多容纳 2n 个元素）',
      nodes: [
        { id: 's', label: '队列操作请求', type: 'start' },
        { id: 'c0', label: '入队 / 出队？', type: 'cond' },
        { id: 'e1', label: '入队 x：\nS1 已满？', type: 'cond' },
        { id: 'e2', label: '直接压入 S1', type: 'proc' },
        { id: 'e3', label: 'S2 为空？', type: 'cond' },
        { id: 'e4', label: 'S1 全部倒入 S2\n腾空后压 x 入 S1\n（两次倒转=FIFO）', type: 'proc' },
        { id: 'e5', label: '队满：\nS1 满且 S2 非空\n入队失败', type: 'end' },
        { id: 'd1', label: '出队：\nS2 非空？', type: 'cond' },
        { id: 'd2', label: '弹出 S2 栈顶\n（即队头元素）', type: 'proc' },
        { id: 'd3', label: 'S1 非空？', type: 'cond' },
        { id: 'd4', label: 'S1 全部倒入 S2\n再弹 S2 栈顶', type: 'proc' },
        { id: 'd5', label: '队空：\n两栈皆为空\n出队失败', type: 'end' },
        { id: 'e', label: '操作完成\n（容量最多 2n）', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'c0' },
        { from: 'c0', to: 'e1', label: '入队' },
        { from: 'c0', to: 'd1', label: '出队' },
        { from: 'e1', to: 'e2', label: '否' },
        { from: 'e1', to: 'e3', label: '是' },
        { from: 'e3', to: 'e4', label: '是' },
        { from: 'e3', to: 'e5', label: '否' },
        { from: 'e2', to: 'e' },
        { from: 'e4', to: 'e' },
        { from: 'd1', to: 'd2', label: '是' },
        { from: 'd1', to: 'd3', label: '否' },
        { from: 'd3', to: 'd4', label: '是' },
        { from: 'd3', to: 'd5', label: '否' },
        { from: 'd2', to: 'e' },
        { from: 'd4', to: 'e' },
      ],
    },
  },
  {
    id: 'q-2019-42',
    year: 2019,
    number: 42,
    subject: 'ds',
    type: 'application',
    topic: '单链表算法设计',
    difficulty: 3,
    source: 'real',
    score: 15,
    question:
      '设有一个整数序列存放在带头结点的单链表 L 中。设计一个算法：每次找出链表中数据域值最小的结点，输出其值，然后将其从链表中删除；重复该操作直到链表为空，最后删除（释放）头结点。\n(1) 给出算法的基本设计思想；（5 分）\n(2) 用 C 语言描述算法，关键之处给出注释；（8 分）\n(3) 说明算法的时间复杂度和空间复杂度。（2 分）',
    answerText:
      '**(1) 设计思想**：链表为空（只剩头结点）前循环执行：用工作指针 p 从首元结点开始扫描，同时用 minp 记录当前最小值结点、minpre 记录其前驱（单链表删结点必须先接好前驱）；扫描结束后输出 minp 的值，令 minpre 的指针跳过 minp 完成摘链，free(minp)。因为单链表删除需要前驱，所以查找最小结点时同步维护前驱指针。每轮删去一个最小结点，各轮输出的值恰好构成递增序列，等价于链表上的选择排序。\n**(2) C 语言描述**：见代码。\n**(3) 复杂度**：第 i 轮扫描约 n − i 个结点，比较总次数为 n + (n−1) + … + 1 = n(n−1)/2，时间复杂度 **O(n²)**；只使用常数个辅助指针，空间复杂度 **O(1)**。',
    code: {
      lang: 'c',
      text: `typedef struct LNode {
    int data;
    struct LNode *next;
} LNode, *LinkList;

void print_and_delete_min(LinkList L)
{
    LNode *pre, *p, *minpre, *minp;
    while (L->next != NULL) {       /* 链表非空(还有数据结点) */
        pre = L;  p = L->next;      /* 从首元结点开始扫描 */
        minpre = pre;  minp = p;
        while (p != NULL) {         /* 找最小结点及其前驱 */
            if (p->data < minp->data) {
                minpre = pre;  minp = p;
            }
            pre = p;  p = p->next;
        }
        printf("%d ", minp->data);  /* 输出最小值 */
        minpre->next = minp->next;  /* 摘链 */
        free(minp);                 /* 释放结点 */
    }
    free(L);                        /* 删除头结点 */
}`,
    },
    explanation:
      '本题是链表综合算法设计题。三个关键点：①删除单链表结点必须持有其前驱，因此查找最小值时 pre、minpre 双双随行，初始 minpre 指向头结点、minp 指向首元结点；②每轮结束必须重新从 L->next 扫描（新一轮的最小值在剩余结点中产生），不要沿用上一轮的 minp；③最后 free(L) 释放头结点，这是题目要求的收尾。若把输出改为插入新链表，本题就变为链表选择排序，思想完全一致。',
    visual: {
      kind: 'flow',
      title: '每轮找最小结点并删除（链表上的选择排序，O(n²)）',
      nodes: [
        { id: 's', label: '带头结点单链表 L\n（尚有数据结点）', type: 'start' },
        { id: 'c1', label: 'L->next 为空？', type: 'cond' },
        { id: 'p1', label: '扫描初始化：\np 指首元结点\nminp/minpre 随行', type: 'proc' },
        { id: 'c2', label: 'p == NULL？\n（扫描结束？）', type: 'cond' },
        { id: 'c3', label: 'p->data 更小？', type: 'cond' },
        { id: 'p3', label: '更新 minp=p\nminpre=pre', type: 'proc' },
        { id: 'p4', label: 'pre、p 同步后移', type: 'proc' },
        { id: 'p5', label: '输出 minp->data', type: 'proc' },
        { id: 'p6', label: '摘链：\nminpre->next =\nminp->next', type: 'proc' },
        { id: 'p7', label: 'free(minp)', type: 'proc' },
        { id: 'e', label: 'free(L) 释放头结点', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'c1' },
        { from: 'c1', to: 'e', label: '是：已只剩头结点' },
        { from: 'c1', to: 'p1', label: '否：进入本轮' },
        { from: 'p1', to: 'c2' },
        { from: 'c2', to: 'c3', label: '否' },
        { from: 'c2', to: 'p5', label: '是：找完最小' },
        { from: 'c3', to: 'p3', label: '是：更小' },
        { from: 'c3', to: 'p4', label: '否' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'c2', label: '取下一结点' },
        { from: 'p5', to: 'p6' },
        { from: 'p6', to: 'p7' },
        { from: 'p7', to: 'c1', label: '进入下一轮' },
      ],
    },
  },
  {
    id: 'q-2019-43',
    year: 2019,
    number: 43,
    subject: 'co',
    type: 'application',
    topic: 'CPU 性能计算',
    difficulty: 3,
    source: 'adapted',
    templateId: 'co-performance',
    score: 12,
    question:
      '某计算机 CPU 的主频为 2.0 GHz。某程序 P 在该机上共执行 10⁹ 条指令，各类指令的条数与 CPI 如下表：\n算术/逻辑类：6×10⁸ 条，CPI = 1\n访存类（load/store）：2×10⁸ 条，CPI = 2\n转移类：2×10⁸ 条，CPI = 3\n(1) 求程序 P 的平均（综合）CPI；（3 分）\n(2) 求程序 P 的执行时间；（3 分）\n(3) 求该机运行程序 P 时的 MIPS 速率；（2 分）\n(4) 若通过编译优化使访存类指令减少一半（其余指令条数不变），求优化后程序 P 的执行时间。（4 分）',
    answerText:
      '**(1)** 总时钟周期数 = 6×10⁸×1 + 2×10⁸×2 + 2×10⁸×3 = (6 + 4 + 6)×10⁸ = 1.6×10⁹。平均 CPI = 1.6×10⁹ ÷ 10⁹ = **1.6**。\n**(2)** 执行时间 = 总时钟周期数 ÷ 主频 = 1.6×10⁹ ÷ 2.0×10⁹ = **0.8 s**。\n**(3)** MIPS = 指令条数 ÷ (执行时间 × 10⁶) = 10⁹ ÷ (0.8 × 10⁶) = **1250 MIPS**。\n**(4)** 优化后：算术/逻辑 6×10⁸ 条（CPI 1），访存 10⁸ 条（CPI 2），转移 2×10⁸ 条（CPI 3），总指令 9×10⁸ 条；周期数 = 6×10⁸ + 2×10⁸ + 6×10⁸ = 1.4×10⁹，执行时间 = 1.4×10⁹ ÷ 2.0×10⁹ = **0.7 s**（平均 CPI = 1.4×10⁹ ÷ 9×10⁸ ≈ 1.56，但时间只取决于周期总数与主频）。',
    explanation:
      '本题是 CPU 性能指标的标准计算模型，核心关系：执行时间 = 指令条数 × CPI ÷ 主频，MIPS = 主频 ÷ (CPI × 10⁶)。计算时务必用“各类指令周期数求和”而不是先对 CPI 加权再乘总条数（两者等价，前者不易错）。第 (4) 问的常见错误是只减指令条数而忘记重新计算周期数，或误以为减少访存指令应按其 CPI=2 折算节省时间——直接重算总周期数最稳妥。',
    visual: {
      kind: 'flow',
      title: 'CPI → 执行时间 → MIPS 计算链（主频 2.0 GHz）',
      nodes: [
        { id: 's', label: '程序 P 共 10⁹ 条\n主频 2.0 GHz', type: 'start' },
        { id: 'p1', label: '各类条数×CPI 求和\n= 6+4+6 (×10⁸)\n= 1.6×10⁹', type: 'proc' },
        { id: 'p2', label: '平均 CPI\n= 1.6×10⁹÷10⁹\n= 1.6', type: 'proc' },
        { id: 'p3', label: '执行时间 = 周期÷主频\n= 1.6÷2 (×10⁹)\n= 0.8 s', type: 'proc' },
        { id: 'p4', label: 'MIPS = 条数÷\n(时间×10⁶)\n= 1250 MIPS', type: 'proc' },
        { id: 'p5', label: '编译优化：\n访存类指令减半', type: 'proc' },
        { id: 'p6', label: '周期 = 6+2+6\n(×10⁸)\n= 1.4×10⁹', type: 'proc' },
        { id: 'e', label: '优化后执行时间\n= 0.7 s', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'p1' },
        { from: 'p1', to: 'p2', label: '÷ 指令条数' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5' },
        { from: 'p5', to: 'p6', label: '重算周期数' },
        { from: 'p6', to: 'e' },
      ],
    },
  },
  {
    id: 'q-2019-44',
    year: 2019,
    number: 44,
    subject: 'co',
    type: 'application',
    topic: '中断与 DMA',
    difficulty: 3,
    source: 'adapted',
    score: 11,
    question:
      '某计算机 CPU 主频为 500 MHz，与磁盘之间分别以程序中断方式和 DMA 方式传送数据，磁盘的数据传输率为 4 MB/s。采用中断方式时，每次中断传送一个 8 字节的双字，每执行一次中断服务程序（含保护与恢复现场等全部开销）共需 200 个时钟周期；采用 DMA 方式时，一次 DMA 传送 8 KB 数据，DMA 预处理与后处理（初始化、结束中断等）共需 500 个时钟周期。\n(1) 简述程序中断方式下一次数据传送的完整过程；（3 分）\n(2) 中断方式下，CPU 用于该磁盘输入/输出的时间占 CPU 总时间的百分比；（4 分）\n(3) DMA 方式下该百分比，并说明 DMA 传送期间 CPU 如何与 DMA 控制器共享主存（周期挪用）。（4 分）',
    answerText:
      '**(1)** 磁盘准备好一个数据后向 CPU 发中断请求；CPU 在当前指令执行周期结束时采样中断请求，响应条件满足则由中断隐指令关中断、保存断点、取出服务程序入口地址；随后执行中断服务程序：保护现场、传送（读/写）8 字节数据、恢复现场、开中断并返回断点继续执行原程序。\n**(2)** 每秒需传送 4 MB ÷ 8 B = 512K（2^19）次，即每秒 2^19 次中断；每次 200 个时钟周期，每秒 I/O 开销 = 2^19 × 200 ≈ 1.05×10⁸ 个周期；CPU 每秒共有 5×10⁸ 个周期，占比 ≈ 1.05×10⁸ ÷ 5×10⁸ ≈ **21%**。\n**(3)** 每秒 DMA 传送次数 = 4 MB ÷ 8 KB = 512 次，每次开销 500 周期，每秒共 512 × 500 = 2.56×10⁵ 个周期，占比 = 2.56×10⁵ ÷ 5×10⁸ ≈ **0.05%**。DMA 传送期间，DMA 控制器与 CPU 以周期挪用方式共享主存：DMA 需要访存时申请并挪用一个存储周期传送一个数据，CPU 该周期暂停访存（但可继续执行不访存的指令），挪用结束 CPU 立即恢复，从而既保证成块数据的高速传送，又最大限度减少对 CPU 的影响。',
    explanation:
      '本题对比中断与 DMA 的 CPU 开销。解题三要素：主频决定每秒周期总数；数据率 ÷ 每次传送量 = 每秒次数；次数 × 每次开销 = 每秒占用周期数，占比 = 占用周期数 ÷ 每秒总周期数。结论与经验法则一致：中断方式以字为单位打断 CPU，高速设备会使开销急剧上升；DMA 把干预粒度扩大到块，CPU 只管首尾，占比下降两个数量级以上（本题约 21% → 0.05%）。第 (1) 问的“关中断、保存断点、引出入口地址”由中断隐指令（硬件）自动完成，是简答得分点。',
    visual: {
      kind: 'flow',
      title: '中断与 DMA 的 CPU 开销对比（磁盘 4 MB/s，主频 500 MHz）',
      nodes: [
        { id: 's', label: '磁盘传输率 4 MB/s\nCPU 主频 500 MHz', type: 'start' },
        { id: 'c0', label: '传送方式？', type: 'cond' },
        { id: 'i0', label: '程序中断方式\n设备就绪→请求\n→CPU 响应服务', type: 'proc' },
        { id: 'i1', label: '每次传 8 B\n每秒 4MB÷8B\n= 512K 次', type: 'proc' },
        { id: 'i2', label: '每次 200 周期\n开销 = 512K×200\n= 1.05×10⁸\n个周期每秒', type: 'proc' },
        { id: 'i3', label: '占比 = 1.05×10⁸\n÷ 5×10⁸ ≈ 21%', type: 'end' },
        { id: 'd0', label: 'DMA 方式\nCPU 只管首尾\n（预处理+结束）', type: 'proc' },
        { id: 'd1', label: '每次传 8 KB\n每秒 4MB÷8KB\n= 512 次', type: 'proc' },
        { id: 'd2', label: '每次 500 周期\n开销 = 512×500\n= 2.56×10⁵\n个周期每秒', type: 'proc' },
        { id: 'd3', label: '占比 = 2.56×10⁵\n÷ 5×10⁸\n≈ 0.05%', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'c0' },
        { from: 'c0', to: 'i0', label: '程序中断' },
        { from: 'c0', to: 'd0', label: 'DMA' },
        { from: 'i0', to: 'i1' },
        { from: 'i1', to: 'i2' },
        { from: 'i2', to: 'i3' },
        { from: 'd0', to: 'd1' },
        { from: 'd1', to: 'd2' },
        { from: 'd2', to: 'd3' },
      ],
    },
  },
  {
    id: 'q-2019-45',
    year: 2019,
    number: 45,
    subject: 'os',
    type: 'application',
    topic: '文件索引结构',
    difficulty: 3,
    source: 'adapted',
    score: 7,
    question:
      '某文件系统采用混合（多级）索引结构：每个文件的索引结点（inode）中含 10 个直接地址项、1 个一次间接地址项和 1 个二次间接地址项。磁盘块大小为 4 KB，每个地址项占 4 B。\n(1) 一个一次间接地址项通过间接块最多能指向多少个磁盘块？该部分可表示的最大文件长度是多少？（2 分）\n(2) 该文件系统中单个文件的最大长度是多少？（用 2 的幂表示）（4 分）\n(3) 若某文件大小恰为 1 MB（其数据部分占 256 个磁盘块），该文件共占用多少个磁盘块（含索引块）？（1 分）',
    answerText:
      '**(1)** 一个间接块（4 KB）可存放 4 KB ÷ 4 B = 1024 个地址项，故一次间接部分最多指向 **1024 个磁盘块**，可表示的最大长度为 1024 × 4 KB = **4 MB**。\n**(2)** 直接部分：10 × 4 KB = 40 KB；一次间接：1024 × 4 KB = 4 MB = 2^22 B；二次间接：1024 × 1024 个块 × 4 KB = 2^20 × 2^12 = 4 GB = 2^32 B。单个文件最大长度 = 40 KB + 4 MB + 4 GB（即 10×2^12 + 2^22 + 2^32 字节，约为 **4 GB + 4 MB + 40 KB**）。\n**(3)** 1 MB 数据 = 256 块：前 10 块用直接地址，其余 246 块需一次间接（1 个间接块）。共占用 256（数据块）+ 1（间接块）= **257 个磁盘块**。',
    explanation:
      '混合索引计算的关键是“地址项个数 = 磁盘块大小 ÷ 地址项长度”。注意第 (3) 问问的是“占用的磁盘块总数”，须把间接块本身计入（数据块 + 索引块）；如果文件超过 1034 块（10 + 1024）才需要动用二次间接，届时还要加上二次间接块本身与各一次间接块。直接地址访存只需 1 次读盘，间接每加一级就多一次读盘，这是小文件用直接地址、大文件逐级扩展的设计动机。',
    visual: {
      kind: 'tree',
      title: '混合索引结构展开（10 直接 + 1 一次间接 + 1 二次间接）',
      steps: [
        {
          nodes: [
            { id: 'root', label: 'inode' },
            { id: 'd', label: '直接×10', parent: 'root' },
            { id: 'si', label: '一次间接', parent: 'root' },
            { id: 'di', label: '二次间接', parent: 'root' },
          ],
          note: '每个 inode 含 10 个直接地址项、1 个一次间接地址项、1 个二次间接地址项；磁盘块 4 KB，地址项 4 B',
        },
        {
          nodes: [
            { id: 'root', label: 'inode' },
            { id: 'd', label: '直接×10', parent: 'root' },
            { id: 'si', label: '一次间接', parent: 'root' },
            { id: 'di', label: '二次间接', parent: 'root' },
            { id: 'dl', label: '40KB', parent: 'd' },
          ],
          highlight: ['d', 'dl'],
          note: '直接地址：10 个地址项直接指向 10 个数据块，共 10 × 4 KB = 40 KB',
        },
        {
          nodes: [
            { id: 'root', label: 'inode' },
            { id: 'd', label: '直接×10', parent: 'root' },
            { id: 'si', label: '一次间接', parent: 'root' },
            { id: 'di', label: '二次间接', parent: 'root' },
            { id: 'dl', label: '40KB', parent: 'd' },
            { id: 'ib1', label: '间接块', parent: 'si' },
            { id: 'sl', label: '4MB', parent: 'ib1' },
          ],
          highlight: ['si', 'ib1', 'sl'],
          note: '一次间接：间接块（4 KB）可存 4 KB ÷ 4 B = 1024 个地址，指向 1024 块 = 4 MB',
        },
        {
          nodes: [
            { id: 'root', label: 'inode' },
            { id: 'd', label: '直接×10', parent: 'root' },
            { id: 'si', label: '一次间接', parent: 'root' },
            { id: 'di', label: '二次间接', parent: 'root' },
            { id: 'dl', label: '40KB', parent: 'd' },
            { id: 'ib1', label: '间接块', parent: 'si' },
            { id: 'sl', label: '4MB', parent: 'ib1' },
            { id: 'ib2', label: '间接块', parent: 'di' },
            { id: 'ib3', label: '间接块', parent: 'ib2' },
            { id: 'tl', label: '4GB', parent: 'ib3' },
          ],
          highlight: ['di', 'ib2', 'ib3', 'tl'],
          note: '二次间接：1024 × 1024 块 × 4 KB = 4 GB；单个文件最大 40 KB + 4 MB + 4 GB',
        },
        {
          nodes: [
            { id: 'root', label: 'inode' },
            { id: 'd', label: '直接×10', parent: 'root' },
            { id: 'si', label: '一次间接', parent: 'root' },
            { id: 'di', label: '二次间接', parent: 'root' },
            { id: 'dl', label: '40KB', parent: 'd' },
            { id: 'ib1', label: '间接块', parent: 'si' },
            { id: 'sl', label: '4MB', parent: 'ib1' },
            { id: 'ib2', label: '间接块', parent: 'di' },
            { id: 'ib3', label: '间接块', parent: 'ib2' },
            { id: 'tl', label: '4GB', parent: 'ib3' },
          ],
          highlight: ['d', 'dl', 'si', 'ib1', 'sl'],
          note: '1 MB 文件：10 块直接 + 246 块一次间接 = 256 个数据块，另加 1 个间接块，共占用 257 块',
        },
      ],
    },
  },
  {
    id: 'q-2019-46',
    year: 2019,
    number: 46,
    subject: 'os',
    type: 'application',
    topic: '信号量与同步',
    difficulty: 3,
    source: 'adapted',
    templateId: 'os-pv-model',
    score: 8,
    question:
      '桌上有一个盘子，每次只能放入（或取出）一个水果。爸爸专门向盘中放苹果，妈妈专门向盘中放橘子，儿子专门等吃盘中的橘子，女儿专门等吃盘中的苹果。四人可并发执行。\n(1) 分析四人之间的同步关系，设置信号量并给出初值及含义；（3 分）\n(2) 用 P、V 操作描述四个并发进程的活动；（4 分）\n(3) 若把盘子改为一次可容纳 2 个水果（放、取仍每次一个），各信号量的初值应如何调整？为什么？（1 分）',
    answerText:
      '**(1)** 盘子是容量为 1 的缓冲区，父母是生产者（生产两种“产品”），儿女是消费者，各自只消费一种水果。信号量：plate = **1**（盘中空闲位置数，初值 1 表示可放一个水果）；apple = **0**（盘中苹果数）；orange = **0**（盘中橘子数）。\n**(2)** 见代码：爸爸放苹果前 P(plate)，放好后 V(apple)；妈妈同理；女儿 P(apple) 后取走苹果并 V(plate)；儿子 P(orange) 后取走橘子并 V(plate)。plate 保证互斥地使用盘子容量，apple/orange 保证只有对应水果存在时消费者才行动。\n**(3)** plate 的初值改为 **2**（盘中可同时放 2 个水果），apple、orange 初值仍为 0。因为盘容量增大只影响“可放水果的空位数”，即只需修改缓冲区资源信号量的初值；产品信号量的初值恒为 0（开始时没有任何水果）。',
    code: {
      lang: 'c',
      text: `semaphore plate  = 1;   /* 盘中空闲位置数 */
semaphore apple = 0;    /* 盘中苹果数 */
semaphore orange = 0;   /* 盘中橘子数 */

爸爸 {
    while (TRUE) {
        准备一个苹果;
        P(plate);            /* 申请盘中的空位 */
        把苹果放入盘中;
        V(apple);            /* 苹果数加1, 唤醒女儿 */
    }
}
妈妈 {
    while (TRUE) {
        准备一个橘子;
        P(plate);
        把橘子放入盘中;
        V(orange);           /* 唤醒儿子 */
    }
}
女儿 {
    while (TRUE) {
        P(apple);            /* 等盘中有苹果 */
        从盘中取出苹果;
        V(plate);            /* 释放空位 */
        吃苹果;
    }
}
儿子 {
    while (TRUE) {
        P(orange);
        从盘中取出橘子;
        V(plate);
        吃橘子;
    }
}`,
    },
    explanation:
      '本题为“多生产者—多消费者”同步模型的典型题（生产两种产品的生产者与对应的消费者）。解题套路：缓冲区设一个空间资源信号量（plate），每种产品各设一个计数信号量（apple、orange），生产者放产品前对空间做 P、放完后对产品计数做 V，消费者对称地先 P 产品、取走后 V 空间。若把盘子的“互斥访问”实现为 mutex = 1 也可以，但注意在容量为 1 时 plate 同时起到了互斥作用；改为容量 2 后若仍要求“每次只能一人操作盘子”，还需另加 mutex = 1 保护取放动作本身。',
    visual: {
      kind: 'flow',
      title: '爸爸放苹果 / 女儿取苹果的 PV 流程（妈妈与儿子对称）',
      nodes: [
        { id: 's', label: '信号量初值\nplate=1\napple=0\norange=0', type: 'start' },
        { id: 'q1', label: '爸爸：准备苹果', type: 'proc' },
        { id: 'q2', label: 'P(plate)\n申请盘中空位', type: 'proc' },
        { id: 'qc', label: 'plate<0？', type: 'cond' },
        { id: 'q3', label: '把苹果放入盘中', type: 'proc' },
        { id: 'qw', label: '阻塞\n等女儿 V(plate)\n唤醒后继续', type: 'proc' },
        { id: 'q4', label: 'V(apple)\n唤醒女儿', type: 'proc' },
        { id: 'r1', label: '女儿：P(apple)', type: 'proc' },
        { id: 'rc', label: 'apple<0？', type: 'cond' },
        { id: 'r2', label: '取出盘中苹果', type: 'proc' },
        { id: 'rw', label: '阻塞\n等爸爸 V(apple)\n唤醒后继续', type: 'proc' },
        { id: 'r3', label: 'V(plate)\n归还空位', type: 'proc' },
        { id: 'e', label: '循环往复\n（妈妈/儿子对称）', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'q1', label: '爸爸放苹果' },
        { from: 's', to: 'r1', label: '女儿取苹果' },
        { from: 'q1', to: 'q2' },
        { from: 'q2', to: 'qc' },
        { from: 'qc', to: 'q3', label: '否：有空位' },
        { from: 'qc', to: 'qw', label: '是：无空位' },
        { from: 'qw', to: 'q3', label: '被唤醒' },
        { from: 'q3', to: 'q4' },
        { from: 'r1', to: 'rc' },
        { from: 'rc', to: 'r2', label: '否：有苹果' },
        { from: 'rc', to: 'rw', label: '是：无苹果' },
        { from: 'rw', to: 'r2', label: '被唤醒' },
        { from: 'r2', to: 'r3' },
        { from: 'q4', to: 'e' },
        { from: 'r3', to: 'e' },
      ],
    },
  },
  {
    id: 'q-2019-47',
    year: 2019,
    number: 47,
    subject: 'cn',
    type: 'application',
    topic: '网络拓扑与通信过程',
    difficulty: 3,
    source: 'adapted',
    score: 9,
    question:
      '某网络拓扑如下（原题带图，此处文字描述）：主机 H1、H2 连接以太网交换机 SW，SW 与路由器 R 的接口 E0 相连；R 的接口 E1 与 Web 服务器 S 相连。划分情况：网段一 192.168.1.0/24：H1（192.168.1.10）、H2（192.168.1.20）、R 的 E0 接口（192.168.1.254）；网段二 202.100.1.0/24：R 的 E1 接口（202.100.1.1）、S（202.100.1.100）。S 的域名为 www.test.com。\n(1) 为使 H1 能通过域名访问 S，除 IP 地址与子网掩码外，H1 还应配置什么参数？其作用是什么？（2 分）\n(2) H1 首次用域名访问 S 的 Web 服务，在 TCP 连接建立之前，H1 需要先后完成哪些网络层/应用层的准备工作？（3 分）\n(3) H1 发往 S 的 IP 分组经 R 转发前后，分组中的源 IP、目的 IP 是否改变？H1→R.E0 段与 R.E1→S 段两段以太网帧中的源 MAC、目的 MAC 分别是什么？（4 分）',
    answerText:
      '**(1)** H1 还应配置**默认网关（缺省路由）为 192.168.1.254**，以及 **DNS 域名服务器的 IP 地址**。默认网关指明去往其他网络（如网段二、Internet）的分组交给谁转发；DNS 服务器用于把 www.test.com 解析为 202.100.1.100。\n**(2)** ① **DNS 域名解析**：H1 向本地域名服务器查询 www.test.com（通常递归查询，本地服务器以迭代方式向根/权限服务器询问），得到 S 的 IP 202.100.1.100。② **ARP 解析默认网关的 MAC**：因目的主机不在本网段，帧须先送达网关；若 H1 的 ARP 高速缓存中没有 192.168.1.254 对应的 MAC 地址，H1 广播 ARP 请求并得到 R 的 E0 接口 MAC。两项完成后才发起 TCP 连接（SYN）。\n**(3)** 源 IP（192.168.1.10）与目的 IP（202.100.1.100）在整个传输过程中**都不改变**（IP 提供端到端传输）。帧的 MAC 地址逐跳变化：H1→R.E0 段，源 MAC = **H1 的 MAC**，目的 MAC = **R 的 E0 接口的 MAC**；R.E1→S 段，源 MAC = **R 的 E1 接口的 MAC**，目的 MAC = **S 的 MAC**（R 通过 ARP 获得）。H2 全程收不到这些帧（交换机定向转发）。',
    explanation:
      '原题带拓扑图，此处为文本化描述。本题综合考查“跨网段访问前的准备”与“IP/MAC 地址的变化规律”，主线是：配好网关与 DNS → 域名解析得到目的 IP → ARP 得到网关 MAC → 封装发送。两条铁律：IP 地址端到端不变（NAT 场景除外）；MAC 地址只在本网段（一个冲突/广播域）内有效，每经过一个路由器就更换一对源/目的 MAC。第 (2) 问容易漏掉 ARP：与外网通信时解析的对象是**默认网关**而不是远端主机，这是高频失分点。',
    visual: {
      kind: 'seq',
      title: 'H1 首次访问 Web 服务器 S：DNS → ARP → TCP 三次握手',
      actors: ['H1 主机', 'DNS 服务器', '路由器 R', '服务器 S'],
      messages: [
        { from: 'H1 主机', to: 'DNS 服务器', label: '① DNS 查询 www.test.com' },
        { from: 'DNS 服务器', to: 'H1 主机', label: '应答 202.100.1.100' },
        { from: 'H1 主机', to: '路由器 R', label: '② ARP 请求（广播）' },
        { from: '路由器 R', to: 'H1 主机', label: '应答 E0 口 MAC 地址' },
        { from: 'H1 主机', to: '路由器 R', label: '③ SYN（IP 不变）' },
        { from: '路由器 R', to: '服务器 S', label: '转发 SYN：换 MAC' },
        { from: '服务器 S', to: '路由器 R', label: '④ SYN+ACK' },
        { from: '路由器 R', to: 'H1 主机', label: '转发（换回 MAC）' },
        { from: 'H1 主机', to: '路由器 R', label: '⑤ ACK' },
        { from: '路由器 R', to: '服务器 S', label: '转发 ACK：连接建立' },
      ],
    },
  },
]
