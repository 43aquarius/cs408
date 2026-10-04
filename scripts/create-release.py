#!/usr/bin/env python3
"""创建 GitHub Release 并上传单文件离线版资产"""
import json
import sys
import urllib.request
from pathlib import Path

TOKEN = sys.argv[1]
REPO = '43aquarius/cs408'
ASSET = Path('/home/z/my-project/download/cs408-standalone.html')

BODY = """## 408Lab v1.0.0

考研 408 刷题实验室首个发布版。

### 题库规模（共 1636 题）

| 来源 | 数量 | 说明 |
| --- | --- | --- |
| 统考真题 | 846 题 | 2009–2026 共 18 套整卷（40 单选 + 7 综合应用，150 分结构） |
| 精选题库 | 320 题 | 数据结构 / 组成原理 / 操作系统 / 计算机网络 四科各 80 题 |
| 全真模拟卷 | 470 题 | 自创 10 套（每套 47 题），难度梯度从「基础过关」到「终极押题」 |

### 亮点

- 每道单选的 **A/B/C/D 四个选项各有独立讲解**（正确项讲原理，错误项给精确错因）
- 8 类**可播放动画讲解**：排序过程、树构造、图算法、页面置换、拥塞窗口演化、流水线时空图、协议时序、流程图
- 35 章经验笔记（备考指南 + 四科知识体系 + 考情易错），章节与真题考频联动
- 整卷模考（180 分钟倒计时 + 答题卡 + 逐题复盘）、错题本、GitHub 风格刷题热力图
- 打字机问候语、悬浮卡片、代码复制闪烁、阅读进度条、浅色/系统/深色三态主题

### 单文件离线版（cs408-standalone.html）

- **下载后双击即可使用**，无需安装 Node.js、无需联网、无需服务器
- 一个 HTML 约 4 MB，包含全部 1636 道题目、解析、动画与笔记
- 做题记录 / 错题本 / 模考成绩保存在本地浏览器（localStorage），刷新与重开不丢失
- 离线版不含注册登录与云端同步（完整版请自行部署源码，见 README）

### 在线完整版（账号 + 云同步）

```bash
git clone https://github.com/43aquarius/cs408.git
cd cs408 && bun install && bun run db:push && bun dev
```

### 免责声明

题库依据历年统考真题整理（含图题目已文本化改编），模拟卷与精选题为自创；仅供个人备考学习使用。
"""


def api(url: str, data=None, method='GET', ctype='application/json', raw=None):
    req = urllib.request.Request(url, method=method)
    req.add_header('Authorization', f'Bearer {TOKEN}')
    req.add_header('Accept', 'application/vnd.github+json')
    if raw is not None:
        req.add_header('Content-Type', ctype)
        body = raw
    elif data is not None:
        body = json.dumps(data).encode()
    else:
        body = None
    with urllib.request.urlopen(req, body) as r:
        return json.loads(r.read())


# 1. 创建 release（自动打 tag v1.0.0）
rel = api(
    f'https://api.github.com/repos/{REPO}/releases',
    data={
        'tag_name': 'v1.0.0',
        'target_commitish': 'main',
        'name': 'v1.0.0 · 408Lab 全量题库（1636 题）+ 单文件离线版',
        'body': BODY,
        'draft': False,
        'prerelease': False,
    },
    method='POST',
)
print('release created:', rel['html_url'], '| id:', rel['id'])

# 2. 上传单文件资产
up = api(
    f"https://uploads.github.com/repos/{REPO}/releases/{rel['id']}/assets?name=cs408-standalone.html",
    method='POST',
    ctype='text/html; charset=utf-8',
    raw=ASSET.read_bytes(),
)
print('asset uploaded:', up['browser_download_url'], '| size:', up['size'])
