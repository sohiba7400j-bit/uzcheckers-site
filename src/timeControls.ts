export type TC = { min: number; inc: number }

export const GROUPS: { key: 'bullet' | 'blitz' | 'rapid'; items: TC[] }[] = [
  { key: 'bullet', items: [{ min: 1, inc: 0 }, { min: 1, inc: 1 }, { min: 2, inc: 1 }] },
  { key: 'blitz', items: [{ min: 3, inc: 0 }, { min: 3, inc: 2 }, { min: 5, inc: 0 }] },
  { key: 'rapid', items: [{ min: 10, inc: 0 }, { min: 10, inc: 5 }, { min: 15, inc: 10 }] },
]

export const label = (tc: TC, unit = 'min') =>
  tc.inc ? `${tc.min} + ${tc.inc}` : `${tc.min} ${unit}`

export function category(tc: TC): 'bullet' | 'blitz' | 'rapid' {
  const t = tc.min * 60 + tc.inc * 40
  return t < 180 ? 'bullet' : t < 600 ? 'blitz' : 'rapid'
}

const STORE_KEY = 'uz_tc'
const DEFAULT_TC: TC = { min: 10, inc: 0 }

export function loadTC(): TC | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw === 'none') return null
    if (raw) {
      const v = JSON.parse(raw) as Partial<TC>
      if (typeof v.min === 'number' && typeof v.inc === 'number') return { min: v.min, inc: v.inc }
    }
  } catch {
    // ignore
  }
  return DEFAULT_TC
}

export function saveTC(tc: TC | null) {
  try {
    localStorage.setItem(STORE_KEY, tc ? JSON.stringify(tc) : 'none')
  } catch {
    // ignore
  }
}

export function fmtClock(ms: number) {
  const t = Math.max(0, ms)
  if (t < 10000) return (t / 1000).toFixed(1)
  const s = Math.floor(t / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}