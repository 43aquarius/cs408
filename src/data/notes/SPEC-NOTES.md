# 经验笔记内容生成规范（SPEC-NOTES）

> 本规范面向「四科核心笔记 + 考情分析」共 5 个内容文件的生成任务。
> 黄金样例：`src/data/notes/guide.ts`（备考指南，主 Agent 亲写）——**先读它，再动笔**。

## 1. 文件与导出

- 每个类别一个文件，位于 `src/data/notes/`，导出与文件同名的 `const`：
  - `ds.ts` → `export const ds: NoteCategory`
  - `co.ts` → `export const co: NoteCategory`
  - `os.ts` → `export const os: NoteCategory`
  - `cn.ts` → `export const cn: NoteCategory`
  - `trends.ts` → `export const trends: NoteCategory`
- 类别字段：`id`（'ds'|'co'|'os'|'cn'|'trends'）、`title`、`subtitle`、`icon`（与 id 同名）、`order`（ds=2, co=3, os=4, cn=5, trends=6）。

## 2. 类型定义（见 src/data/notes/types.ts）

```ts
NoteBlock =
  | { kind: 'p'; text: string }                                  // 段落
  | { kind: 'h'; text: string }                                  // 章内子标题
  | { kind: 'list'; items: string[]; ordered?: boolean }         // 列表
  | { kind: 'code'; lang?: string; title?: string; text: string } // 代码块
  | { kind: 'table'; head: string[]; rows: string[][] }          // 对比表格
  | { kind: 'callout'; tone: 'tip'|'warn'|'key'; title?: string; text: string }
  | { kind: 'steps'; items: string[] }                           // 步骤
  | { kind: 'kv'; items: Array<{ k: string; v: string }> }       // 要点卡
```

章节（NoteChapter）：`id` / `title` / `brief`（≥20 字）/ `minutes`（6–15）/ `tags`（1–3 个）/ `topicKeywords` / `blocks`（≥6 块，首块建议为 p 总起）。

## 3. 字符串书写规则（重要）

- **所有字符串一律用单引号** `'...'`。正文里的反引号 \`行内代码\` 在单引号字符串中无需转义，直接写。
- 正文中**禁止出现英文单引号**（撇号），中文内容不会自然出现；若确需引用，用中文引号「」或“”。
- 富文本仅支持 `**加粗**` 与 `` `行内代码` ``，二者必须**成对出现**；不支持其他 markdown 语法（无标题井号、无链接、无列表符号——列表请用 list 块）。
- 上标写法：用文字（如 2^10、10^5、2 的 10 次方）或 Unicode 上标字符（2¹⁰），**禁止使用 \u 转义**。

## 4. topicKeywords（考频联动，必须认真填）

章节的 `topicKeywords` 会与本站 846 道真题的 `topic` 字段做**双向包含匹配**，用于展示「本站真题 N 题 · 覆盖年份」并支持一键跳转刷题。

- 写该章核心考点的 2–8 个关键词，如 `['二叉树', '遍历', '哈夫曼', '线索']`。
- 先运行以下命令查看本科目真题里**真实存在的 topic 与题量**，从中提炼关键词（避免写了匹配不上的词）：

```bash
cd /home/z/my-project && python3 -c "
import re, glob, collections
c = collections.Counter()
for f in glob.glob('src/data/questions/y*.ts'):
    src = open(f, encoding='utf-8').read()
    for m in re.finditer(r\"subject: '(ds|co|os|cn)'.*?topic: '([^']+)'\", src, re.S):
        if m.group(1) == 'ds': c[m.group(2)] += 1
    for m in re.finditer(r\"topic: '([^']+)'\", src):
        pass
for t, n in c.most_common(80): print(n, t)
" 2>/dev/null || true
```

（把 `'ds'` 换成你的科目代码；正则跨行匹配可能漏题，仅作关键词参考，不必较真总数。）
- 关键词要「短而有区分度」：`'Cache'` 优于 `'Cache 映射方式'`；`'排序'` 会同时命中『拓扑排序』，属可接受的宽匹配，但如需精确请写 `'快速排序'`、`'堆'` 等。
- 与他科强重叠的通用词（如 `'中断'` 同时属于 co 与 os）没关系——展示层会先按科目过滤，只用本科目的题。

## 5. 内容标准（防浅薄，硬性要求）

- **每章 ≥ 6 个内容块**，其中至少：1 个 p 总起（3–5 句）、≥1 个 table 或 kv（对比/速记）、≥1 个 callout（`warn`=易错警示 / `key`=核心结论 / `tip`=经验建议）、其余自由组合。
- 代码块（kind:'code'）用于数据结构与算法模板（C 语言）、PV 伪代码、协议交互示意等；**代码必须可读可运行级别**（语法正确、缩进 4 空格）。
- 结论式写作：优先「怎么考、怎么算、怎么记、错在哪」，而非教材式铺陈。每章都要让读者带走：**一张对比表 / 一套计算流程 / 一份易错清单**。
- 数字与公式必须自洽：涉及计算的结论（如循环队列元素个数公式、Cache 平均访问时间、TCP 拥塞窗口演化）要给出典型算例，**算例必须人工验算无误**。
- 篇幅基准：每章正文折合 600–1000 字（不含代码），minutes 按正文阅读时长估（6–15）。
- 语言：简体中文，术语用 408 考纲标准译名；首次出现英文缩写给出全称。

## 6. 章节结构与 ID 约定

- id 全小写、以科目为前缀：如 `ds-tree`、`co-cache`、`os-pv`、`cn-tcp`、`trends-freq`。
- 同一文件内章节顺序 = 逻辑教学顺序（见各自任务简报）。
- tags 建议：`['高频']`、`['必背']`、`['计算题']`、`['大题']`、`['易错']` 等 1–3 个。

## 7. 自检流程（写完必做）

```bash
cd /home/z/my-project && bun scripts/verify-notes.ts src/data/notes/<你的文件>.ts
# 期望输出：✓ ALL CHECKS PASSED
```

- 修复所有 `✗` 问题后重跑，直到通过。
- 不要运行 `tsc --noEmit` 全量检查（其他并行文件可能尚未就位）；只需保证本文件语法正确（verify 脚本能 import 成功即证明）。
- **禁止改动**：`types.ts`、`index.ts`、`guide.ts`、组件与页面代码。

## 8. 完成后

向 `/home/z/my-project/worklog.md` 追加记录（模板见文件头部约定），包含：章节清单、每章 topicKeywords 与命中的真题数（自行用脚本统计）、存疑/取舍说明。
