import type { Question } from '../types'

/** 2015 年 408 统考真题 · 综合应用题 41–47（共 70 分）
 * 数据结构 41–42（23 分）· 组成原理 43–44（23 分）· 操作系统 45–46（15 分）· 网络 47（9 分）
 */
export const y2015a: Question[] = [
  {
    id: 'q-2015-41',
    year: 2015,
    number: 41,
    subject: 'ds',
    type: 'application',
    topic: '主元素算法',
    difficulty: 3,
    source: 'real',
    score: 13,
    question:
      '若一个序列中出现次数大于 n/2 的元素，则称其为该序列的主元素。给定一个含有 n（n ≥ 1）个整数的序列，试设计一个时间复杂度尽可能低的算法，找出该序列的主元素；若存在，输出该元素，否则输出 −1。\n(1) 给出算法的基本设计思想；（4分）\n(2) 根据设计思想，用 C 或 C++ 语言描述算法，关键之处给出简要注释；（6分）\n(3) 说明你所设计算法的时间复杂度和空间复杂度，并说明为什么算法得到的候选元素还必须再做一次验证。（3分）',
    answerText:
      '**(1) 设计思想**（两两抵消法/顺序查找法）：主元素出现次数超过 n/2，它与其他全部元素逐对抵消后必有剩余。设置候选元素 candidate 与计数器 count 扫描序列：count 为 0 时把当前元素立为候选并置 count = 1；当前元素与候选相同则 count 加 1，不同则 count 减 1（相当于从序列中删去一对不同的元素）。一趟扫描结束后，candidate 是唯一可能的主元素；再对序列做第二趟扫描，统计 candidate 的真实出现次数，若大于 n/2 则输出它，否则输出 −1。\n**(2) C 语言描述**：见代码。\n**(3) 复杂度**：两趟线性扫描，时间复杂度 O(n)；只用了常数个变量，空间复杂度 O(1)。必须验证的原因：抵消过程只保证"若主元素存在，它一定是最终候选"，其逆命题不成立——当序列没有主元素时（如 1, 2, 3），最后剩下的候选只是个普通元素，出现次数未必超过 n/2，故须第二趟计数确认。',
    code: {
      lang: 'c',
      text: `int majority(int a[], int n)
{
    int i, count = 0, candidate = a[0], cnt = 0;

    for (i = 0; i < n; i++) {        /* 第一趟：两两抵消找候选 */
        if (count == 0) {
            candidate = a[i];        /* 重新确定候选元素 */
            count = 1;
        } else if (a[i] == candidate)
            count++;                 /* 与候选相同，计数加 1 */
        else
            count--;                 /* 不同：抵消一对 */
    }

    for (i = 0; i < n; i++)          /* 第二趟：验证候选 */
        if (a[i] == candidate) cnt++;

    return (cnt > n / 2) ? candidate : -1;
}`,
    },
    explanation:
      '本题即摩尔投票（Boyer–Moore 多数投票）的雏形。正确性直觉：把序列中"主元素与其他元素"配对销毁，最坏情况下每对销毁 1 个主元素，而主元素多于一半，销毁不完。备选思路还有：排序后取正中元素再验证（O(nlogn)）；哈希表计数（时间 O(n) 但空间 O(n)）——题干强调"时间尽可能低"，两趟扫描法时间空间均最优。失分点多在漏掉第二趟验证。',
    visual: {
      kind: 'sort',
      title: '摩尔投票找主元素：count 抵消演化（示例）',
      frames: [
        { arr: [2, 5, 5, 3, 5, 5], compared: [0], note: '示例序列（5 出现 4 次 > 3，是主元素）。count=0：立 2 为候选，count=1' },
        { arr: [2, 5, 5, 3, 5, 5], compared: [1], note: 'a[1]=5 ≠ 候选 2：抵消一对，count = 1−1 = 0' },
        { arr: [2, 5, 5, 3, 5, 5], compared: [2], note: 'count=0：重新立候选 5，count = 1' },
        { arr: [2, 5, 5, 3, 5, 5], compared: [3], note: 'a[3]=3 ≠ 候选 5：再抵消一对，count = 0' },
        { arr: [2, 5, 5, 3, 5, 5], compared: [4], note: 'count=0：再次立候选 5，count = 1' },
        { arr: [2, 5, 5, 3, 5, 5], compared: [5], note: 'a[5]=5 与候选相同：count = 2；第一趟结束，候选 = 5' },
        { arr: [2, 5, 5, 3, 5, 5], settled: [0, 2, 4, 5], note: '第二趟验证：5 实际出现 4 次 > n/2 = 3，输出 5（主元素）' },
        { arr: [1, 2, 3], compared: [2], note: '反例 1,2,3（解析所述无主元素情形）：第一趟候选为 3，但 3 仅出现 1 次 ≤ 1.5，须输出 −1——第二趟验证不可省略' },
      ],
    },
  },
  {
    id: 'q-2015-42',
    year: 2015,
    number: 42,
    subject: 'ds',
    type: 'application',
    topic: '链表算法设计',
    difficulty: 3,
    source: 'real',
    score: 10,
    question:
      '用单链表保存 m 个整数（带头结点 head，结点结构为 data、next），且 |data| ≤ n（n 为正整数）。试设计一个时间上尽可能高效的算法，删除链表中数据域绝对值相等的结点：若某绝对值是第一次出现则保留，此后再次出现即删除。\n(1) 给出算法的基本设计思想；（3分）\n(2) 用 C 或 C++ 语言描述算法，关键之处给出简要注释；（4分）\n(3) 说明你所设计算法的时间复杂度和空间复杂度。（3分）',
    answerText:
      '**(1) 设计思想**：|data| ≤ n 说明绝对值取值范围很小，可开辟长度为 n + 1 的辅助标志数组 mark[]（初值全 0）。从头到尾扫描链表：设当前考察结点的绝对值为 v，若 mark[v] = 0，则该结点是 v 的第一次出现，保留结点并置 mark[v] = 1；否则该绝对值重复，删除该结点并释放空间。\n**(2) C 语言描述**：见代码。\n**(3) 复杂度**：一趟扫描，时间复杂度 O(m)；辅助数组 O(n)，空间复杂度 O(n)。若不允许 O(n) 辅助空间，只能对每个结点向后扫描查重，退化为 O(m²)。',
    code: {
      lang: 'c',
      text: `typedef struct LNode {
    int data;
    struct LNode *next;
} LNode, *LinkList;

void dedup(LinkList head, int n)
{
    int *mark = (int *)calloc(n + 1, sizeof(int));
    LNode *p = head, *q;

    while (p->next != NULL) {
        int v = p->next->data;
        if (v < 0) v = -v;            /* 取绝对值 */
        if (mark[v] == 0) {           /* 首次出现：保留 */
            mark[v] = 1;
            p = p->next;
        } else {                      /* 重复出现：删除 */
            q = p->next;
            p->next = q->next;
            free(q);
        }
    }
    free(mark);
}`,
    },
    explanation:
      '"值域受限"是用空间换时间的典型信号：|data| ≤ n 暗示可以用 O(n) 的标志数组（哈希思想）把查重降到 O(1)。实现细节有三处易错：一是带头结点链表删除时保留前驱 p、删除 p->next；二是负数先取绝对值再作下标；三是 calloc 自动清零且下标 0..n 共 n+1 项。保留判断"第一次出现"恰好等价于"标志位尚未置 1"。',
    visual: {
      kind: 'flow',
      title: '标志数组法删除绝对值重复结点',
      nodes: [
        { id: 's', label: '开始：p = head', type: 'start' },
        { id: 'p1', label: '考察 p→next\n取 v = |data|', type: 'proc' },
        { id: 'c1', label: 'mark[v]==0？', type: 'cond' },
        { id: 'p2', label: '首次：保留结点\n置 mark[v]=1\np = p→next', type: 'proc' },
        { id: 'p3', label: '重复：摘下 p→next\nfree(q)\np 不动', type: 'proc' },
        { id: 'c2', label: 'p→next==NULL？', type: 'cond' },
        { id: 'e1', label: '扫描结束\n时间O(m) 空间O(n)', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'p1' },
        { from: 'p1', to: 'c1', label: '查标志数组' },
        { from: 'c1', to: 'p2', label: '是（首次出现）' },
        { from: 'c1', to: 'p3', label: '否（重复出现）' },
        { from: 'p2', to: 'c2' },
        { from: 'p3', to: 'c2' },
        { from: 'c2', to: 'p1', label: '否，继续扫描' },
        { from: 'c2', to: 'e1', label: '是' },
      ],
    },
  },
  {
    id: 'q-2015-43',
    year: 2015,
    number: 43,
    subject: 'co',
    type: 'application',
    topic: '微程序控制器',
    difficulty: 3,
    source: 'adapted',
    score: 10,
    question:
      '某计算机控制器采用微程序控制方式（原题给出微指令格式图，此处文字描述）：微指令字长 26 位，依次由操作控制字段、判别测试字段（2 位）和下地址字段（6 位）三部分组成，操作控制字段采用字段直接编码法。\n(1) 该控制存储器最多可存放多少条微指令？控制存储器的容量是多少位？（3分）\n(2) 微指令中操作控制字段占多少位？（3分）\n(3) 若把操作控制字段划分为 6 个互斥类、每类 3 位（每类留一个编码状态表示"不发出任何微命令"），则整个微指令最多能表示多少个微命令？（4分）',
    answerText:
      '**(1)** 下地址字段 6 位可寻址 2^6 = 64 个控存单元，故控存最多存放 64 条微指令；控存容量 = 64 × 26 = 1664 位。\n**(2)** 操作控制字段位数 = 微指令字长 − 判别测试字段 − 下地址字段 = 26 − 2 − 6 = 18 位。\n**(3)** 每个字段 3 位可编码 2^3 = 8 种状态，其中 1 种必须留作"不发出微命令"，故每个字段最多表示 8 − 1 = 7 个微命令；6 个字段最多可表示 6 × 7 = 42 个微命令（一拍内最多并行发出分属 6 个不同字段的 6 个微命令）。',
    explanation:
      '微程序题围绕"微指令格式三段"出题：下地址字段位数决定控存寻址范围（容量 = 微指令条数 × 字长）；操作控制字段是其余位数；字段直接编码要求"每个互斥字段留一个全 0 编码表示不发出"，所以 k 位字段最多 2^k − 1 个微命令——这一"减 1"是本题最常见的丢分点。若采用字段间接编码，一个字段的含义要依赖另一字段，能表示更多微命令但速度慢。',
    visual: {
      kind: 'flow',
      title: '微指令 26 位三段划分与微命令计数',
      nodes: [
        { id: 's', label: '微指令字长 26 位', type: 'start' },
        { id: 'p1', label: '① 判别测试字段\n题给 2 位', type: 'proc' },
        { id: 'p2', label: '② 下地址字段 6 位\n寻址 2^6=64 单元', type: 'proc' },
        { id: 'p3', label: '③ 操作控制字段\n26−2−6 = 18 位', type: 'proc' },
        { id: 'p4', label: '④ 字段直接编码\n6 个互斥类×3 位', type: 'proc' },
        { id: 'p5', label: '每类 2^3−1=7 个\n（留 1 码不发命令）', type: 'proc' },
        { id: 'e1', label: '控存容量\n64×26=1664 位\n微命令 6×7=42 个', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'p1' },
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3', label: '26 − 2 − 6' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'p5', label: '每字段 2^3=8 种状态' },
        { from: 'p5', to: 'e1' },
      ],
    },
  },
  {
    id: 'q-2015-44',
    year: 2015,
    number: 44,
    subject: 'co',
    type: 'application',
    topic: '页式虚存与Cache',
    difficulty: 3,
    source: 'adapted',
    templateId: 'co-cache-split',
    score: 13,
    question:
      '某计算机采用页式虚拟存储管理并设置 TLB（快表）与 Cache，按字节编址（原题给出地址格式图，此处文字描述）。已知：虚拟地址 24 位，物理地址 20 位，页面大小 4 KB；页表项 4 B；TLB 采用全相联映射；Cache 数据区容量 16 KB，采用 2 路组相联映射，每行 8 B。\n(1) 给出虚拟地址与物理地址的字段划分（各字段位数）；（3分）\n(2) 求一个进程页表的长度（项数）与该页表占用的内存空间；（3分）\n(3) TLB 中每个表项的标记（Tag）字段至少需要多少位？（3分）\n(4) 给出物理地址在 Cache 映射中的字段划分，并求 Cache 的总行数与每行标记字段的位数。（4分）',
    answerText:
      '**(1)** 页面 4 KB = 2^12 B，页内偏移 12 位。虚拟地址 24 位 = 虚拟页号 12 位 + 页内偏移 12 位；物理地址 20 位 = 物理页框号 8 位 + 页内偏移 12 位。\n**(2)** 虚拟页号 12 位，页表长度 = 2^12 = 4096 项；每项 4 B，页表占 4096 × 4 B = 16 KB。\n**(3)** TLB 全相联映射，没有索引字段，表项须完整保存虚拟页号作标记，至少 12 位（此外还需有效位等控制位，不计入标记位数）。\n**(4)** 行长 8 B → 块内地址 3 位；Cache 数据区 16 KB / 8 B = 2048 行；2 路组相联 → 组数 = 2048 / 2 = 1024 → 组号 10 位；物理地址 20 位 = 标记 7 位（20 − 10 − 3）+ 组号 10 位 + 块内地址 3 位，每行标记字段 7 位。',
    explanation:
      '这是"虚拟存储 + TLB + Cache"三件套联动的典型大题。固定解题链：先由页面大小定页内偏移，两边地址各自减去偏移得到页号位数；TLB 全相联时标记 = 完整虚拟页号；Cache 侧则"先块内、再组号、剩下为 Tag"。易错点：① 2 路组相联的组数要除以路数；② 全相联没有"组号/行号"可省；③ 页表项数由虚拟页号决定、与物理地址无关；④ 标记位数算完要与地址总位数校验相加是否等于物理地址位数。',
    visual: {
      kind: 'flow',
      title: '虚拟地址 → 物理地址 → Cache 查找全流程',
      nodes: [
        { id: 's', label: 'CPU 给出虚拟地址\nVA（24 位）', type: 'start' },
        { id: 'p1', label: '拆分：虚拟页号 12\n+ 页内偏移 12\n（页面 4KB=2^12）', type: 'proc' },
        { id: 'c1', label: '查 TLB 命中？', type: 'cond' },
        { id: 'p2', label: '未命中：查页表\n4096 项×4B=16KB\n（不驻留则缺页中断）', type: 'proc' },
        { id: 'p3', label: '得页框号 8 位\n拼物理地址 PA\n（20 位 = 8+12）', type: 'proc' },
        { id: 'p4', label: '拆分 PA：Tag 7\n+ 组号 10 + 块内 3\n组数 2048/2=1024', type: 'proc' },
        { id: 'c2', label: '查 Cache 命中？', type: 'cond' },
        { id: 'e1', label: '命中：取数据', type: 'end' },
        { id: 'p5', label: '缺失：访主存调块\n入 Cache 后取数', type: 'proc' },
      ],
      edges: [
        { from: 's', to: 'p1' },
        { from: 'p1', to: 'c1', label: 'TLB 全相联：标记=虚页号 12 位' },
        { from: 'c1', to: 'p3', label: '命中' },
        { from: 'c1', to: 'p2', label: '未命中' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4' },
        { from: 'p4', to: 'c2' },
        { from: 'c2', to: 'e1', label: '命中' },
        { from: 'c2', to: 'p5', label: '缺失' },
        { from: 'p5', to: 'e1' },
      ],
    },
  },
  {
    id: 'q-2015-45',
    year: 2015,
    number: 45,
    subject: 'os',
    type: 'application',
    topic: '信号量与PV',
    difficulty: 3,
    source: 'real',
    templateId: 'os-pv-model',
    score: 7,
    question:
      '某银行营业厅设有 1 个服务窗口和 10 个供顾客等待的座位。顾客到达营业厅后，若有空座位，则到取号机上取号并坐在座位上等待叫号；若无空座位，则不进入营业厅（直接离开）。营业员空闲时按下叫号键，为等待队列中的下一位顾客服务。取号机一次只能一名顾客使用。请用信号量机制实现顾客进程与营业员进程之间的同步。\n(1) 定义所需的信号量并说明其初值与含义；（3分）\n(2) 用 P、V 操作描述顾客与营业员的并发过程。（4分）',
    answerText:
      '**(1)** 三个信号量：seat = 10，表示营业厅内剩余的空座位（可进入等待的顾客名额）；full = 0，表示已取号等待服务的顾客数；mutex = 1，实现对取号机的互斥使用。\n**(2)** 见代码。顾客进程：P(seat) 判断是否有空座位（按本题语义，P(seat) 失败即等价于无座位而离开，见解析）；P(mutex) 互斥取号，V(mutex)；V(full) 报告自己进入等待队列，随后等待被叫号与服务。营业员进程循环执行：P(full)（无顾客则休息），按叫号键为一名顾客服务，服务完成后 V(seat) 释放一个座位。',
    code: {
      lang: 'c',
      text: `semaphore seat  = 10;   /* 空座位数（10 个等待名额） */
semaphore full  = 0;    /* 已取号等待的顾客数 */
semaphore mutex = 1;    /* 取号机互斥使用 */

process 顾客 {
    P(seat);            /* 无空座位则不进入（阻塞即离开语义） */
    P(mutex);           /* 独占取号机 */
    在取号机上取号;
    V(mutex);
    V(full);            /* 等待队列人数 +1 */
    坐到座位上等待叫号;
    接受营业员服务;
}

process 营业员 {
    while (TRUE) {
        P(full);        /* 没有等待顾客则休息 */
        按叫号键，为一位顾客服务;
        V(seat);        /* 该顾客离座，空位 +1 */
    }
}`,
    },
    explanation:
      '这是"座位 = 容量、取号机 = 互斥资源、顾客数 = 产品数"的生产者—消费者变体。判分要点：seat/full 的资源信号量属性（初值分别等于容量 10 与初态 0）、mutex 的互斥属性、以及 P 操作次序（先 seat 后 mutex，颠倒会在座位满时抱着取号机死锁）。若题目严格要求"满员立即离开"而非阻塞，可增加一个计数变量配合 seat 判断后跳过取号直接结束进程；两种写法在标准答案中均可接受，但需文字说明。',
    visual: {
      kind: 'flow',
      title: '银行叫号问题：顾客进程 PV 流程',
      nodes: [
        { id: 's', label: '顾客到达营业厅', type: 'start' },
        { id: 'c1', label: 'P(seat)\n有空座位？', type: 'cond' },
        { id: 'e1', label: '无空座位\n不进入直接离开', type: 'end' },
        { id: 'p1', label: 'P(mutex)\n独占取号机', type: 'proc' },
        { id: 'p2', label: '取号；V(mutex)', type: 'proc' },
        { id: 'p3', label: 'V(full)\n入等待队列坐等', type: 'proc' },
        { id: 'p4', label: '营业员 P(full)\n叫号并服务', type: 'proc' },
        { id: 'p5', label: 'V(seat)\n空座位数 +1', type: 'proc' },
        { id: 'e2', label: '服务完成离店', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'c1' },
        { from: 'c1', to: 'e1', label: '否（seat=0）' },
        { from: 'c1', to: 'p1', label: '是' },
        { from: 'p1', to: 'p2' },
        { from: 'p2', to: 'p3' },
        { from: 'p3', to: 'p4', label: '等待被叫号' },
        { from: 'p4', to: 'p5', label: '服务完成' },
        { from: 'p5', to: 'e2' },
      ],
    },
  },
  {
    id: 'q-2015-46',
    year: 2015,
    number: 46,
    subject: 'os',
    type: 'application',
    topic: '文件物理结构',
    difficulty: 3,
    source: 'real',
    score: 8,
    question:
      '某文件系统采用显式链接（FAT，文件分配表）方式管理磁盘块：磁盘共有 4096 个物理块，块大小 2 KB；FAT 的每个表项占 2 字节（16 位），FAT 常驻内存。某文件共 5 个逻辑块，依次存放在物理块 8 → 45 → 100 → 62 → 3（链式）。设文件的 FCB（含首块号）已在内存。\n(1) 该 FAT 需要占用的内存空间是多少？16 位的表项长度最多能支撑多大的磁盘？（3 分）\n(2) 要读取该文件的第 5 个逻辑块（块内数据一次读出），至少需要几次磁盘 I/O？若改为隐式链接（指针存放在每个物理块内），又需要几次？（3 分）\n(3) 简述显式链接结构在随机访问与可靠性方面相对隐式链接的优势。（2 分）',
    answerText:
      '**(1)** FAT 表项数 = 磁盘块数 = 4096，占用空间 = 4096 × 2 B = **8 KB**。16 位表项可表示的块号范围为 0 ～ 65535，最多支撑 2^16 = 65536 块 × 2 KB = **128 MB** 磁盘（不含保留表项则为 2^16 − 2 块左右，按 65536 块计满分）。\n**(2)** 显式链接：FCB 已在内存给出首块号 8，沿 FAT 链在**内存**中走 4 步（8→45→100→62→3）得到第 5 块的物理块号 3，查表不访盘；随后读物理块 3 一次，共 **1 次磁盘 I/O**。隐式链接：指针在各物理块内，必须先依次读入块 8、45、100、62（4 次磁盘 I/O）才能得到第 5 块的块号，再读块 3，共 **5 次磁盘 I/O**。\n**(3)** 优势一：FAT 常驻内存，查找后继块的链表操作不产生磁盘 I/O，逻辑块号定位只花 CPU 时间，随机访问开销大为下降；优势二：链接指针集中存放在 FAT 中而非散在各数据块里，磁头顺序读取文件时按 FAT 提前预知下一块位置，且链信息集中便于校验修复，隐式链接中任一数据块的指针域损坏即断链。',
    explanation:
      '显式链接把"所有块的链接指针"集中成一张常驻内存的 FAT：逻辑块定位退化为内存查表，磁盘 I/O 只剩最终读数据本身；隐式链接的指针与数据同块存放，必须逐块读盘。计算第 (2) 问的通式：隐式链接读第 k 块需 k 次磁盘 I/O，显式链接仅 1 次。FAT 大小 = 块数 × 表项长度，表项位数决定可管理的最大盘容量，这也是 FAT16 → FAT32 演进的动因。',
    visual: {
      kind: 'flow',
      title: '读第 5 逻辑块：显式链接 vs 隐式链接',
      nodes: [
        { id: 's', label: '读文件第 5 逻辑块', type: 'start' },
        { id: 'c1', label: '显式还是隐式？', type: 'cond' },
        { id: 'p1', label: 'FAT 常驻内存\n沿链查 4 步：\n8→45→100→62→3\n不产生磁盘 I/O', type: 'proc' },
        { id: 'p2', label: '依次读入块 8、45、\n100、62 取指针\n共 4 次磁盘 I/O', type: 'proc' },
        { id: 'p3', label: '得第 5 块号 3\n读物理块 3', type: 'proc' },
        { id: 'e1', label: '数据送用户区\n显式：共 1 次 I/O\n隐式：共 5 次 I/O', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'c1', label: 'FCB 已在内存，首块 8' },
        { from: 'c1', to: 'p1', label: '显式（FAT）' },
        { from: 'c1', to: 'p2', label: '隐式链接' },
        { from: 'p1', to: 'p3', label: '内存查表完成' },
        { from: 'p2', to: 'p3', label: '4 次读盘后' },
        { from: 'p3', to: 'e1' },
      ],
    },
  },
  {
    id: 'q-2015-47',
    year: 2015,
    number: 47,
    subject: 'cn',
    type: 'application',
    topic: '网络访问全过程',
    difficulty: 3,
    source: 'adapted',
    score: 9,
    question:
      '主机 H 通过以太网交换机 SW 接入本单位局域网，局域网经路由器 R 与外部网络中的 Web 服务器 S 相连（原题给出网络拓扑图，此处文字描述）。H 的 IP 地址为 192.168.1.10/24，默认网关为 R 在局域网侧的接口 192.168.1.254；S 的 IP 地址为 60.28.9.7；H 的本地域名服务器 IP 为 192.168.1.1（在局域网内）。H 上的浏览器输入 http://www.example.com 访问 S 上的网页。\n(1) 说明 H 为发出该 HTTP 请求，需要依次借助哪些协议获取哪些地址信息；（3分）\n(2) 写出 H 发往 S 的 IP 数据报在 H→SW→R 链路上封装成的以太网帧的源 MAC 地址与目的 MAC 地址（H 的 MAC 记为 MAC-H，R 局域网侧接口的 MAC 记为 MAC-R1），以及该 IP 数据报的源 IP 与目的 IP；该数据报经 R 转发到 R→S 链路后，帧的 MAC 地址与 IP 地址有何变化？（3分）\n(3) 简述 H 与 S 建立 TCP 连接的三次握手中，各报文段的 SYN、ACK 设置及序号关系。（3分）',
    answerText:
      '**(1)** ① 域名解析：H 首先用 DNS 协议向本地域名服务器 192.168.1.1 发送查询（H 与其同网段，经 ARP 获得 192.168.1.1 的 MAC 后即可通信），得到 www.example.com 对应的 IP 地址 60.28.9.7；② 判断交付方式：H 用子网掩码 /24 与 60.28.9.7 相与，发现与自身不在同一网络，须交给默认网关 R 转发；③ 地址解析：H 通过 ARP 协议获得默认网关 192.168.1.254 对应接口的 MAC 地址（缓存未命中时广播 ARP 请求）。此后即可封装发送 HTTP 请求报文。\n**(2)** H→SW→R 链路上的帧：源 MAC = MAC-H（H 的网卡），目的 MAC = MAC-R1（R 局域网侧接口，由 ARP 获得）；IP 数据报：源 IP = 192.168.1.10，目的 IP = 60.28.9.7（端到端不变）。经 R 转发进入 R→S 链路后：R 把 IP 数据报重新封装成新帧，源 MAC = R 外侧接口的 MAC（记为 MAC-R2），目的 MAC = S 的 MAC（由 R 对 S 执行 ARP 获得）；而 IP 数据报的源 IP、目的 IP 均保持不变（路由器只改链路层地址，同时 TTL 减 1、重算首部校验和）。\n**(3)** 第一次握手：H → S，SYN = 1、ACK = 0，seq = x（H 的初始序号）；第二次握手：S → H，SYN = 1 且 ACK = 1，seq = y（S 的初始序号）、ack = x + 1（确认 H 的连接请求）；第三次握手：H → S，SYN = 0、ACK = 1，seq = x + 1、ack = y + 1（确认 S 的连接请求，此报文可携带数据）。完成三次交互后双方均进入连接建立（ESTABLISHED）状态。',
    explanation:
      '本题把"一次网页访问"拆成 DNS → ARP → IP 转发 → TCP 建连四步，核心结论有两条：其一，跨网络通信时"IP 地址端到端不变、MAC 地址逐段改变"，每过一台路由器重新封装一次帧；其二，ARP 只在同一网络（本例：H 与本地 DNS、H 与网关 R、R 与 S）内解析，绝不跨路由器解析远端主机。三次握手的细节要写清 SYN/ACK 标志与"确认号 = 对方序号 + 1"的规律；前两次报文不携带应用数据。',
    visual: {
      kind: 'seq',
      title: '访问 Web 全过程：DNS → ARP → TCP → HTTP',
      actors: ['浏览器 H', '本地 DNS', '网关 R', '服务器 S'],
      messages: [
        { from: '浏览器 H', to: '本地 DNS', label: 'ARP 请求（同网段广播）：查询 192.168.1.1 的 MAC' },
        { from: '本地 DNS', to: '浏览器 H', label: 'ARP 应答：返回 DNS 服务器的 MAC' },
        { from: '浏览器 H', to: '本地 DNS', label: 'DNS 查询：www.example.com 的 IP 地址？' },
        { from: '本地 DNS', to: '浏览器 H', label: 'DNS 应答：www.example.com = 60.28.9.7' },
        { from: '浏览器 H', to: '网关 R', label: 'ARP 请求（广播）：查询默认网关 192.168.1.254 的 MAC' },
        { from: '网关 R', to: '浏览器 H', label: 'ARP 应答：MAC-R1（发往 S 的帧目的 MAC 填它）' },
        { from: '浏览器 H', to: '服务器 S', label: '第一次握手 SYN=1, ACK=0, seq=x（经 SW、R 转发：IP 不变，MAC 逐段改写）' },
        { from: '网关 R', to: '服务器 S', label: 'R 对 S 做 ARP 得 MAC-S，重封装新帧：源 MAC-R2、目的 MAC-S' },
        { from: '服务器 S', to: '浏览器 H', label: '第二次握手 SYN=1, ACK=1, seq=y, ack=x+1' },
        { from: '浏览器 H', to: '服务器 S', label: '第三次握手 ACK=1, seq=x+1, ack=y+1（连接建立）' },
        { from: '浏览器 H', to: '服务器 S', label: 'HTTP 请求：GET /（请求网页）' },
        { from: '服务器 S', to: '浏览器 H', label: 'HTTP 响应：200 OK（返回网页数据）' },
      ],
    },
  },
]
