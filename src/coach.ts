import type { Board, State } from './board'
import { apply, legal } from './rules'

export type Step = [number, number, number, number]
export type Turn = { steps: Step[]; state: State; captures: number }

const FILES = 'abcdefgh'
export const sq = (r: number, c: number) => FILES[c] + (8 - r)

// Barcha to'liq yurishlar (ketma-ket urishlar bitta yurish hisoblanadi)
export function turnsOf(s: State): Turn[] {
  const side = s.turn
  const out: Turn[] = []
  const rec = (st: State, steps: Step[], caps: number) => {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        for (const m of legal(st, r, c)) {
          const n = apply(st, [r, c], m)
          const ns: Step[] = [...steps, [r, c, m.r, m.c]]
          const nc = caps + (m.cap ? 1 : 0)
          if (n.turn === side && n.chain) rec(n, ns, nc)
          else out.push({ steps: ns, state: n, captures: nc })
        }
  }
  rec(s, [], 0)
  return out
}

function evaluate(b: Board): number {
  let v = 0
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = b[r][c]
      if (!p) continue
      const adv = p.c === 'w' ? 7 - r : r
      const base = p.k ? 300 : 100 + adv * 4
      v += p.c === 'w' ? base : -base
    }
  return v
}

function search(s: State, depth: number, alpha: number, beta: number): number {
  const ts = turnsOf(s)
  if (!ts.length) return s.turn === 'w' ? -10000 - depth : 10000 + depth
  // majburiy urish bor bo'lsa, qidiruvni davom ettiramiz (noto'g'ri baho bermaslik uchun)
  if (depth <= 0 && (depth < -6 || ts[0].captures === 0)) return evaluate(s.board)
  if (s.turn === 'w') {
    let best = -Infinity
    for (const t of ts) {
      best = Math.max(best, search(t.state, depth - 1, alpha, beta))
      alpha = Math.max(alpha, best)
      if (alpha >= beta) break
    }
    return best
  }
  let best = Infinity
  for (const t of ts) {
    best = Math.min(best, search(t.state, depth - 1, alpha, beta))
    beta = Math.min(beta, best)
    if (alpha >= beta) break
  }
  return best
}

export function bestTurn(s: State, depth = 4, jitter = false): { turn: Turn; score: number } | null {
  const ts = turnsOf(s)
  if (!ts.length) return null
  let best = ts[0]
  let bestScore = s.turn === 'w' ? -Infinity : Infinity
  for (const t of ts) {
    const v = search(t.state, depth - 1, -Infinity, Infinity) + (jitter ? Math.random() * 6 : 0)
    if (s.turn === 'w' ? v > bestScore : v < bestScore) {
      bestScore = v
      best = t
    }
  }
  return { turn: best, score: bestScore }
}

const count = (b: Board, col: 'w' | 'b') => b.flat().filter(p => p && p.c === col).length

export type Review = { captured: number; threat: number; better: Turn | null }

// Foydalanuvchi yurishini baholaydi: before = yurish boshidagi holat, after = yurish tugagandagi holat
export function review(before: State, after: State): Review {
  const captured = count(before.board, 'b') - count(after.board, 'b')
  let threat = 0
  const whiteLeft = count(after.board, 'w')
  for (const t of turnsOf(after)) threat = Math.max(threat, whiteLeft - count(t.state.board, 'w'))
  const best = bestTurn(before, 4)
  const mine = search(after, 3, -Infinity, Infinity)
  const loss = best ? Math.max(0, best.score - mine) : 0
  return { captured, threat, better: loss >= 80 && best ? best.turn : null }
}

export function describe(before: State, t: Turn) {
  const first = t.steps[0]
  const last = t.steps[t.steps.length - 1]
  const path = [sq(first[0], first[1]), ...t.steps.map(x => sq(x[2], x[3]))].join(' → ')
  const p0 = before.board[first[0]][first[1]]
  const p1 = t.state.board[last[2]][last[3]]
  return {
    path,
    captures: t.captures,
    makesKing: !!p0 && !p0.k && !!p1 && p1.k,
    from: [first[0], first[1]] as [number, number],
    to: [first[2], first[3]] as [number, number],
  }
}