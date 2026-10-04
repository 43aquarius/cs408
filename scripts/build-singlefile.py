#!/usr/bin/env python3
"""把 Next.js 静态导出的 out/ 内联为单个 HTML 文件（cs408 单文件离线版）。

处理：
1. <link rel="stylesheet"> → <style>（CSS 内联，内部字体 URL 转 data URI）
2. <script src="/_next/..."> → 内联 <script>（转义 </script）
3. 移除 font/script preload 链接（已内联，避免 file:// 下 404 噪音）
4. favicon / apple-touch-icon → data URI
5. 校验：结果中不应再残留 "/_next/ 与根路径资源引用（除锚点/外部 https）
"""
import base64
import re
import sys
from pathlib import Path

OUT = Path('/home/z/my-project/out')
DEST = Path('/home/z/my-project/download/cs408-standalone.html')

html = (OUT / 'index.html').read_text(encoding='utf-8')
orig_len = len(html)

# ---------- 0. 展示现有资源引用，便于人工核对 ----------
links = re.findall(r'<link[^>]+>', html)
scripts = re.findall(r'<script[^>]*src="[^"]*"[^>]*>', html)
print(f'[info] index.html {orig_len/1024:.1f} KB · {len(links)} links · {len(scripts)} external scripts')


def read_bytes(p: str) -> bytes:
    return (OUT / p.lstrip('/')).read_bytes()


def read_text(p: str) -> str:
    return (OUT / p.lstrip('/')).read_text(encoding='utf-8')


def b64(data: bytes, mime: str) -> str:
    return f'data:{mime};base64,' + base64.b64encode(data).decode('ascii')


# ---------- 1. CSS 内联（含字体 data URI） ----------
CSS_DIR = OUT / '_next/static/chunks'  # 相对 url(../media/…) 以 css 所在目录为基准


def inline_css(m: re.Match) -> str:
    href = m.group(1)
    css = read_text(href)

    def font_repl(fm: re.Match) -> str:
        path = fm.group(1)
        # 绝对路径（/_next/…）以 out 为根；相对路径（../media/…）以 css 目录为根
        font_file = (OUT / path.lstrip('/')) if path.startswith('/') else (CSS_DIR / path)
        data = b64(font_file.read_bytes(), 'font/woff2')
        print(f'[font] {path.split("/")[-1]} → data URI ({len(data)//1024} KB)')
        return f'url({data})'

    css = re.sub(r'url\((\.\./media/[^)]+?\.woff2)\)', font_repl, css)
    css = re.sub(r'url\((/_next/static/media/[^)]+?\.woff2)\)', font_repl, css)
    return f'<style>{css}</style>'


html, n_css = re.subn(r'<link rel="stylesheet" href="(/[^"]+)"[^>]*/>', inline_css, html)
print(f'[css] inlined {n_css} stylesheets')

# ---------- 2. JS 内联 ----------
# Turbopack 运行时从每个 chunk 的 <script src> 解析模块 URL；内联后无 src，
# 需在首个脚本前注入 TURBOPACK_NEXT_CHUNK_URLS（pop 顺序 = push 顺序的逆序）。
chunk_urls: list[str] = []  # 文档顺序记录「调用 push 的 chunk」的原始 URL


def inline_js(m: re.Match) -> str:
    src = m.group(1)
    js = read_text(src)
    n = len(js)
    js = js.replace('</script', '<\\/script')  # 防止提前闭合
    if '(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push' in js:
        # 含 push 调用的 chunk（含 turbopack 运行时自身的 otherChunks 元数据 push）
        chunk_urls.append(src)
    # Next.getAssetPrefix 模块：内联脚本 currentScript.src 为空串，
    # new URL("") 抛 Invalid URL —— 给空值一个含 /_next/ 的合法回退 URL
    if 'new URL(e.src)' in js:
        js = js.replace('new URL(e.src)', 'new URL(e.src||"file:///_next/")')
        print(f'[fix]  {src.split("/")[-1]}: getAssetPrefix 内联回退已注入')
    print(f'[js]   {src.split("/")[-1]} → inline ({n//1024} KB)')
    return f'<script>{js}</script>'


