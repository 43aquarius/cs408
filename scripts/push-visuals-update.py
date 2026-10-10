#!/usr/bin/env python3
"""把本地 git 已提交内容以聚合提交推送到 GitHub main（Git Data API）。

以远端 main 为 base_tree，把本次变更涉及的所有文件（相对上一次推送 024b5e5/d1f4bb8 的差异）
全部更新到新树。用法：GH_TOKEN=... python3 scripts/push-visuals-update.py
"""
import base64
import json
import os
import subprocess
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


def call(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    with urllib.request.urlopen(req) as r:
        txt = r.read()
        return json.loads(txt) if txt else {}


def main():
    if not TOKEN:
        print('✗ 请先 export GH_TOKEN')
        sys.exit(1)

    # 1. 收集工作区相对 HEAD 无差异、但远端还没有的文件：
    #    策略——直接对比「远端 main 的树」与「本地 HEAD 的树」，推送本地 HEAD 全量差异
    branch = call('GET', f'{API}/branches/main')
    remote_sha = branch['commit']['sha']
    remote_tree_sha = branch['commit']['commit']['tree']['sha']
    print(f'远端 main: {remote_sha[:7]}')

    head_sha = subprocess.run(
        ['git', 'rev-parse', 'HEAD'], capture_output=True, text=True, check=True
    ).stdout.strip()
    head_tree = subprocess.run(
        ['git', 'rev-parse', 'HEAD^{tree}'], capture_output=True, text=True, check=True
    ).stdout.strip()
    print(f'本地 HEAD: {head_sha[:7]} (tree {head_tree[:7]})')

    if head_sha == remote_sha:
        print('✓ 远端已是最新，无需推送')
        return

    # 2. 枚举远端树与本地树的差异（以本地为准，含新增/修改/删除）
    remote_tree = call('GET', f'{API}/git/trees', ) if False else None
    # 用 git ls-tree 列出本地树全部 blob
    ls = subprocess.run(
        ['git', 'ls-tree', '-r', 'HEAD', '--format=%(objectname)\t%(path)'],
        capture_output=True, text=True, check=True,
    ).stdout
    local_blobs = {}
    for line in ls.splitlines():
        sha, path = line.split('\t', 1)
        local_blobs[path] = sha

    # 远端树（递归拉取）
    rt = call('GET', f'{API}/git/trees/{remote_tree_sha}?recursive=1')
    remote_blobs = {
        e['path']: e['sha'] for e in rt.get('tree', []) if e['type'] == 'blob'
    }

    changed = {
        p: s for p, s in local_blobs.items() if remote_blobs.get(p) != s
    }
    removed = [p for p in remote_blobs if p not in local_blobs]
    print(f'差异：更新 {len(changed)} 个文件，删除 {len(removed)} 个')

    # 3. 本地树直接建提交（无需逐文件上传 blob——GitHub API 支持按 sha 引用，
    #    但远端没有这些 blob；因此对每个差异文件上传内容）
    tree_items = []
    for path, sha in sorted(changed.items()):
        raw = subprocess.run(
            ['git', 'show', f'HEAD:{path}'], capture_output=True, check=True
        ).stdout
        blob = call('POST', f'{API}/git/blobs', {
            'content': base64.b64encode(raw).decode(),
            'encoding': 'base64',
        })
        tree_items.append({'path': path, 'mode': '100644', 'type': 'blob', 'sha': blob['sha']})
        print(f'  blob {path} ({len(raw):,} B)')
    for path in removed:
        tree_items.append({'path': path, 'mode': '100644', 'type': 'blob', 'sha': None})
        print(f'  rm   {path}')

    # 4. 建树、提交、推进 main
    tree = call('POST', f'{API}/git/trees', {
        'base_tree': remote_tree_sha,
        'tree': tree_items,
    })
    commit = call('POST', f'{API}/git/commits', {
        'message': (
            'feat: 风格化封面 + 题目收藏与备注（收藏夹）\n\n'
            '- 新增全屏封面 CoverHero：巨型 408Lab 渐变字标（字符解码动画）、'
            '实验室开机自检、四科机架模块、四科考点跑马灯、终端状态栏\n'
            '- globals.css 新增 6 组动画（float/marquee/boot/breathe/nudge/rise），reduced-motion 全兼容\n'
            '- 题目收藏 + 个人备注：fav-note 组件接入 QuestionBody（题库弹窗/刷题/错题本/模拟考试全场景）\n'
            '- 题卡星标快捷收藏；题库筛选「只看收藏」；新增收藏夹视图（分组/备注预览/重练）\n'
            '- 云同步支持收藏与备注：SyncState.favorites 字段 + 双时间线合并（fav按ts / note按noteAt）\n'
            '- 移除收藏二次确认防误触；误移除后备注保留可恢复'
        ),
        'tree': tree['sha'],
        'parents': [remote_sha],
    })
    print(f'新提交: {commit["sha"][:9]}')
    ref = call('PATCH', f'{API}/git/refs/heads/main', {'sha': commit['sha']})
    print(f'✓ main 已更新 -> {ref["object"]["sha"][:9]}')


if __name__ == '__main__':
    main()
