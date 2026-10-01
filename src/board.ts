export type Color = 'w' | 'b'
export type Piece = { c: Color; k: boolean }
export type Board = (Piece | null)[][]
export type Move = { r: number; c: number; cap?: [number, number] }
export type State = {
  board: Board
  turn: Color
  chain: [number, number] | null
  ghosts: string[]
}

export const DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
export const inB = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8
export const key = (r: number, c: number) => `${r},${c}`

function newBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () => Array(8).fill(null))
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if ((r + c) % 2 === 1) {
        if (r < 3) b[r][c] = { c: 'b', k: false }
        if (r > 4) b[r][c] = { c: 'w', k: false }
      }
  return b
}

export const init = (): State => ({ board: newBoard(), turn: 'w', chain: null, ghosts: [] })