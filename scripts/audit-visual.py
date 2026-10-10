#!/usr/bin/env python3
"""审计三库 visual 覆盖与固定题型分布"""
import re, glob, collections, json

def parse_questions(path):
    """从 ts 文件按顶层 `{ id: ...` 切分题目对象"""
    src = open(path, encoding='utf-8').read()
    # 每题以 2 空格缩进的 { 开始，id 在 4 空格缩进
    qs = re.split(r'\n  \{', src)
    out = []
    for q in qs[1:]:
        m = re.match(r'\n\s+id: .([a-zA-Z0-9-]+).', q)
        if not m:
            continue
        qid = m.group(1)
        sub = re.search(r"subject: '(ds|co|os|cn)'", q)
        dif = re.search(r'difficulty: ([123])', q)
        typ = re.search(r"type: '(single|application)'", q)
        topic = re.search(r"topic: '([^']+)'", q)
        has_vis = re.search(r'\n    visual: \{', q) is not None
        vk = None
        if has_vis:
            vm = re.search(r"kind: '(sort|tree|graph|pages|cwnd|pipeline|seq|flow)'", q)
            vk = vm.group(1) if vm else '?'
        out.append({
            'file': path, 'id': qid,
            'subject': sub.group(1) if sub else '?',
            'difficulty': int(dif.group(1)) if dif else 0,
            'type': typ.group(1) if typ else '?',
            'topic': topic.group(1) if topic else '?',
            'has_visual': has_vis, 'visual_kind': vk,
        })
    return out

all_q = []
for pat, label in [('src/data/questions/y*.ts', '真题'), ('src/data/curated/curated-*.ts', '精选'), ('src/data/mocks/mock*.ts', '模拟')]:
    files = [f for f in sorted(glob.glob(pat)) if 'SPEC' not in f]
    qs = []
    for f in files:
        qs += parse_questions(f)
    for q in qs:
        q['bank'] = label
    all_q += qs
    print(f'== {label}: {len(qs)} 题, 有 visual {sum(1 for x in qs if x["has_visual"])} ({100*sum(1 for x in qs if x["has_visual"])//max(len(qs),1)}%)')
    for sub in ['ds', 'co', 'os', 'cn']:
        sq = [x for x in qs if x['subject'] == sub]
        wv = [x for x in sq if x['has_visual']]
        print(f'   {sub}: {len(sq)} 题 / visual {len(wv)}')
    for d in [1, 2, 3]:
        dq = [x for x in qs if x['difficulty'] == d]
        wv = sum(1 for x in dq if x['has_visual'])
        print(f'   难度{d}: {len(dq)} 题 / visual {wv}')

json.dump(all_q, open('scripts/audit-visual.json', 'w'), ensure_ascii=False, indent=1)
print('\ntotal:', len(all_q), '-> scripts/audit-visual.json')
