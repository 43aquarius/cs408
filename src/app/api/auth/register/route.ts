import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createSession, hashPassword } from '@/lib/auth'

const Body = z.object({
  email: z.string().trim().email('邮箱格式不正确'),
  name: z.string().trim().min(1, '请填写昵称').max(24, '昵称最长 24 个字符'),
  password: z.string().min(6, '密码至少 6 位').max(64, '密码最长 64 位'),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? '参数不合法' },
        { status: 400 },
      )
    }
    const { email, name, password } = parsed.data
    const exists = await db.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: '该邮箱已注册，请直接登录' }, { status: 409 })
    }
    const user = await db.user.create({
      data: { email, name, passwordHash: hashPassword(password) },
    })
    await createSession(user.id)
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (e) {
    console.error('[register]', e)
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
  }
}
