import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createSession, verifyPassword } from '@/lib/auth'

const Body = z.object({
  email: z.string().trim().email('邮箱格式不正确'),
  password: z.string().min(1, '请填写密码'),
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
    const { email, password } = parsed.data
    const user = await db.user.findUnique({ where: { email } })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }
    await createSession(user.id)
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (e) {
    console.error('[login]', e)
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 })
  }
}
