# 408 精选题库数据规范 v1（生成必读）

## 目标与来源定位

编写 `src/data/curated/` 下的**高质量练习题**（非真题）：每科一个文件、80 题。命题风格对齐以下公认可靠来源（按优先级）：

1. **王道四本复习指导的课后习题与小节练习**（考纲全覆盖、难度分层）
2. **天勤高分笔记系列**（尤其数据结构的推导型题目）
3. **经典教材课后题**：严蔚敏《数据结构》、唐朔飞《计算机组成原理》、汤小丹《操作系统》、谢希仁《计算机网络》
4. **408 统考前的名校自命题真题**中的经典题型（2009 年以前各校试题）

所有题目为按上述来源风格命题的**原创/改编题**，`source: 'curated'`、`origin: '精选题库'`、`year: 0`。**不得照抄**站内真题库（`src/data/questions/`）已有题干。

## 文件组织

- `src/data/curated/curated-ds.ts`：导出 `curatedDs: Question[]`（数据结构 80 题）
- `src/data/curated/curated-co.ts`：导出 `curatedCo: Question[]`（组成原理 80 题）
- `src/data/curated/curated-os.ts`：导出 `curatedOs: Question[]`（操作系统 80 题）
- `src/data/curated/curated-cn.ts`：导出 `curatedCn: Question[]`（计算机网络 80 题）
- 参数过长时拆两个文件再合并导出（如 `curated-ds-1.ts` + `curated-ds-2.ts` + `curated-ds.ts` 合并）
- **禁止**改动 `index.ts`、`types.ts`、视图组件、其他科目文件；只 import 类型：

```ts
import type { Question } from '../types'
```

## 题量结构（每科 80 题）

- 单选题 72 题（`type: 'single'`，`score: 2`）
- 综合应用题 8 题（`type: 'application'`，`score: 8–15` 自定，模拟大题风格）
- `number` 为文件内顺序号 1–80（单选 1–72，综合 73–80）

## 字段模板

```ts
{
  id: 'cur-ds-001',          // cur-{科目}-{三位序号}，与 number 一致
  year: 0,                   // 固定 0
  origin: '精选题库',          // 固定
  number: 1,
  subject: 'ds',             // 与文件科目一致
  type: 'single',
  topic: '循环队列',           // ≤8 字，与真题库 topic 命名风格一致
  difficulty: 2,
  source: 'curated',         // 固定
  score: 2,
  question: '题干……？',
  options: ['…', '…', '…', '…'],
  answer: 'B',
  explanation: '考点定位 + 推导/结论 + 主要干扰项为何错（≥80 字）',
  optionExplanations: ['…', '…', '…', '…'],   // 强烈建议：较难题/易错题必填（≥20 字/条）
  visual: { … },              // 过程类题目建议配（规范见 mocks/SPEC-MOCK.md）
}
```

综合题（73–80 题）同模板，但用 `answerText`（完整推导）替代 options/answer，`explanation` 写思路与易错点。

## 质量硬性要求

1. **考点分布**：覆盖该科主干考纲（任务简报给出最低覆盖清单）；同文件内同 topic 题目 ≤ 4 道
2. **难度分层**：难度 1 约 24 题、难度 2 约 40 题、难度 3 约 16 题
3. **题目自洽**：条件完备、答案唯一；answer 与 explanation、optionExplanations（如有）三方一致
4. **计算题全部手工验算**；题目之间不得重复（同考点可多角度命题）
5. **与真题区分**：经典题型（如循环队列判满、Cache 映射计算、PV 苹果橘子、子网划分）允许同型，但数值、情境、提问角度必须自拟，不得与真题库题干雷同
6. 严禁占位文本；每题 explanation ≥ 80 字
7. 每科至少 5 题配 visual 动画（规范见 `/home/z/my-project/src/data/mocks/SPEC-MOCK.md` 的 visual 章节，8 种可选）
8. 富文本记法：换行 `\n`；行内代码反引号；**加粗**双星号；幂写 `2^10`；十六进制带 H 后缀

## 自检（写完必做）

```bash
bun /home/z/my-project/scripts/verify-curated.ts ds    # 换成你的科目 ds/co/os/cn
```

修复所有 ERROR 直至 ALL CHECKS PASSED。人工抽查 3 道：answer 字母、正确选项内容、explanation 结论三方一致。
