#!/usr/bin/env bash
# 一键构建 408Lab 单文件离线版 → download/cs408-standalone.html
#
# 原理：next build 静态导出（output: 'export'）→ scripts/build-singlefile.py
#       把全部 JS/CSS/字体/图标内联进一个 HTML，双击即可离线使用。
#
# 用法：bash scripts/build-standalone.sh
set -euo pipefail
cd "$(dirname "$0")/.."

STASH_DIR=".export-tmp"

echo "[1/5] 备份配置与 API 路由（静态导出不支持 route handlers）"
mkdir -p "$STASH_DIR"
cp next.config.ts "$STASH_DIR/next.config.ts.bak"
if [ -d src/app/api ]; then mv src/app/api "$STASH_DIR/api"; fi

echo "[2/5] 切换 next.config：output standalone → export"
python3 - <<'PY'
p = 'next.config.ts'
s = open(p, encoding='utf-8').read()
s = s.replace('output: "standalone"', 'output: "export"')
if 'unoptimized' not in s:
    s = s.replace(
        'reactStrictMode: false,',
        'reactStrictMode: false,\n  images: { unoptimized: true },',
    )
open(p, 'w', encoding='utf-8').write(s)
PY

echo "[3/5] next build（静态导出到 out/）"
rm -rf out
bunx next build

echo "[4/5] 恢复配置与 API 路由"
cp "$STASH_DIR/next.config.ts.bak" next.config.ts
if [ -d "$STASH_DIR/api" ]; then mv "$STASH_DIR/api" src/app/api; fi
rm -rf "$STASH_DIR"

echo "[5/5] 内联为单文件（含 Turbopack 内联修复 + 资源重写器）"
python3 scripts/build-singlefile.py

echo ""
echo "完成 → download/cs408-standalone.html（用浏览器直接打开即可）"
