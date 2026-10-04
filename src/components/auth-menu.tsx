'use client'

import * as React from 'react'
import { Cloud, CloudOff, LogIn, LogOut, RefreshCw, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OFFLINE_MODE, useAuth } from '@/lib/use-auth'
import { cn } from '@/lib/utils'

function AuthForm({
  mode,
  onDone,
}: {
  mode: 'login' | 'register'
  onDone: () => void
}) {
  const login = useAuth((s) => s.login)
  const register = useAuth((s) => s.register)
  const [email, setEmail] = React.useState('')
  const [name, setName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [err, setErr] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setErr('')
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, name, password)
      onDone()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : '操作失败，请重试')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {mode === 'register' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${mode}-name`}>昵称</Label>
          <Input
            id={`${mode}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="怎么称呼你"
            maxLength={24}
            required
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-email`}>邮箱</Label>
        <Input
          id={`${mode}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-pwd`}>密码</Label>
        <Input
          id={`${mode}-pwd`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'register' ? '至少 6 位' : '请输入密码'}
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          minLength={mode === 'register' ? 6 : 1}
          required
        />
      </div>
      {err && (
        <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
          {err}
        </p>
      )}
      <Button type="submit" disabled={busy} className="font-semibold">
        {busy ? '请稍候…' : mode === 'login' ? '登录' : '注册并登录'}
      </Button>
      {mode === 'register' && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          注册后做题记录、错题本与模考成绩将云端保存，换设备登录自动同步；未登录时数据仍保留在本浏览器。
        </p>
      )}
    </form>
  )
}

export function AuthMenu() {
  const user = useAuth((s) => s.user)
  const ready = useAuth((s) => s.ready)
  const syncStatus = useAuth((s) => s.syncStatus)
  const lastSyncAt = useAuth((s) => s.lastSyncAt)
  const logout = useAuth((s) => s.logout)
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<'login' | 'register'>('login')

  /* 离线单文件版无后端：不渲染账号入口，避免无效操作 */
  if (OFFLINE_MODE) return null

  if (!ready) return null

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 font-mono text-xs"
          onClick={() => {
            setTab('login')
            setOpen(true)
          }}
        >
          <LogIn className="h-3.5 w-3.5" />
          登录
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-mono">~/408Lab · 账号</DialogTitle>
              <DialogDescription>
                登录后做题记录云端保存，多设备无缝续刷。
              </DialogDescription>
            </DialogHeader>
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="register">注册</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-4">
                <AuthForm mode="login" onDone={() => setOpen(false)} />
              </TabsContent>
              <TabsContent value="register" className="mt-4">
                <AuthForm mode="register" onDone={() => setOpen(false)} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  const time = lastSyncAt
    ? new Date(lastSyncAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="账号菜单"
          className={cn(
            'flex h-8 items-center gap-2 rounded-full border bg-card px-2 pr-3 text-xs outline-none transition-colors',
            'hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-bold text-primary-foreground">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden max-w-24 truncate font-mono sm:inline">{user.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <UserIcon className="h-3.5 w-3.5 text-primary" />
          <span className="truncate">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
          {syncStatus === 'syncing' && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
          {syncStatus === 'ok' && <Cloud className="h-3.5 w-3.5 text-emerald-500" />}
          {syncStatus === 'error' && <CloudOff className="h-3.5 w-3.5 text-rose-500" />}
          {syncStatus === 'syncing' && '云端同步中…'}
          {syncStatus === 'ok' && `已同步云端 · ${time}`}
          {syncStatus === 'error' && '同步失败，稍后自动重试'}
          {syncStatus === 'idle' && '云端同步待命'}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void logout()} className="gap-2 text-rose-600 dark:text-rose-400">
          <LogOut className="h-3.5 w-3.5" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
