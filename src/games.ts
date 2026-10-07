import { useSyncExternalStore } from 'react'
import type { Color, State } from './board'
import { init } from './board'
import { apply, legal } from './rules'
import type { TC } from './timeControls'

export type Step = [number, number, number, number]
export type GameRecord = {
  id: string
  at: number
  mode: 'bot' | 'local'
  tc: TC | null
  winner: Color
  reason: 'end' | 'time'
  turns: number
  steps: Step[]
}

const STORE_KEY = 'uz_games'
const MAX = 100

function load(): GameRecord[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') as GameRecord[]
    return Array.isArray(raw)
      ? raw.filter(g => g && Array.isArray(g.steps) && (g.winner === 'w' || g.winner === 'b'))
      : []
  } catch {
    return []
  }
}

let games: GameRecord[] = load()
const listeners = new Set<() => void>()

function commit(next: GameRecord[]) {
  games = next
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(games))
  } catch {
    // ignore
  }
  listeners.forEach(f => f())
}

export const addGame = (g: GameRecord) => commit([g, ...games].slice(0, MAX))
export const deleteGame = (id: string) => commit(games.filter(g => g.id !== id))
export const clearGames = () => commit([])

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function useGames(): GameRecord[] {
  return useSyncExternalStore(subscribe, () => games)
}

const FILES = 'abcdefgh'
const sq = (r: number, c: number) => FILES[c] + (8 - r)

export type ReplayTurn = { mover: Color; text: string; upTo: number }

// Saqlangan yurishlarni boshidan qayta o'ynaydi
export function replay(steps: Step[]): { states: State[]; turns: ReplayTurn[] } {
  let s = init()
  const states: State[] = [s]
  const turns: ReplayTurn[] = []
  let parts: string[] = []
  let sep = '-'
  for (let i = 0; i < steps.length; i++) {
    const [fr, fc, tr, tcol] = steps[i]
    const m = legal(s, fr, fc).find(x => x.r === tr && x.c === tcol)
    if (!m) break
    if (s.chain === null) {
      parts = [sq(fr, fc)]
      sep = m.cap ? ':' : '-'
      turns.push({ mover: s.turn, text: '', upTo: 0 })
    }
    parts.push(sq(tr, tcol))
    const t = turns[turns.length - 1]
    t.text = parts.join(sep)
    s = apply(s, [fr, fc], m)
    t.upTo = i + 1
    states.push(s)
  }
  return { states, turns }
}