import type { Question } from '../types'

/** 2017 年 408 统考真题 · 综合应用题 41–47（共 70 分）
 * 数据结构 41–42（23 分）· 组成原理 43–44（23 分）· 操作系统 45–46（15 分）· 网络 47（9 分）
 */
export const y2017a: Question[] = [
  {
    id: 'q-2017-41',
    year: 2017,
    number: 41,
    subject: 'ds',
    type: 'application',
    topic: '选择算法',
    difficulty: 3,
    source: 'real',
    templateId: 'ds-quicksort',
    score: 13,
    question:
      '设计一个在时间上尽可能高效的算法，在含有 n 个互不相同整数的无序数组 a[0..n-1] 中找出第 k（1 ≤ k ≤ n）小的元素。\n(1) 给出算法的基本设计思想；（5 分）\n(2) 根据(1)，用 C 语言描述算法，关键之处给出注释；（4 分）\n(3) 说明算法的平均时间复杂度、最坏时间复杂度与空间复杂度。（4 分）',
    code: {
      lang: 'c',
      text: `int partition(int a[], int low, int high) {
    int pivot = a[low];            /* 取区间第一个元素为枢轴 */
    while (low < high) {
        while (low < high && a[high] >= pivot) high--;
        a[low] = a[high];          /* 比枢轴小的移到低端 */
        while (low < high && a[low] <= pivot) low++;
        a[high] = a[low];          /* 比枢轴大的移到高端 */
    }
    a[low] = pivot;                /* 枢轴归位，low 即其最终下标 */
    return low;
}

int selectK(int a[], int n, int k) {
    int low = 0, high = n - 1;
    int m = partition(a, low, high);
    while (m != k - 1) {           /* 枢轴下标恰为 k-1 即得解 */
        if (m > k - 1) high = m - 1;   /* 第 k 小在左半区 */
        else           low  = m + 1;   /* 第 k 小在右半区 */
        m = partition(a, low, high);
    }
    return a[m];
}`,
    },
    answerText:
      '**(1) 设计思想**：借用快速排序的划分操作。任选一个枢轴把数组划分为两部分，枢轴归位后下标为 m：若 m = k−1，枢轴即第 k 小；若 m > k−1，只需在左半区间继续划分；若 m < k−1，在右半区间继续划分。每趟只在一个子区间内递归（分治减治），不做完整排序。\n**(2) C 语言描述**：见代码。\n**(3) 复杂度**：平均情况下每次划分区间约缩小一半，总比较次数为 n + n/2 + n/4 + … ≈ 2n，平均时间复杂度 **O(n)**；最坏情况（每趟划分极度不平衡，如数组已有序且总取端点为枢轴）退化为 **O(n²)**，理论上可用"中位数的中位数"选枢轴保证最坏 O(n)，但常数较大。划分为原地操作，空间复杂度 **O(1)**（迭代实现，无递归栈）。',
    explanation:
      '本题是"减治法"的代表题：与快速排序只差在"只递归一侧"。若采用先完整排序再取第 k 个的朴素做法，时间 O(n log₂n)，拿不到满分；若用辅助数组计数（值域受限）或哈希也不符合"互不相同整数、时间尽可能高效"的通用性要求。答题时要写清 m 与 k−1 比较的三种分支，这是判卷给分点。',
    visual: {
      kind: 'flow',
      title: '基于划分的第 k 小选择算法',
      nodes: [
        { id: 's', label: '在 a[low..high]\n取枢轴一趟划分', type: 'start' },
        { id: 'm', label: '枢轴归位\n最终下标记为 m', type: 'proc' },
        { id: 'c', label: '比较 m 与 k−1', type: 'cond' },
        { id: 'left', label: '第 k 小在左半区\nhigh = m−1', type: 'proc' },
        { id: 'right', label: '第 k 小在右半区\nlow = m+1', type: 'proc' },
        { id: 'eq', label: 'm = k−1\n返回 a[m]（第 k 小）', type: 'proc' },
        { id: 'cx', label: '平均 O(n)\n最坏 O(n²)\n空间 O(1)', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'm' },
        { from: 'm', to: 'c' },
        { from: 'c', to: 'left', label: 'm > k−1' },
        { from: 'c', to: 'right', label: 'm < k−1' },
        { from: 'c', to: 'eq', label: 'm = k−1' },
        { from: 'left', to: 's', label: '区间缩小再划分' },
        { from: 'right', to: 's', label: '区间缩小再划分' },
        { from: 'eq', to: 'cx' },
      ],
    },
  },
  {
    id: 'q-2017-42',
    year: 2017,
    number: 42,
    subject: 'ds',
    type: 'application',
    topic: '共享栈',
    difficulty: 2,
    source: 'real',
    score: 10,
    question:
      '设用一个一维数组 s[0..MAXSIZE-1] 表示两个栈：编号为 1 的栈自 s[0] 向高地址方向增长，编号为 2 的栈自 s[MAXSIZE-1] 向低地址方向增长，两个栈共享这片存储空间。\n(1) 给出两个栈的栈空、栈满条件（设 top1 与 top2 分别为两栈的栈顶指针，初始 top1 = −1，top2 = MAXSIZE）；（3 分）\n(2) 写出入栈、出栈算法（用 C 语言描述，需判断溢出与下溢）；（5 分）\n(3) 与两个各自独立分配空间的栈相比，共享栈的优点是什么？（2 分）',
    code: {
      lang: 'c',
      text: `#define MAXSIZE 100
typedef struct {
    int data[MAXSIZE];
    int top1;   /* 栈1栈顶，初值 -1 */
    int top2;   /* 栈2栈顶，初值 MAXSIZE */
} DStack;

int push(DStack *s, int i, int x) {     /* i=1 或 2 */
    if (s->top1 + 1 == s->top2)         /* 栈满 */
        return 0;
    if (i == 1) s->data[++s->top1] = x;
    else         s->data[--s->top2] = x;
    return 1;
}

int pop(DStack *s, int i, int *x) {
    if (i == 1) {
        if (s->top1 == -1) return 0;    /* 栈1空 */
        *x = s->data[s->top1--];
    } else {
        if (s->top2 == MAXSIZE) return 0; /* 栈2空 */
        *x = s->data[s->top2++];
    }
    return 1;
}`,
    },
    answerText:
      '**(1)** 栈 1 空：top1 == −1；栈 2 空：top2 == MAXSIZE；两栈共享空间**栈满**：top1 + 1 == top2（两栈顶相邻即无空单元）。\n**(2)** 算法见代码：入栈前判满，栈 1 入栈先加指针再存数、栈 2 先减指针再存数；出栈前判空，方向相反。\n**(3)** 优点：只有当**两个栈的空间需求总和**超过 MAXSIZE 时才溢出，而各自独立分配时任何一个栈先超过自己的份额即溢出。共享结构提高了空间的总体利用率，特别适合两个栈的深度此消彼长的场景（如一个用于递归、一个用于临时变量）。',
    explanation:
      '共享栈是顺序存储应用类的经典考点，核心只有一个不变式：top1 始终指向栈 1 顶元素、top2 指向栈 2 顶元素，中间区域为两栈共同的可用空间。判满条件 top1+1==top2 意味着空闲单元数为 top2−top1−1。答题时注意出栈弹出后指针的移动方向与入栈相反，且栈 2 的指针增减方向与栈 1 相反，这两个细节最容易写错。',
  },
  {
    id: 'q-2017-43',
    year: 2017,
    number: 43,
    subject: 'co',
    type: 'application',
    topic: '指令格式与寻址',
    difficulty: 3,
    source: 'real',
    templateId: 'co-relative',
    score: 13,
    question:
      '某计算机字长 16 位，主存地址空间为 64 KB，按字节编址。指令字长 16 位，采用定长指令格式，其结构为：OP（4 位）｜M（2 位）｜A（10 位）。其中 OP 为操作码；M 为寻址方式字段，00 表示寄存器寻址（A 为寄存器号），01 表示直接寻址，10 表示间接寻址（一次间址），11 表示变址寻址（变址寄存器 IX 为 16 位）。\n(1) 该指令系统最多能支持多少条指令？直接寻址方式下可寻址的主存范围是多少？（3 分）\n(2) 分别写出直接寻址、间接寻址、变址寻址取一个操作数所需的访存次数（含取指令本身）及有效地址表达式；（6 分）\n(3) 若采用相对寻址的转移指令占 2 个字节，第一字节为操作码与 M 字段，第二字节为位移量（补码），设该转移指令所在主存地址为 1FFEH，取指令时每取一个字节 PC 自动加 1。要转移到 2008H，位移量应为多少（用十六进制表示）？（4 分）',
    answerText:
      '**(1)** OP 为 4 位，最多支持 2^4 = **16 条指令**（实际会因保留编码而少于该值）。A 为 10 位，直接寻址范围为 2^10 = 1 KB（地址 0000H～03FFH）。\n**(2)** 设取指令本身占 1 次访存（指令字 16 位 = 2 B，按字节编址需 2 次读主存；若按字编址记 1 次，此处按字节编址计 2 次）：\n- 直接寻址：EA = A，共需访存 2（取指令）+ 1（取操作数）= **3 次**；\n- 间接寻址：EA = (A)（A 单元中存放操作数地址），共需 2 + 1（取地址）+ 1（取操作数）= **4 次**；\n- 变址寻址：EA = (IX) + A（A 作形式地址，补码或无符号均可，运算后取模 2^16），共需 2 + 1 = **3 次**（IX 在 CPU 内部，读它不占访存）。\n**(3)** 取指结束后 PC = 1FFEH + 2 = 2000H；目标地址 = PC + 位移量，故位移量 = 2008H − 2000H = **08H**（为正数，补码同原码，即 0000 1000B）。',
    explanation:
      '本题把指令格式设计与寻址方式计算结合：第(1)问考"字段位数决定指令数与寻址范围"；第(2)问的访存次数比较是常考点——间址之所以慢是因为要先取一次地址，变址不增加访存是因为变址寄存器在 CPU 内；第(3)问是相对寻址基准点问题，基准是"执行完取指后的 PC"而非指令首地址，这是相对寻址计算最经典的陷阱。',
    visual: {
      kind: 'flow',
      title: '指令格式、寻址方式与相对寻址',
      nodes: [
        { id: 's', label: '指令字 16 位\nOP4位 M2位 A10位', type: 'start' },
        { id: 'i', label: 'OP 占 4 位\n最多 2⁴=16 条指令', type: 'proc' },
        { id: 'c', label: 'M 是哪种寻址?', type: 'cond' },
        { id: 'd', label: '01 直接寻址\nEA=A\n访存 2+1=3 次', type: 'proc' },
        { id: 'n', label: '10 间接寻址\nEA=(A)\n访存 2+1+1=4 次', type: 'proc' },
        { id: 'x', label: '11 变址寻址\nEA=(IX)+A\n访存 2+1=3 次', type: 'proc' },
        { id: 'rel', label: '相对寻址转移\nPC=1FFEH+2\n=2000H', type: 'proc' },
        { id: 'off', label: '目标 2008H\n位移=2008H−2000H\n=08H', type: 'proc' },
        { id: 'e', label: '16 条指令\n直接寻址 1KB', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'i' },
        { from: 'i', to: 'c' },
        { from: 'c', to: 'd', label: '01' },
        { from: 'c', to: 'n', label: '10' },
        { from: 'c', to: 'x', label: '11' },
        { from: 'c', to: 'rel', label: '第(3)问' },
        { from: 'rel', to: 'off' },
        { from: 'd', to: 'e' },
        { from: 'n', to: 'e' },
        { from: 'x', to: 'e' },
        { from: 'off', to: 'e' },
      ],
    },
  },
  {
    id: 'q-2017-44',
    year: 2017,
    number: 44,
    subject: 'co',
    type: 'application',
    topic: '总线与传输',
    difficulty: 3,
    source: 'real',
    templateId: 'co-bus-bandwidth',
    score: 10,
    question:
      '某同步总线时钟频率为 100 MHz，每个时钟周期可传送 8 个字节的数据，地址与数据线复用。\n(1) 该总线的数据传输率（带宽）是多少？（3 分）\n(2) 若一次总线事务需要传送 2 KB 的数据（不含地址传送与等待周期），至少需要多少个时钟周期？若地址传送还需 1 个时钟周期，共需多少周期？（3 分）\n(3) 简述同步总线与异步总线各自的特点及适用场合。（4 分）',
    answerText:
      '**(1)** 带宽 = 时钟频率 × 每周期传送字节数 = 100 MHz × 8 B = **800 MB/s**。\n**(2)** 数据需要 2 KB ÷ 8 B = 256 个时钟周期；加上 1 个地址周期，共 **257** 个时钟周期。花费时间 = 257 × 10 ns = 2.57 μs（100 MHz 对应周期 10 ns）。\n**(3)** 同步总线：数据传送由统一的时钟定时，各部件按节拍动作，控制简单、速度快，但对部件速度要求一致、总线长度受限，适合近距离、高速场合（如处理器总线、存储总线）。异步总线：采用应答（握手）方式定时，无公共时钟，允许速度不同的设备互连，灵活性与可靠性好、可长距离互联，但控制复杂、每次握手开销大导致速度较慢，适合外设种类繁多的 I/O 总线。',
    explanation:
      '总线带宽计算的固定套路：带宽 = 每周期数据量 × 频率，若复用地址线或插入等待周期，则要把非数据周期折算进总时间，实际有效带宽 = 数据量 ÷ 总时间（本题 2 KB ÷ 2.57 μs ≈ 797 MB/s，略低于峰值）。第(3)问的采分点是"定时方式"：同步=统一时钟，异步=应答握手，半同步是两者的折中。',
    visual: {
      kind: 'flow',
      title: '同步总线带宽与总线事务',
      nodes: [
        { id: 's', label: '同步总线\n100MHz·8B/周期', type: 'start' },
        { id: 'b', label: '(1) 带宽\n100M 次/秒 × 8B\n= 800MB/s', type: 'proc' },
        { id: 'd', label: '(2) 传 2KB 数据\n需 256 个数据周期', type: 'proc' },
        { id: 'a', label: '地址数据复用\n+1 个地址周期\n共 257 个周期', type: 'proc' },
        { id: 't', label: '周期 10ns\n257×10ns\n= 2.57μs', type: 'proc' },
        { id: 'sy', label: '(3) 同步总线\n统一时钟定时\n速度快、距离短', type: 'proc' },
        { id: 'asy', label: '异步总线\n应答握手定时\n灵活、可长距离', type: 'proc' },
        { id: 'e', label: '峰值 800MB/s\n一次事务 2.57μs', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'b' },
        { from: 'b', to: 'd' },
        { from: 'd', to: 'a' },
        { from: 'a', to: 't' },
        { from: 't', to: 'sy' },
        { from: 'sy', to: 'asy' },
        { from: 'asy', to: 'e' },
      ],
    },
  },
  {
    id: 'q-2017-45',
    year: 2017,
    number: 45,
    subject: 'os',
    type: 'application',
    topic: '处理机调度',
    difficulty: 3,
    source: 'real',
    templateId: 'os-schedule-metrics',
    score: 8,
    question:
      '有 4 个进程，其到达时间与要求服务时间如下：P1（到达 0，服务 7）、P2（到达 2，服务 4）、P3（到达 4，服务 1）、P4（到达 5，服务 4）。\n(1) 采用抢占式短作业优先（SRTF，最短剩余时间优先）调度，写出调度顺序与各时间段（甘特图）；（4 分）\n(2) 计算各进程的周转时间与平均周转时间；（2 分）\n(3) 若改为非抢占式 SJF，平均周转时间是多少？比较两种结果。（2 分）',
    answerText:
      '**(1) SRTF 调度过程**：0~2 运行 P1（剩余 5）→ 2 时刻 P2 到达（剩余 4 < 5）抢占 → 2~4 运行 P2（剩余 2）→ 4 时刻 P3 到达（剩余 1 < 2）抢占 → 4~5 运行 P3（完成）→ 5~7 运行 P2（完成）→ 7 时刻就绪 P1（5）、P4（4），选 P4 → 7~11 运行 P4（完成）→ 11~16 运行 P1（完成）。甘特图：P1(0-2)｜P2(2-4)｜P3(4-5)｜P2(5-7)｜P4(7-11)｜P1(11-16)。\n**(2)** 周转 = 完成 − 到达：P1 = 16、P2 = 7−2 = 5、P3 = 5−4 = 1、P4 = 11−5 = 6；平均 = (16+5+1+6)/4 = **7**。\n**(3)** 非抢占 SJF：0 时刻仅 P1 就绪，先运行 P1（0~7）；7 时刻就绪 P2(4)、P3(1)、P4(4)，按短优先：P3（7~8）→ P2（8~12）→ P4（12~16）。周转：P1 = 7、P2 = 10、P3 = 4、P4 = 11，平均 = 8。**抢占式（7）优于非抢占式（8）**——新到达的更短作业能立刻插队，减少了短作业的等待。',
    explanation:
      'SRTF 手工模拟的要点：每个到达时刻都重新比较"剩余时间"，剩余时间最短者占用 CPU。易错点有三：一是比较的是剩余时间而非总服务时间；二是被抢占进程的已运行时间要扣除；三是周转时间一律用"完成时间 − 到达时间"计算。理论上可证明：在同时只允许一个作业运行的前提下，SRTF 给出最小平均等待时间。',
    visual: {
      kind: 'flow',
      title: 'SRTF 与非抢占 SJF 调度对比',
      nodes: [
        { id: 's', label: '到达/服务时间\nP1:0/7 P2:2/4\nP3:4/1 P4:5/4', type: 'start' },
        { id: 'c', label: '调度方式?', type: 'cond' },
        { id: 'sr', label: 'SRTF 抢占式\n每时刻选剩余最短', type: 'proc' },
        { id: 'sr1', label: 'P1 0-2\n被 P2 抢占', type: 'proc' },
        { id: 'sr2', label: 'P2 2-4\n被 P3 抢占', type: 'proc' },
        { id: 'sr3', label: 'P3 4-5 完成', type: 'proc' },
        { id: 'sr4', label: 'P2 5-7 完成', type: 'proc' },
        { id: 'sr5', label: 'P4 7-11 完成', type: 'proc' },
        { id: 'sr6', label: 'P1 11-16 完成', type: 'proc' },
        { id: 'se', label: '周转 16/5/1/6\n平均周转 7', type: 'end' },
        { id: 'sj', label: 'SJF 非抢占\n运行完才切换', type: 'proc' },
        { id: 'sj1', label: 'P1 0-7 完成', type: 'proc' },
        { id: 'sj2', label: 'P3 7-8 完成', type: 'proc' },
        { id: 'sj3', label: 'P2 8-12 完成', type: 'proc' },
        { id: 'sj4', label: 'P4 12-16 完成', type: 'proc' },
        { id: 'je', label: '周转 7/10/4/11\n平均周转 8', type: 'end' },
        { id: 'cmp', label: 'SRTF 平均 7 更优\n短作业及时插队', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'c' },
        { from: 'c', to: 'sr', label: 'SRTF' },
        { from: 'c', to: 'sj', label: 'SJF' },
        { from: 'sr', to: 'sr1' },
        { from: 'sr1', to: 'sr2' },
        { from: 'sr2', to: 'sr3' },
        { from: 'sr3', to: 'sr4' },
        { from: 'sr4', to: 'sr5' },
        { from: 'sr5', to: 'sr6' },
        { from: 'sr6', to: 'se' },
        { from: 'sj', to: 'sj1' },
        { from: 'sj1', to: 'sj2' },
        { from: 'sj2', to: 'sj3' },
        { from: 'sj3', to: 'sj4' },
        { from: 'sj4', to: 'je' },
        { from: 'se', to: 'cmp' },
        { from: 'je', to: 'cmp' },
      ],
    },
  },
  {
    id: 'q-2017-46',
    year: 2017,
    number: 46,
    subject: 'os',
    type: 'application',
    topic: '前驱关系与PV',
    difficulty: 3,
    source: 'real',
    templateId: 'os-pv-model',
    score: 7,
    question:
      '某任务由 5 个活动组成，其前驱关系为：S1 → S2、S1 → S3、S2 → S4、S3 → S4、S4 → S5（"→"表示前驱必须先完成）。\n(1) 画出（或文字描述）该前驱关系图；（2 分）\n(2) 用信号量机制（P、V 操作）描述 5 个活动的并发执行，写出每个信号量的初值及含义；（5 分）',
    code: {
      lang: 'c',
      text: `semaphore a = 0, b = 0, c = 0, d = 0, e = 0;
/* a:S1 完成否  b:S1 完成否  c:S2 完成否
   d:S3 完成否  e:S4 完成否 */

P1: S1; V(a); V(b);        /* S1 完成后唤醒 S2、S3 */
P2: P(a); S2; V(c);        /* S2 完成后唤醒 S4 */
P3: P(b); S3; V(d);        /* S3 完成后唤醒 S4 */
P4: P(c); P(d); S4; V(e);  /* S2、S3 都完成才能做 S4 */
P5: P(e); S5;              /* S4 完成后做 S5 */`,
    },
    answerText:
      '**(1)** 前驱图：S1 指向 S2 与 S3；S2、S3 各自指向 S4；S4 指向 S5。即 S1 最先，S2 与 S3 可并行，S4 需等 S2、S3 全部完成，S5 最后。\n**(2)** 为每条"边"（前驱关系）设一个初值为 0 的信号量，后继活动开始前对相应信号量做 P，前驱活动结束后做 V（代码见上）。其中：a、b 分别用于 S1→S2、S1→S3；c、d 分别用于 S2→S4、S3→S4；e 用于 S4→S5。S4 之前有两个 P 操作（P(c)、P(d)），保证两个前驱都完成；它们的次序在本题中可以交换（不会死锁，因为两个信号量相互独立）。',
    explanation:
      '"前驱图 → PV"是同步设计的标准题型：规则是"一条边一个信号量、初值全 0；前驱做完 V，后继开始前 P"。注意与互斥问题的区别——这里的信号量表达的是"事件是否发生"，而不是资源配额；多条入边对应多个 P 操作，多条出边对应多个 V 操作。检查方法：把每个信号量沿图走一遍，确认每条边恰好被一个 P、一个 V 使用。',
    visual: {
      kind: 'graph',
      title: '前驱关系图与 PV 信号量',
      nodes: [
        { id: 'S1', x: 50, y: 10 },
        { id: 'S2', x: 20, y: 40 },
        { id: 'S3', x: 80, y: 40 },
        { id: 'S4', x: 50, y: 70 },
        { id: 'S5', x: 50, y: 92 },
      ],
      edges: [
        { from: 'S1', to: 'S2', directed: true },
        { from: 'S1', to: 'S3', directed: true },
        { from: 'S2', to: 'S4', directed: true },
        { from: 'S3', to: 'S4', directed: true },
        { from: 'S4', to: 'S5', directed: true },
      ],
      steps: [
        {
          activeNodes: ['S1'],
          activeEdges: ['S1-S2', 'S1-S3', 'S2-S4', 'S3-S4', 'S4-S5'],
          note: '前驱关系：S1 最先；S2 与 S3 互不依赖、可并行；S4 须等 S2、S3 都完成；S5 最后',
        },
        {
          activeNodes: ['S1', 'S2', 'S3'],
          activeEdges: ['S1-S2', 'S1-S3'],
          labels: { S1: 'V(a) V(b)' },
          note: '建模规则：一条边配一个初值 0 的信号量——前驱结束后 V，后继开始前 P；S1 完成后 V(a)、V(b) 唤醒 S2、S3',
        },
        {
          activeNodes: ['S4', 'S5'],
          activeEdges: ['S2-S4', 'S3-S4', 'S4-S5'],
          labels: { S2: 'P(a) V(c)', S3: 'P(b) V(d)', S4: 'P(c) P(d) V(e)', S5: 'P(e)' },
          note: 'S4 之前有两个 P 操作，保证 S2、S3 全部完成才执行；S5 由 P(e) 把关；共 5 个信号量，初值均为 0',
        },
      ],
    },
  },
  {
    id: 'q-2017-47',
    year: 2017,
    number: 47,
    subject: 'cn',
    type: 'application',
    topic: 'IP 分片计算',
    difficulty: 3,
    source: 'real',
    templateId: 'cn-fragment',
    score: 9,
    question:
      '主机 A 通过两个路由器 R1、R2 与主机 B 通信。A 与 R1 之间链路的 MTU = 1500 B，R1 与 R2 之间链路的 MTU = 800 B，R2 与 B 之间链路的 MTU = 800 B。主机 A 向 B 发送一个总长度为 4000 B 的 IP 数据报（首部 20 B，数据部分 3980 B）。\n(1) 该数据报经 R1 时被分片，分成几个分片？写出每个分片的数据长度、片偏移与 MF 标志；（5 分）\n(2) 这些分片经 R2 时是否需要再分片？若需要，写出再分片的结果；（2 分）\n(3) 简述分片在哪个结点重组，以及片偏移字段的单位。（2 分）',
    answerText:
      '**(1)** MTU 1500 → 每片最多数据 1500 − 20 = 1480 B，且须为 8 的倍数（1480 = 8 × 185 ✓）。3980 B 数据分为 3 片：片1 数据 1480 B，片偏移 0，MF = 1；片2 数据 1480 B，片偏移 1480/8 = **185**，MF = 1；片3 数据 3980 − 2960 = 1020 B，片偏移 2960/8 = **370**，MF = 0。\n**(2)** 需要。800 − 20 = 780 B，取 8 的倍数上限 776 B。片1（数据 1480 B）拆成 776 + 704 两片（偏移 0 和 776/8 = 97，均相对片1 的数据起点，MF 均为 1）；片2 同样拆为 776 + 704（偏移 185 与 185 + 97 = 282）；片3（1020 B）拆为 776 + 244（偏移 370 与 467；最后一片 MF = 0，其余 MF = 1）。最终在 R2—B 链路上共 **6 个分片**。\n**(3)** 分片在**最终目的主机 B** 处重组，中间路由器只分不合；片偏移以 **8 字节**为单位（因此除最后一片外每个分片的数据长度必须是 8 的倍数）。',
    explanation:
      'IP 分片计算的三条铁律：①每片数据长度 = min(MTU − 20, 剩余数据) 且向下对齐到 8 的倍数；②片偏移 = 该片数据在原数据报数据部分中的起始位置 ÷ 8；③MF = 1 表示后面还有分片，只有最后一片 MF = 0。二级分片时片偏移仍以原始数据报为基准，把前一级分片的偏移加上片内相对偏移即可。重组只在目的端进行，这是 IP 尽力而为设计的体现。',
    visual: {
      kind: 'flow',
      title: 'IP 数据报两级分片全过程',
      nodes: [
        { id: 's', label: 'A 发送数据报\n总长 4000B\n数据 3980B', type: 'start' },
        { id: 'r1', label: 'R1：MTU 1500\n每片数据 1480B', type: 'proc' },
        { id: 'f1', label: '片1 1480B\n偏移 0，MF=1', type: 'proc' },
        { id: 'f2', label: '片2 1480B\n偏移 185，MF=1', type: 'proc' },
        { id: 'f3', label: '片3 1020B\n偏移 370，MF=0', type: 'proc' },
        { id: 'r2', label: 'R2：MTU 800\n每片数据 776B', type: 'proc' },
        { id: 'g1', label: '776B 偏移 0\nMF=1', type: 'proc' },
        { id: 'g2', label: '704B 偏移 97\nMF=1', type: 'proc' },
        { id: 'g3', label: '776B 偏移 185\nMF=1', type: 'proc' },
        { id: 'g4', label: '704B 偏移 282\nMF=1', type: 'proc' },
        { id: 'g5', label: '776B 偏移 370\nMF=1', type: 'proc' },
        { id: 'g6', label: '244B 偏移 467\nMF=0', type: 'proc' },
        { id: 'e', label: '共 6 片到达 B\nB 处重组，偏移单位 8B', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'r1' },
        { from: 'r1', to: 'f1' },
        { from: 'f1', to: 'f2' },
        { from: 'f2', to: 'f3' },
        { from: 'f3', to: 'r2' },
        { from: 'r2', to: 'g1' },
        { from: 'g1', to: 'g2' },
        { from: 'g2', to: 'g3' },
        { from: 'g3', to: 'g4' },
        { from: 'g4', to: 'g5' },
        { from: 'g5', to: 'g6' },
        { from: 'g6', to: 'e' },
      ],
    },
  },
]
