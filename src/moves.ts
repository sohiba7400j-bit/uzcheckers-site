import type { Board, Move } from './board'
import { DIRS, inB, key } from './board'

export function jumps(b: Board, r: number, c: number, ghosts: Set<string>): Move[] {
  const p = b[r][c]
  if (!p) return []
  const res: Move[] = []
  for (const [dr, dc] of DIRS) {
    let y = r + dr, x = c + dc
    if (p.k) while (inB(y, x) && !b[y][x]) { y += dr; x += dc }
    if (!inB(y, x)) continue
    const t = b[y][x]
    if (!t || t.c === p.c || ghosts.has(key(y, x))) continue
    let ly = y + dr, lx = x + dc
    while (inB(ly, lx) && !b[ly][lx]) {
      res.push({ r: ly, c: lx, cap: [y, x] })
      if (!p.k) break
      ly += dr; lx += dc
    }
  }
  return res
}

export function steps(b: Board, r: number, c: number): Move[] {
  const p = b[r][c]
  if (!p) return []
  const res: Move[] = []
  for (const [dr, dc] of DIRS) {
    if (!p.k && dr !== (p.c === 'w' ? -1 : 1)) continue
    let y = r + dr, x = c + dc
    while (inB(y, x) && !b[y][x]) {
      res.push({ r: y, c: x })
      if (!p.k) break
      y += dr; x += dc
    }
  }
  return res
}