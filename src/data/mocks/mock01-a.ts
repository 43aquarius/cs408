import type { Question } from '../types'

/** 模拟卷（一）· 基础过关卷 —— 综合应用题 41–47 */
export const mock01a: Question[] = [
  {
    id: 'mock01-41',
    year: 0,
    origin: '模拟卷（一）',
    number: 41,
    subject: 'ds',
    type: 'application',
    topic: '平衡二叉树',
    difficulty: 3,
    source: 'mock',
    score: 13,
    question:
      '给定一棵二叉链表存储的二叉树，结点含 left、right 指针。要求设计算法判断其是否为平衡二叉树（AVL 树，即树中任意结点的左右子树高度差不超过 1）。\n(1) 叙述算法设计思想，说明如何保证每个结点只被访问一次。（5分）\n(2) 给出 C 语言实现。（5分）\n(3) 分析算法的时间复杂度与空间复杂度。（3分）',
    answerText:
      '**(1) 设计思想（后序遍历 + 自底向上返回高度）**\n采用后续遍历框架：对任意结点 p，先递归求得其左、右子树的高度；若任一子树已失衡（约定返回 −1 表示失衡），直接向上传播 −1；否则计算 |左高 − 右高|，若大于 1 则该结点失衡，同样返回 −1；否则返回 `max(左高, 右高) + 1` 作为以 p 为根的子树高度。\n根结点的最终返回值非 −1 即为平衡二叉树。由于高度信息在一次遍历中自底向上带回，无需对每个结点重复调用 height 函数，每个结点只访问一次。\n\n**(2) C 语言实现**\n`int check(BiTNode *p) {`\n`    if (p == NULL) return 0;`\n`    int lh = check(p->left);`\n`    if (lh == -1) return -1;          // 左子树失衡，剪枝向上`  \n`    int rh = check(p->right);`\n`    if (rh == -1) return -1;          // 右子树失衡，剪枝向上`  \n`    if (lh - rh > 1 || rh - lh > 1)`  \n`        return -1;                    // 当前结点失衡`  \n`    return (lh > rh ? lh : rh) + 1;   // 返回子树高度`\n`}`\n调用：`int balanced = check(root) >= 0;`\n\n**(3) 复杂度分析**\n时间复杂度 O(n)：每个结点进出递归各一次，失衡时提前剪枝只会更快。\n空间复杂度 O(h)：递归栈深度等于树高 h，最坏（链形树）为 O(n)，平衡时为 O(log2 n)。',
    explanation:
      '本题的陷阱在于「对每个结点调用一次 height 再判平衡」的朴素解法时间复杂度高达 O(n^2)，不符合「每个结点访问一次」的要求。改进的关键是让递归函数同时携带两种信息：子树高度（正常路径）与失衡标志（−1 哨兵）。这是后序遍历「自底向上统计信息」的经典范式，同套路还可解决：判断二叉搜索树（传递上下界）、求树的直径（传递深度）等。',
    visual: {
      kind: 'tree',
      title: '平衡检查示例：结点旁数字为「返回高度」',
      steps: [
        {
          nodes: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B', parent: 'a' },
            { id: 'c', label: 'C', parent: 'b' },
            { id: 'd', label: 'D', parent: 'c' },
          ],
          note: '示例：左链 A→B→C→D（每结点只有左孩子），自底向上检查',
        },
        {
          nodes: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B', parent: 'a' },
            { id: 'c', label: 'C:h=2', parent: 'b' },
            { id: 'd', label: 'D:h=1', parent: 'c' },
          ],
          highlight: ['d', 'c'],
          note: 'D 无孩子返回 0（高度记 1）；C 的左右高度差为 1，返回高度 2',
        },
        {
          nodes: [
            { id: 'a', label: 'A' },
            { id: 'b', label: 'B:失', parent: 'a' },
            { id: 'c', label: 'C:h=2', parent: 'b' },
            { id: 'd', label: 'D:h=1', parent: 'c' },
          ],
          highlight: ['b'],
          note: 'B 的左子树高 2、右子树高 0，差为 2 > 1，B 失衡，向 A 返回 −1',
        },
        {
          nodes: [
            { id: 'a', label: 'A:-1' },
            { id: 'b', label: 'B:失', parent: 'a' },
            { id: 'c', label: 'C:h=2', parent: 'b' },
            { id: 'd', label: 'D:h=1', parent: 'c' },
          ],
          highlight: ['a'],
          note: 'A 收到 −1 直接向上传播；根返回 −1，结论：不是平衡二叉树',
        },
      ],
    },
  },
  {
    id: 'mock01-42',
    year: 0,
    origin: '模拟卷（一）',
    number: 42,
    subject: 'ds',
    type: 'application',
    topic: '哈夫曼编码',
    difficulty: 2,
    source: 'mock',
    score: 10,
    question:
      '某通信系统对只包含 6 个字符 a、b、c、d、e、f 的报文编码，各字符出现频率（每 100 个字符中）依次为 5、9、12、13、16、45。\n(1) 构造哈夫曼树，写出每个字符的哈夫曼编码（约定：左分支为 0、右分支为 1）。（5分）\n(2) 计算该编码方案的带权路径长度 WPL，并与 3 位等长编码比较，说明节省了多少比特。（5分）',
    answerText:
      '**(1) 哈夫曼树与编码**\n合并过程（每次取权值最小的两棵树）：\n① 5(a) + 9(b) = 14；② 12(c) + 13(d) = 25；③ 14 + 16(e) = 30；④ 25 + 30 = 55；⑤ 45(f) + 55 = 100。\n按「左 0 右 1」从根到叶读取编码：\n- f：0（1 位）\n- c：100（3 位）\n- d：101（3 位）\n- e：110（3 位）\n- a：1100（4 位）\n- b：1101（4 位）\n\n**(2) WPL 与等长编码比较**\nWPL = 45×1 + 12×3 + 13×3 + 16×3 + 5×4 + 9×4 = 45 + 36 + 39 + 48 + 20 + 36 = **224 bit**。\n（验算：合并和法 14+25+30+55+100 = 224 ✓）\n若采用 3 位等长编码（6 < 2^3），100 个字符共需 3×100 = 300 bit。\n哈夫曼编码节省 300 − 224 = **76 bit**，约 25.3%。',
    explanation:
      '哈夫曼编码是最优前缀码：任一编码都不是另一编码的前缀，解码无歧义。构造时贪心地「合并最小两权」，出现频率最高的 f 只用 1 位。两个易错点：① WPL 用「频率×编码长度」或「合并和」两种口径都可验算，务必双法核对；② 等长编码位数取 ⌈log2 6⌉ = 3 位。动画逐步演示了 5 次合并的取数与树的形态，可与编码一一对照。',
    visual: {
      kind: 'tree',
      title: '哈夫曼树构造（a5 b9 c12 d13 e16 f45）',
      steps: [
        {
          nodes: [
            { id: 'a', label: 'a5' }, { id: 'b', label: 'b9' }, { id: 'c', label: 'c12' },
            { id: 'd', label: 'd13' }, { id: 'e', label: 'e16' }, { id: 'f', label: 'f45' },
          ],
          note: '初始森林：6 棵单结点树',
        },
        {
          nodes: [
            { id: 'n14', label: '14' },
            { id: 'a', label: 'a5', parent: 'n14' }, { id: 'b', label: 'b9', parent: 'n14' },
            { id: 'c', label: 'c12' }, { id: 'd', label: 'd13' }, { id: 'e', label: 'e16' }, { id: 'f', label: 'f45' },
          ],
          highlight: ['n14', 'a', 'b'],
          note: '第 1 次合并：最小两权 a(5) 与 b(9) → 14',
        },
        {
          nodes: [
            { id: 'n14', label: '14' },
            { id: 'a', label: 'a5', parent: 'n14' }, { id: 'b', label: 'b9', parent: 'n14' },
            { id: 'n25', label: '25' },
            { id: 'c', label: 'c12', parent: 'n25' }, { id: 'd', label: 'd13', parent: 'n25' },
            { id: 'e', label: 'e16' }, { id: 'f', label: 'f45' },
          ],
          highlight: ['n25', 'c', 'd'],
          note: '第 2 次合并：c(12) 与 d(13) → 25',
        },
        {
          nodes: [
            { id: 'n30', label: '30' },
            { id: 'n14', label: '14', parent: 'n30' },
            { id: 'a', label: 'a5', parent: 'n14' }, { id: 'b', label: 'b9', parent: 'n14' },
            { id: 'e', label: 'e16', parent: 'n30' },
            { id: 'n25', label: '25' },
            { id: 'c', label: 'c12', parent: 'n25' }, { id: 'd', label: 'd13', parent: 'n25' },
            { id: 'f', label: 'f45' },
          ],
          highlight: ['n30', 'n14', 'e'],
          note: '第 3 次合并：在 {14,16,25} 中取 14 与 16 → 30',
        },
        {
          nodes: [
            { id: 'n55', label: '55' },
            { id: 'n25', label: '25', parent: 'n55' },
            { id: 'c', label: 'c12', parent: 'n25' }, { id: 'd', label: 'd13', parent: 'n25' },
            { id: 'n30', label: '30', parent: 'n55' },
            { id: 'n14', label: '14', parent: 'n30' },
            { id: 'a', label: 'a5', parent: 'n14' }, { id: 'b', label: 'b9', parent: 'n14' },
            { id: 'e', label: 'e16', parent: 'n30' },
            { id: 'f', label: 'f45' },
          ],
          highlight: ['n55', 'n25', 'n30'],
          note: '第 4 次合并：25 与 30 → 55',
        },
        {
          nodes: [
            { id: 'root', label: '100' },
            { id: 'f', label: 'f45', parent: 'root' },
            { id: 'n55', label: '55', parent: 'root' },
            { id: 'n25', label: '25', parent: 'n55' },
            { id: 'c', label: 'c12', parent: 'n25' }, { id: 'd', label: 'd13', parent: 'n25' },
            { id: 'n30', label: '30', parent: 'n55' },
            { id: 'e', label: 'e16', parent: 'n30' },
            { id: 'n14', label: '14', parent: 'n30' },
            { id: 'a', label: 'a5', parent: 'n14' }, { id: 'b', label: 'b9', parent: 'n14' },
          ],
          highlight: ['root', 'f', 'n55'],
          note: '第 5 次合并：f(45) 与 55 → 根 100。左 0 右 1：f=0、c=100、d=101、e=110、a=1100、b=1101，WPL=224',
        },
      ],
    },
  },
  {
    id: 'mock01-43',
    year: 0,
    origin: '模拟卷（一）',
    number: 43,
    subject: 'co',
    type: 'application',
    topic: 'Cache 设计',
    difficulty: 3,
    source: 'mock',
    score: 13,
    question:
      '某计算机主存地址 32 位，按字节编址。Cache 数据总容量 32KB，采用 2 路组相联映射，块大小 64B。\n(1) 写出主存地址划分（标记 Tag、组号、块内偏移各多少位），并计算 Cache 共分多少组。（4分）\n(2) 若 CPU 共访问 Cache 2000 次，其中 1940 次命中，Cache 访问时间为 10ns，Cache 缺失后访问主存需 200ns（先查 Cache 后访主存的串行方式），求平均访问时间。（5分）\n(3) 考虑每行包含 1 位有效位与 Tag，计算该 Cache 的总存储位数。（4分）',
    answerText:
      '**(1) 地址划分与组数**\n块大小 64B = 2^6 → 块内偏移 **6 位**。\nCache 共 32KB / 64B = 512 行；2 路组相联 → 组数 = 512 / 2 = **256 组 = 2^8**，组号 **8 位**。\n标记 Tag = 32 − 8 − 6 = **19 位**。\n主存地址结构：`Tag(19) | 组号(8) | 块内偏移(6)`。\n\n**(2) 平均访问时间**\n命中率 h = 1940 / 2000 = 0.97。\n串行访问模型下：T = h×tc + (1−h)×(tc + tm)\n= 0.97×10 + 0.03×(10+200)\n= 9.7 + 6.3 = **16.0 ns**。\n\n**(3) Cache 总存储位数**\n每行存储位 = 数据 64×8 + Tag 19 + 有效位 1 = 512 + 20 = 532 bit。\n共 512 行，总位数 = 512 × 532 = **272384 bit**（= 34048B ≈ 33.25KB，比 32KB 数据容量多出的部分即 Tag 与状态位开销）。',
    explanation:
      '组相联地址划分三步走：① 块内偏移 = log2(块大小)；② 组号 = log2(Cache 行数 ÷ 路数)；③ 其余位全给 Tag。平均访问时间注意「串行」口径：缺失时 Cache 白查的 10ns 也要计入，故缺失代价是 10+200 而非 200；若采用「同时访问」模型则用 max(tc,tm) 权衡式，两种口径结果略有差异，答题时先声明假设。存储位数计算别漏有效位（1 bit/行）；若题目含 LRU 位（2 路组相联每行 1 位）或脏位（写回法 1 位）还需相应加上。',
  },
  {
    id: 'mock01-44',
    year: 0,
    origin: '模拟卷（一）',
    number: 44,
    subject: 'co',
    type: 'application',
    topic: '流水线冲突',
    difficulty: 3,
    source: 'mock',
    score: 10,
    question:
      '某 5 段流水线（IF、ID、EX、MEM、WB，每段 1 拍）的机器上执行以下指令序列，且流水线采用按序发射，数据前递（forwarding）部件只能把 EX/MEM、MEM/WB 段的结果前递到 EX 段入口：\n`I1: lw  R1, 0(R2)`\n`I2: add R3, R1, R4`\n`I3: sub R5, R4, R6`\n`I4: sw  R3, 0(R5)`\n(1) 指出指令间存在的数据相关，说明哪些需要插入停顿（气泡），哪些可由前递解决。（4分）\n(2) 画出时空图（写出每条指令进入 IF 的拍号即可），计算执行完 4 条指令共需多少拍。（3分）\n(3) 计算该流水线相对完全串行执行（每条指令 5 拍）的加速比。（3分）',
    answerText:
      '**(1) 数据相关分析**\n① I2 与 I1：RAW 相关（R1）。lw 的结果在 MEM 段末（第 5 拍）才产生，而 add 在 EX 段（第 4 拍）就要用——**load-use 冒险，必须插入 1 拍停顿**，使 add 的 EX 推迟到 lw 的 WB 同拍，靠 MEM/WB 前递解决。\n② I3 与 I1：无相关（用的是 R4、R6）。\n③ I4 与 I2：RAW 相关（R3）。sw 在第 2 拍 ID 段读 R3？注意 sw 所需的 R3 是存储数据，在 MEM 段写入主存前递入即可，且 add 的 EX 结果（第 6 拍末）可经 EX/MEM 前递给 sw 的 MEM 段（第 7 拍），时序上衔接，**不需停顿**。\n④ I4 与 I3：RAW 相关（R5）。sub 的 EX 结果（第 6 拍末）前递给 sw 的 EX/MEM（第 7 拍），同样**不需停顿**。\n\n**(2) 时空图与总拍数**\n发射拍号（0 起计）：I1 第 0 拍 IF；I2 第 2 拍 IF（1 拍气泡）；I3 第 3 拍 IF；I4 第 4 拍 IF。\nI4 于第 4+4 = 8 拍完成 WB，共 **9 拍**。\n时空图见下方动画（每行一条指令，颜色块为所处流水段）。\n\n**(3) 加速比**\n串行执行：4 × 5 = 20 拍。\n加速比 S = 20 / 9 ≈ **2.22**。',
    explanation:
      '本题核心是 load-use 冒险：lw 的数据要到 MEM 段末才可用，紧随其后立即使用该数据的指令在 EX 段无法通过前递获得，必须停顿 1 拍（编译器也可通过指令调度把无关指令填入空隙）。判停顿的口诀：看「生产数据的段」与「消费数据的段」是否重叠——EX/MEM 前递只能救「EX 产生、EX 消费」型相关。画时空图时牢记：停顿意味着该指令及其后所有指令整体右移。',
    visual: {
      kind: 'pipeline',
      title: '4 条指令的流水线时空图（含 load-use 气泡）',
      stages: ['IF', 'ID', 'EX', 'MEM', 'WB'],
      instrs: [
        { name: 'I1: lw  R1,0(R2)', delay: 0, note: 'I1 第 1 拍取指，第 5 拍（拍号 4）WB，R1 在 MEM 段末可用' },
        { name: 'I2: add R3,R1,R4', delay: 2, note: 'load-use 冒险：插 1 拍气泡，EX 推迟到与 lw 的 WB 同拍，靠 MEM/WB 前递取 R1' },
        { name: 'I3: sub R5,R4,R6', delay: 3, note: '与 I1、I2 无相关，按序跟在 add 后 1 拍发射，无需等待' },
        { name: 'I4: sw  R3,0(R5)', delay: 4, note: 'R3、R5 均由 EX/MEM、MEM/WB 前递在 EX/MEM 段衔接，不停顿；第 9 拍完成' },
      ],
    },
  },
  {
    id: 'mock01-45',
    year: 0,
    origin: '模拟卷（一）',
    number: 45,
    subject: 'os',
    type: 'application',
    topic: '页面置换算法',
    difficulty: 2,
    source: 'mock',
    score: 7,
    question:
      '某请求分页系统的进程分配 3 个页框，页面访问序列为：1、2、3、4、1、2、5、1、2、3、4、5。初始时页框全空（首次调入也算缺页）。\n(1) 采用 LRU 置换算法，逐步写出每次访问后 3 个页框中的页面号，并统计缺页次数。（4分）\n(2) 计算缺页率。（1分）\n(3) 说明 LRU 与 FIFO 在本序列上的差异，并解释为什么 LRU 不一定总是优于 FIFO。（2分）',
    answerText:
      '**(1) LRU 逐步过程**（方括号为页框内容，加粗为本次调入，括号内为淘汰页）：\n访问 1：缺页调入 → [**1**, , ]\n访问 2：缺页调入 → [**2**, 1, ]\n访问 3：缺页调入 → [**3**, 2, 1]\n访问 4：缺页，淘汰最久未用的 1 → [**4**, 3, 2]\n访问 1：缺页，淘汰 2 → [**1**, 4, 3]\n访问 2：缺页，淘汰 3 → [**2**, 1, 4]\n访问 5：缺页，淘汰 4 → [**5**, 2, 1]\n访问 1：命中（LRU 序刷新）→ [5, 2, 1]\n访问 2：命中 → [5, 2, 1]\n访问 3：缺页，淘汰最久未用的 5 → [**3**, 2, 1]\n访问 4：缺页，淘汰 1 → [**4**, 3, 2]\n访问 5：缺页，淘汰 2 → [**5**, 4, 3]\n共缺页 **10 次**（命中 2 次）。\n\n**(2) 缺页率**\n10 / 12 ≈ **83.3%**。\n\n**(3) 与 FIFO 的比较**\n同一序列 FIFO（3 页框）缺页 9 次，反而比 LRU 的 10 次少。这说明 LRU「淘汰最久未访问页」的启发式依据是程序的局部性原理；当访问序列局部性差（本题后半段 5、1、2、3、4、5 来回扫描）时，LRU 的预测失灵，特定序列上可能劣于 FIFO。但 LRU 是栈式算法，不会出现 FIFO 的 Belady 异常，平均意义下性能更稳定。',
    explanation:
      'LRU 模拟的规范写法：每步标注「最近访问时间」，缺页时淘汰时间戳最早者；命中时务必刷新该页的时间戳，这是 LRU 与 FIFO 的唯一差别点。逐帧核对下方动画可检验手算结果。第 (3) 问的深层结论：置换算法的优劣依赖于访存局部性，没有任何算法在所有序列上最优（OPT 是理论下界，但需要未来信息）。',
    visual: {
      kind: 'pages',
      title: 'LRU 页面置换（3 页框，访问序列 1 2 3 4 1 2 5 1 2 3 4 5）',
      algo: 'LRU',
      frames: 3,
      accesses: ['1', '2', '3', '4', '1', '2', '5', '1', '2', '3', '4', '5'],
    },
  },
  {
    id: 'mock01-46',
    year: 0,
    origin: '模拟卷（一）',
    number: 46,
    subject: 'os',
    type: 'application',
    topic: '信号量机制',
    difficulty: 3,
    source: 'mock',
    score: 8,
    question:
      '有一座单向通行的小桥：同一时刻桥上只能有一个方向的汽车，但同方向可以有多辆汽车依次通过（桥面容量不限）。东西两方向汽车到达桥头后过桥，过完从另一端驶离。\n(1) 设计信号量与共享变量，说明各自的初值与含义。（2分）\n(2) 用 P、V 操作写出东向、西向汽车的过桥同步算法（伪代码）。（4分）\n(3) 若还要求桥上最多同时容纳 4 辆车，算法应如何修改？（2分）',
    answerText:
      '**(1) 信号量与变量设置**\n- `semaphore mutex = 1`：桥的「方向锁」，保证任一时刻只有一个方向的车队在桥上（第一个进入该方向的汽车竞争它，最后一个离开时释放）。\n- `int countE = 0, countW = 0`：东西两方向当前在桥车辆数（共享变量，需各自的方向锁保护）。\n- `semaphore mutexE = 1, mutexW = 1`：分别保护 countE、countW 的互斥修改。\n\n**(2) 同步算法**\n东向汽车 i：\n`P(mutexE);`\n`countE++;`\n`if (countE == 1) P(mutex);   // 本方向第一辆车上桥，占方向`\n`V(mutexE);`\n上桥、行驶、下桥；\n`P(mutexE);`\n`countE--;`\n`if (countE == 0) V(mutex);   // 本方向最后一辆车下桥，让出方向`\n`V(mutexE);`\n西向汽车 j 对称：将 mutexE/countE 换成 mutexW/countW 即可。\n\n**(3) 桥上最多 4 辆**\n增加信号量 `semaphore bridge = 4`（初值 4，表示桥面剩余容量）：\n所有汽车在上桥前执行 `P(bridge)`，下桥后执行 `V(bridge)`（与方向无关，放在方向锁逻辑的外侧或紧邻上下桥处均可）。\n这样任意时刻 P(bridge) 未返回的汽车最多 4 辆，桥面容量得到控制。',
    explanation:
      '这是「读者-写者」模型中「读者优先」思想的变体：同方向车辆可并发（多辆车同时过桥），异方向互斥。核心技巧是「第一辆车上锁、最后一辆车解锁」，由计数变量判断自己是否为第一/最后。三个易错点：① count 的修改必须放在各自 mutex 的临界区内；② P(mutex)（抢方向）必须在 V(mutexE) 之前执行，否则可能出现两方向同时拿到 0 计数而都尝试占桥；③ 第 (3) 问的容量信号量对两方向共用，不需要区分方向。',
    visual: {
      kind: 'flow',
      title: '汽车过桥流程（以东向为例）',
      nodes: [
        { id: 's', label: '到达桥头', type: 'start' },
        { id: 'a', label: 'P(mutexE)\ncountE++', type: 'proc' },
        { id: 'b', label: 'countE == 1 ?', type: 'cond' },
        { id: 'c', label: 'P(mutex)\n抢占桥方向', type: 'proc' },
        { id: 'd', label: 'V(mutexE)\n解除计数锁', type: 'proc' },
        { id: 'e', label: '过桥', type: 'proc' },
        { id: 'f', label: 'P(mutexE)\ncountE--', type: 'proc' },
        { id: 'g', label: 'countE == 0 ?', type: 'cond' },
        { id: 'h', label: 'V(mutex)\n释放桥方向', type: 'proc' },
        { id: 'i', label: 'V(mutexE)\n驶离', type: 'end' },
      ],
      edges: [
        { from: 's', to: 'a' },
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c', label: '是（第一辆）' },
        { from: 'b', to: 'd', label: '否' },
        { from: 'c', to: 'd' },
        { from: 'd', to: 'e' },
        { from: 'e', to: 'f' },
        { from: 'f', to: 'g' },
        { from: 'g', to: 'h', label: '是（最后一辆）' },
        { from: 'g', to: 'i', label: '否' },
        { from: 'h', to: 'i' },
      ],
    },
  },
  {
    id: 'mock01-47',
    year: 0,
    origin: '模拟卷（一）',
    number: 47,
    subject: 'cn',
    type: 'application',
    topic: '子网划分',
    difficulty: 2,
    source: 'mock',
    score: 9,
    question:
      '某单位获得地址块 192.168.10.0/24，需划分为 4 个等大小子网，分别分配给 4 个部门，各部门之间通过路由器 R 互联。\n(1) 写出子网掩码、各子网的网络地址与每个子网可用主机数。（3分）\n(2) 部门 A 的主机 X（192.168.10.70）要向部门 B 的主机 Y（192.168.10.130）发送数据，判断两主机是否在同一子网；若不在，X 如何送达 Y？（2分）\n(3) 主机 X 首次通过浏览器以域名访问子网外的 Web 服务器（假设本机 DNS 与网关配置齐全、均无缓存），简述从输入域名到页面显示的完整通信过程。（4分）',
    answerText:
      '**(1) 子网划分**\n/24 借 2 位主机位 → 4 个 /26 子网，子网掩码 **255.255.255.192**（/26）。\n- 子网 1：192.168.10.0/26，可用主机 .1 ~ .62（62 台）\n- 子网 2：192.168.10.64/26，可用主机 .65 ~ .126（62 台）\n- 子网 3：192.168.10.128/26，可用主机 .129 ~ .190（62 台）\n- 子网 4：192.168.10.192/26，可用主机 .193 ~ .254（62 台）\n每个子网可用主机数 = 2^6 − 2 = **62**（去掉全 0 网络地址与全 1 广播地址）。\n\n**(2) 跨网段交付**\nX：192.168.10.70，二进制第 4 字节 0100 0110；掩码 /26 → 70 AND 192 = 64，X 所在子网 192.168.10.64/26。\nY：192.168.10.130 → 130 AND 192 = 128，Y 所在子网 192.168.10.128/26。\n**两者不在同一子网**。X 用自己的掩码与 Y 的地址逐位与运算，结果不等于本网网络地址，判定「跨网段」，于是把报文封装成帧发往**默认网关（路由器 R）**：若 X 的 ARP 缓存中没有网关 MAC，先 ARP 广播询问网关 MAC，再把 IP 分组交给 R，由 R 查路由表转发到 Y 所在子网。\n\n**(3) 访问 Web 服务器全过程**\n① **DNS 解析**：X 向配置的 DNS 服务器发送域名查询（先查本地缓存，无则递归/迭代查询），获得服务器 IP。\n② **获取网关 MAC**：若 ARP 缓存无网关 MAC，X 广播 ARP 请求，网关应答（后续所有外发分组帧的目的 MAC 都是网关 MAC）。\n③ **TCP 三次握手**：X 与服务器经 SYN → SYN+ACK → ACK 建立连接。\n④ **HTTP 请求与响应**：X 发送 HTTP GET（TCP 数据段），服务器返回 HTTP 响应（HTML 页面）。\n⑤ **连接释放**：数据传完，四次挥手断开 TCP 连接。浏览器解析渲染页面。\n全程中：目的 IP 始终是最终对端（DNS/服务器），而数据链路层帧的目的 MAC 逐跳改为当前转发设备。',
    explanation:
      '本题综合了子网划分、AND 判网、ARP、DNS、TCP 与 HTTP 全链路，是 408 计网大题的经典骨架。判网要点：主机用「自己的掩码」与「目的 IP」相与，不等于本网网络地址即跨网段。全程要区分「IP 地址端到端不变（NAT 场景除外）」与「MAC 地址逐跳改变」。下方时序图按时间顺序演示了全部关键报文，可对照理解每一步的收发双方与先后关系。',
    visual: {
      kind: 'seq',
      title: '主机 X 首次访问子网外 Web 服务器',
      actors: ['主机 X', 'DNS 服务器', 'Web 服务器'],
      messages: [
        { from: '主机 X', to: 'DNS 服务器', label: 'DNS 查询：www.example.com' },
        { from: 'DNS 服务器', to: '主机 X', label: 'DNS 应答：服务器 IP' },
        { from: '主机 X', to: 'Web 服务器', label: 'TCP SYN（seq=x）' },
        { from: 'Web 服务器', to: '主机 X', label: 'TCP SYN+ACK（seq=y, ack=x+1）' },
        { from: '主机 X', to: 'Web 服务器', label: 'TCP ACK（ack=y+1）连接建立' },
        { from: '主机 X', to: 'Web 服务器', label: 'HTTP GET 请求' },
        { from: 'Web 服务器', to: '主机 X', label: 'HTTP 响应（页面数据）' },
        { from: '主机 X', to: 'Web 服务器', label: 'FIN（主动关闭）' },
        { from: 'Web 服务器', to: '主机 X', label: 'ACK' },
        { from: 'Web 服务器', to: '主机 X', label: 'FIN' },
        { from: '主机 X', to: 'Web 服务器', label: 'ACK，连接释放' },
      ],
    },
  },
]