html, n_js = re.subn(r'<script[^>]*src="(/_next/[^"]+)"[^>]*>\s*</script>', inline_js, html)
print(f'[js] inlined {n_js} scripts · {len(chunk_urls)} push-chunks')

if chunk_urls:
    arr = ',\n'.join(f'  "{u}"' for u in reversed(chunk_urls))
    observer = (
        '<script>/* 单文件离线版：重写运行时动态创建的 /_next/ 资源引用（已全部内联） */\n'
        '(function(){\n'
        '  function rw(el){\n'
        '    try{\n'
        '      var u=el.getAttribute("href")||el.getAttribute("src")||"";\n'
        '      var m=u.match(/_next\\/static\\/.*/); if(!m) return;\n'
        '      if(el.tagName==="SCRIPT"){ el.setAttribute("src","data:text/javascript,"); }\n'
        '      else if(el.tagName==="LINK"){\n'
        '        var as=el.getAttribute("as")||"";\n'
        '        if(as==="font"||/\\.woff2$/.test(m[0])) el.setAttribute("href","data:font/woff2;base64,");\n'
        '        else el.setAttribute("href","data:text/css,");\n'
        '      }\n'
        '    }catch(e){}\n'
        '  }\n'
        '  function scan(n){ if(n.nodeType===1&&(n.tagName==="SCRIPT"||n.tagName==="LINK")) rw(n); }\n'
        '  new MutationObserver(function(muts){\n'
        '    muts.forEach(function(mu){ Array.prototype.forEach.call(mu.addedNodes, scan); });\n'
        '  }).observe(document.documentElement,{childList:true,subtree:true});\n'
        '})();</script>\n'
        '<script>/* 单文件离线版：为内联 chunk 提供 Turbopack 模块解析 URL */'
        f'window.TURBOPACK_NEXT_CHUNK_URLS=[\n{arr}\n];</script>'
    )
    first = html.find('<script')
    html = html[:first] + observer + html[first:]
    print(f'[turbopack] injected TURBOPACK_NEXT_CHUNK_URLS × {len(chunk_urls)} + resource rewriter')

# ---------- 3. 移除已内联资源的 preload ----------
html, n_pre = re.subn(
    r'<link rel="preload"[^>]*(?:href="/_next/[^"]*"|as="script")[^>]*/>', '', html
)
print(f'[preload] removed {n_pre} preload links')

# ---------- 4. favicon → data URI ----------
ICON_MIME = {'.svg': 'image/svg+xml', '.png': 'image/png'}


def icon_repl(m: re.Match) -> str:
    tag, href = m.group(0), m.group(1)
    ext = Path(href).suffix
    if ext == '.svg':
        # svg 用 url 编码更省体积
        svg = read_text(href)
        enc = svg.replace('"', "'").replace('%', '%25').replace('#', '%23').replace('<', '%3C').replace('>', '%3E')
        uri = 'data:image/svg+xml,' + enc
    else:
        uri = b64(read_bytes(href), 'image/png')
    print(f'[icon] {href} → data URI ({len(uri)//1024} KB)')
    return tag.replace(f'href="{href}"', f'href="{uri}"')


html, n_icon = re.subn(r'<link[^>]*href="(/(?:icon|apple-icon)[^"]*)"[^>]*>', icon_repl, html)
print(f'[icon] rewritten {n_icon} icon links')

# ---------- 5. 残留引用检查 ----------
leftovers = re.findall(r'(?:href|src)="(/[^"]*)"', html)
leftovers = [l for l in leftovers if not l.startswith('/#') and l != '/']
if leftovers:
    print('[WARN] 残留根路径引用:')
    for l in sorted(set(leftovers)):
        print('   ', l)

DEST.parent.mkdir(parents=True, exist_ok=True)
DEST.write_text(html, encoding='utf-8')
size = DEST.stat().st_size
print(f'[done] {DEST} · {size/1024/1024:.2f} MB（限制 50 MB）')
if size > 50 * 1024 * 1024:
    sys.exit('[FAIL] 超过 50MB 限制')
