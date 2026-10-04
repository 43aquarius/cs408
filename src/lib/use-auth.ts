'use client'

import * as React from 'react'
import { create } from 'zustand'
import { useProgress } from '@/lib/store'

export interface AuthUser {
  id: string
  email: string
  name: string
}

export type SyncStatus = 'idle' | 'syncing' | 'ok' | 'error'

/**
 * 单文件离线版（file:// 协议）没有后端：
 * 账号与云同步请求全部短路，做题记录仍走 localStorage 本地持久化。
 */
export const OFFLINE_MODE =
  typeof window !== 'undefined' && window.location.protocol === 'file:'

interface AuthState {
  user: AuthUser | null
  ready: boolean
  syncStatus: SyncStatus
  lastSyncAt: number
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

async function api<T>(url: string, body?: unknown): Promise<T> {
  if (OFFLINE_MODE) {
    throw new Error('离线单文件版不含后端服务，做题记录仍会保存在本地浏览器')
  }
  const res = await fetch(url, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(data?.error || '请求失败，请稍后重试')
  return data
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  ready: false,
  syncStatus: 'idle',
  lastSyncAt: 0,
  init: async () => {
    if (OFFLINE_MODE) {
      set({ user: null, ready: true })
      return
    }
    try {
      const { user } = await api<{ user: AuthUser | null }>('/api/auth/me')
      set({ user, ready: true })
      if (user) await pullMerge()
    } catch {
      set({ ready: true })
    }
  },
  login: async (email, password) => {
    const { user } = await api<{ user: AuthUser }>('/api/auth/login', { email, password })
    set({ user, ready: true })
    await pullMerge()
  },
  register: async (email, name, password) => {
    const { user } = await api<{ user: AuthUser }>('/api/auth/register', {
      email,
      name,
      password,
    })
    set({ user, ready: true })
    await pullMerge()
  },
  logout: async () => {
    try {
      await api('/api/auth/logout', {})
    } catch {
      /* 忽略网络错误，本地退出 */
    }
    set({ user: null, syncStatus: 'idle', lastSyncAt: 0 })
  },
}))

/* ---------------- 云同步引擎 ---------------- */

/** 正在把云端合并结果写回本地时置 true，避免触发一次多余的回推 */
let applying = false
let timer: ReturnType<typeof setTimeout> | null = null
let pushing = false
let dirty = false

async function pullMerge(): Promise<void> {
  const { user } = useAuth.getState()
  if (!user) return
  useAuth.setState({ syncStatus: 'syncing' })
  try {
    const p = useProgress.getState()
    const res = await api<{
      records: typeof p.records
      daily: typeof p.daily
      exams: typeof p.exams
      syncedAt: number
    }>('/api/sync', { records: p.records, daily: p.daily, exams: p.exams })
    applying = true
    try {
      useProgress.setState({
        records: res.records,
        daily: res.daily,
        exams: res.exams,
      })
    } finally {
      applying = false
    }
    useAuth.setState({ syncStatus: 'ok', lastSyncAt: res.syncedAt || Date.now() })
  } catch {
    useAuth.setState({ syncStatus: 'error' })
  }
}

async function push(force = false): Promise<void> {
  const { user } = useAuth.getState()
  if (!user) return
  if (pushing) {
    dirty = true
    return
  }
  pushing = true
  useAuth.setState({ syncStatus: 'syncing' })
  try {
    const p = useProgress.getState()
    const res = await api<{ syncedAt: number }>('/api/sync', {
      records: p.records,
      daily: p.daily,
      exams: p.exams,
      force,
    })
    useAuth.setState({ syncStatus: 'ok', lastSyncAt: res.syncedAt || Date.now() })
  } catch {
    useAuth.setState({ syncStatus: 'error' })
  } finally {
    pushing = false
    if (dirty) {
      dirty = false
      schedulePush()
    }
  }
}

/** 进度变化后的防抖推送（4s） */
export function schedulePush(): void {
  if (!useAuth.getState().user || applying) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    void push()
  }, 4000)
}

/** 清空数据后立即强制覆盖云端 */
export function forcePush(): void {
  if (!useAuth.getState().user) return
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  void push(true)
}

/**
 * 同步桥：挂在 AppShell 中一次性调用。
 * - 进度任何变化（登录状态下）→ 防抖推送云端
 */
export function useSyncBridge(): void {
  React.useEffect(() => {
    void useAuth.getState().init()
    const unsub = useProgress.subscribe(() => {
      if (!applying) schedulePush()
    })
    return unsub
  }, [])
}
