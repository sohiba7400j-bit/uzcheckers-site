import type { State, Move } from './board'
import { legal } from './rules'

export function botMove(s: State): { from: [number, number]; m: Move } | null {
  const all: { from: [number, number]; m: Move; score: number }[] = []
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      for (const m of legal(s, r, c)) {
        const p = s.board[r][c]!
        let score = Math.random()
        if (m.cap) score += 10
        if (!p.k && m.r === (p.c === 'w' ? 0 : 7)) score += 5
        if (!p.k) score += (p.c === 'b' ? m.r : 7 - m.r) * 0.3
        all.push({ from: [r, c], m, score })
      }
  if (!all.length) return null
  all.sort((a, b) => b.score - a.score)
  return all[0]
}