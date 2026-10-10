#!/usr/bin/env python3
"""将本次笔记扩充的 7 个文件以单提交推送到 GitHub main（Git Data API）。

用法：python3 scripts/push-notes-update.py
"""
import base64
import json
import os
import sys
import urllib.request

REPO = '43aquarius/cs408'
TOKEN = os.environ.get('GH_TOKEN', '')
API = f'https://api.github.com/repos/{REPO}'
HEADERS = {
    'Authorization': f'Bearer {TOKEN}',
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'cs408-push-script',
}

FILES = [
    'src/data/notes/ds.ts',
    'src/data/notes/co.ts',
    'src/data/notes/os.ts',
    'src/data/notes/cn.ts',
    'src/data/notes/guide.ts',
    'src/data/notes/trends.ts',
    'scripts/create-release.py',
]

COMMIT_MSG = (
    'notes: 经验笔记内容大扩充（40→41 章，559→1159 块，字数约翻倍）\n\n'
    '- 新增 6 章：算法基础与复杂度（ds-intro）、数组与串/KMP 专项（ds-array）、\n'
    '  计算机系统概述与性能指标（co-intro）、四科分科方法论（guide-subjects）、\n'
    '  高频 FAQ 20 问（guide-faq）、四科核心公式速查卡（trends-formula）\n'
    '- 全部 35 个既有章节深化：补完整算例（KMP 手算、Dijkstra/关键路径、B 树插删、\n'
    '  散列双 ASL、调度/银行家/页面置换/磁盘调度、Cache 拆地址、流水线时空图、\n'
    '  拥塞窗口 24 轮演化、VLSM/聚合/最长前缀匹配等），全部经 python 验算\n'
    '- 附 scripts/create-release.py（上版遗留未推送的 Release 发布脚本）'
)


def call(method: str, url: str, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    with urllib.request.urlopen(req) as r:
        txt = r.read()
        return json.loads(txt) if txt else {}


def main():
    if not TOKEN:
        print('✗ 请先 export GH_TOKEN')
        sys.exit(1)

    # 1. 远端 main 当前提交与树
    branch = call('GET', f'{API}/branches/main')
    base_sha = branch['commit']['sha']
    base_tree = branch['commit']['commit']['tree']['sha']
    print(f'远端 main: {base_sha[:7]} (tree {base_tree[:7]})')

    # 2. 创建 blob
    tree_items = []
    for path in FILES:
        raw = open(path, 'rb').read()
        blob = call('POST', f'{API}/git/blobs', {
            'content': base64.b64encode(raw).decode(),
            'encoding': 'base64',
        })
        tree_items.append({
            'path': path,
            'mode': '100644',
            'type': 'blob',
            'sha': blob['sha'],
        })
        print(f'  blob {path} ({len(raw):,} B)')

    # 3. 树 + 提交
    tree = call('POST', f'{API}/git/trees', {
        'base_tree': base_tree,
        'tree': tree_items,
    })
    commit = call('POST', f'{API}/git/commits', {
        'message': COMMIT_MSG,
        'tree': tree['sha'],
        'parents': [base_sha],
    })
    print(f'新提交: {commit["sha"][:9]}')

    # 4. 推进 main
    ref = call('PATCH', f'{API}/git/refs/heads/main', {'sha': commit['sha']})
    print(f'✓ main 已更新 -> {ref["object"]["sha"][:9]}')


if __name__ == '__main__':
    main()
