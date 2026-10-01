import { useSyncExternalStore } from 'react'
import { dict, LANGS } from './locales'
import type { Keys, Lang } from './locales'

export { LANGS }
export type { Keys, Lang }

const codes: string[] = LANGS.map(l => l.code)

function detect(): Lang {
  try {
    const saved = localStorage.getItem('uz_lang')
    if (saved && codes.includes(saved)) return saved as Lang
  } catch {
    // ignore
  }
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const p of prefs) {
    const code = p.slice(0, 2).toLowerCase()
    if (codes.includes(code)) return code as Lang
  }
  return 'en'
}

function apply(l: Lang) {
  document.documentElement.lang = l
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
}

let current: Lang = detect()
apply(current)
const listeners = new Set<() => void>()

export function setLang(l: Lang) {
  current = l
  apply(l)
  try {
    localStorage.setItem('uz_lang', l)
  } catch {
    // ignore
  }
  listeners.forEach(f => f())
}

export function useLang() {
  const lang = useSyncExternalStore(
    cb => {
      listeners.add(cb)
      return () => { listeners.delete(cb) }
    },
    () => current,
  )
  return { lang, t: (k: Keys) => dict[lang][k] }
}