/** 从 public/icon.svg 生成 PNG 标签图标回退（sharp 内置 librsvg） */
import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const svg = readFileSync('/home/z/my-project/public/icon.svg')

const targets: Array<[string, number]> = [
  ['/home/z/my-project/public/icon-32.png', 32],
  ['/home/z/my-project/public/icon-192.png', 192],
  ['/home/z/my-project/public/apple-icon.png', 180],
  ['/home/z/my-project/tool-results/favicon-preview.png', 256],
]

for (const [out, size] of targets) {
  await sharp(svg, { density: Math.round((72 * size) / 64) })
    .resize(size, size)
    .png()
    .toFile(out)
  console.log('written', out, size)
}
