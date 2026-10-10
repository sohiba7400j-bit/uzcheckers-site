import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type OAuthProvider = 'google' | 'facebook'

// Provayder sozlangach, .env.local va Netlify'da VITE_AUTH_GOOGLE=1 / VITE_AUTH_FACEBOOK=1 qo'yiladi
export const PROVIDERS_ON: Record<OAuthProvider, boolean> = {
  google: import.meta.env.VITE_AUTH_GOOGLE === '1',
  facebook: import.meta.env.VITE_AUTH_FACEBOOK === '1',
}

// Telegram bot nomi (@siz), faqat Netlify'da VITE_TELEGRAM_BOT sifatida qo'yiladi
export const TELEGRAM_BOT: string = (import.meta.env.VITE_TELEGRAM_BOT as string | undefined) ?? ''

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(!!supabase)

  useEffect(() => {
    if (!supabase) return
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      alive = false
      data.subscription.unsubscribe()
    }
  }, [])

  return { user, loading, configured: !!supabase }
}

export async function signInGuest(): Promise<string | null> {
  if (!supabase) return 'not-configured'
  const { error } = await supabase.auth.signInAnonymously()
  return error ? error.message : null
}

export async function signInOAuth(provider: OAuthProvider): Promise<string | null> {
  if (!supabase) return 'not-configured'
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  })
  return error ? error.message : null
}

export async function linkOAuth(provider: OAuthProvider): Promise<string | null> {
  if (!supabase) return 'not-configured'
  const { error } = await supabase.auth.linkIdentity({
    provider,
    options: { redirectTo: window.location.origin },
  })
  return error ? error.message : null
}

// Telegram: imzoni serverimiz tekshiradi, keyin Supabase sessiyasi olinadi
export async function signInTelegram(tg: Record<string, unknown>): Promise<string | null> {
  if (!supabase) return 'not-configured'
  try {
    const res = await fetch('/.netlify/functions/telegram-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tg),
    })
    const j = (await res.json()) as { token_hash?: string; type?: string; error?: string }
    if (!res.ok || !j.token_hash) return j.error ?? 'telegram-error'
    const { error } = await supabase.auth.verifyOtp({
      token_hash: j.token_hash,
      type: j.type === 'email' ? 'email' : 'magiclink',
    })
    return error ? error.message : null
  } catch (e) {
    return e instanceof Error ? e.message : 'network-error'
  }
}

export async function signOut() {
  await supabase?.auth.signOut()
}

export function displayName(user: User, guest = 'Guest'): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const full = meta?.full_name ?? meta?.name
  if (typeof full === 'string' && full) return full
  if (user.email) return user.email.split('@')[0]
  return `${guest} ${user.id.slice(0, 4)}`
}

export function avatarOf(user: User): string | null {
  const meta = user.user_metadata as Record<string, unknown> | undefined
  return typeof meta?.avatar_url === 'string' ? meta.avatar_url : null
}