import type { Board, Color, Move, State } from './board'
import { key } from './board'
import { jumps, steps } from './moves'

function mustCapture(b: Board, t: Color) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (b[r][c]?.c === t && jumps(b, r, c, new Set()).length) return true
  return false
}

export function legal(s: State, r: number, c: number): Move[] {
  const p = s.board[r][c]
  if (!p || p.c !== s.turn) return []
  const g = new Set(s.ghosts)
  if (s.chain) return s.chain[0] === r && s.chain[1] === c ? jumps(s.board, r, c, g) : []
  if (mustCapture(s.board, s.turn)) return jumps(s.board, r, c, g)
  return steps(s.board, r, c)
}

export function hasMoves(b: Board, t: Color) {
  const s: State = { board: b, turn: t, chain: null, ghosts: [] }
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) if (legal(s, r, c).length) return true
  return false
}

export function apply(s: State, from: [number, number], m: Move): State {
  const board = s.board.map(row => row.slice())
  const p = { ...board[from[0]][from[1]]! }
  board[from[0]][from[1]] = null
  if ((p.c === 'w' && m.r === 0) || (p.c === 'b' && m.r === 7)) p.k = true
  board[m.r][m.c] = p
  if (m.cap) {
    const ghosts = [...s.ghosts, key(m.cap[0], m.cap[1])]
    if (jumps(board, m.r, m.c, new Set(ghosts)).length)
      return { ...s, board, ghosts, chain: [m.r, m.c] }
    for (const g of ghosts) {
      const [y, x] = g.split(',').map(Number)
      board[y][x] = null
    }
  }
  return { board, turn: s.turn === 'w' ? 'b' : 'w', chain: null, ghosts: [] }
}