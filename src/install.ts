import { useEffect, useState } from 'react'

type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}

let deferred: InstallEvent | null = null
const listeners = new Set<() => void>()

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  deferred = e as InstallEvent
  listeners.forEach(f => f())
})

window.addEventListener('appinstalled', () => {
  deferred = null
  listeners.forEach(f => f())
})

export function useInstall() {
  const [, force] = useState(0)

  useEffect(() => {
    const f = () => force(n => n + 1)
    listeners.add(f)
    return () => {
      listeners.delete(f)
    }
  }, [])

  const standalone = window.matchMedia('(display-mode: standalone)').matches

  async function install() {
    if (!deferred) return
    const d = deferred
    deferred = null
    await d.prompt()
    await d.userChoice
    listeners.forEach(f => f())
  }

  return { canInstall: !!deferred && !standalone, install }
}