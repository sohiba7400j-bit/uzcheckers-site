import { useSyncExternalStore } from 'react'

export type Prefs = { light: string; dark: string; pw: string; pb: string }

export const DEFAULTS: Prefs = {
  light: '#f0d9b5',
  dark: '#b58863',
  pw: '#f5f5f5',
  pb: '#222222',
}

export const BOARD_PRESETS: { light: string; dark: string }[] = [
  { light: '#f0d9b5', dark: '#b58863' },
  { light: '#eeeed2', dark: '#769656' },
  { light: '#dee3e6', dark: '#8ca2ad' },
  { light: '#d9d9d9', dark: '#7a7a7a' },
  { light: '#e6e0f0', dark: '#8877b3' },
  { light: '#f7e1e1', dark: '#c27a7a' },
]

export const PIECE_PRESETS: { pw: string; pb: string }[] = [
  { pw: '#f5f5f5', pb: '#222222' },
  { pw: '#fff3d6', pb: '#4a2c1a' },
  { pw: '#d94a4a', pb: '#222222' },
  { pw: '#4a90d9', pb: '#f0a030' },
  { pw: '#58b368', pb: '#6b4aa8' },
  { pw: '#e6c34a', pb: '#1f2d5a' },
]

const STORE_KEY = 'uz_settings'
const HEX = /^#[0-9a-fA-F]{6}$/

function load(): Prefs {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') as Partial<Prefs>
    const pick = (v: unknown, d: string) => (typeof v === 'string' && HEX.test(v) ? v : d)
    return {
      light: pick(raw.light, DEFAULTS.light),
      dark: pick(raw.dark, DEFAULTS.dark),
      pw: pick(raw.pw, DEFAULTS.pw),
      pb: pick(raw.pb, DEFAULTS.pb),
    }
  } catch {
    return { ...DEFAULTS }
  }
}

function brightness(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

const ink = (hex: string) => (brightness(hex) > 0.55 ? '#7a5c3a' : '#f0d9b5')

function applyToPage(s: Prefs) {
  const root = document.documentElement.style
  root.setProperty('--sq-light', s.light)
  root.setProperty('--sq-dark', s.dark)
  root.setProperty('--pc-w', s.pw)
  root.setProperty('--pc-b', s.pb)
  root.setProperty('--pc-w-ink', ink(s.pw))
  root.setProperty('--pc-b-ink', ink(s.pb))
}

let current: Prefs = load()
applyToPage(current)
const listeners = new Set<() => void>()

export function setPrefs(patch: Partial<Prefs>) {
  current = { ...current, ...patch }
  applyToPage(current)
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(current))
  } catch {
    // ignore
  }
  listeners.forEach(f => f())
}

export function resetPrefs() {
  setPrefs({ ...DEFAULTS })
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    cb => {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    () => current,
  )
}