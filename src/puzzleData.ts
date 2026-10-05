export type Puzzle = {
  id: number
  kind: 'capture' | 'shot'
  white?: string[]
  whiteKings?: string[]
  black?: string[]
  solution: [string, string][]
}

export const PUZZLES: Puzzle[] = [
  { id: 1, kind: 'capture', white: ['c3'], black: ['d4'], solution: [['c3', 'e5']] },
  { id: 2, kind: 'capture', white: ['c3'], black: ['d4', 'f6'], solution: [['c3', 'e5'], ['e5', 'g7']] },
  { id: 3, kind: 'capture', white: ['c1'], black: ['d2', 'f4', 'f6', 'd6'], solution: [['c1', 'e3'], ['e3', 'g5'], ['g5', 'e7'], ['e7', 'c5']] },
  { id: 4, kind: 'capture', whiteKings: ['a1'], black: ['d4', 'g5'], solution: [['a1', 'f6'], ['f6', 'h4']] },
  { id: 5, kind: 'shot', white: ['g3', 'h4', 'c3'], black: ['c7', 'g7', 'e3'], solution: [['g3', 'f4'], ['e3', 'g5'], ['h4', 'f6'], ['f6', 'h8']] },
  { id: 6, kind: 'shot', white: ['d2', 'f2', 'b6', 'g1'], black: ['h6', 'f4', 'd4'], solution: [['f2', 'e3'], ['d4', 'f2'], ['g1', 'e3'], ['e3', 'g5']] },
  { id: 7, kind: 'shot', white: ['c3', 'a3', 'c1', 'b4'], black: ['f4', 'e3', 'c7'], solution: [['c3', 'd4'], ['e3', 'c5'], ['b4', 'd6'], ['d6', 'b8']] },
  { id: 8, kind: 'shot', white: ['b2', 'g1', 'c1'], black: ['f6', 'f4', 'b4'], solution: [['b2', 'c3'], ['b4', 'd2'], ['c1', 'e3'], ['e3', 'g5'], ['g5', 'e7']] },
  { id: 9, kind: 'shot', white: ['e1', 'c3', 'd2', 'e3'], black: ['e7', 'c5', 'e5', 'a5'], solution: [['c3', 'd4'], ['e5', 'c3'], ['d2', 'b4'], ['b4', 'd6'], ['d6', 'f8']] },
  { id: 10, kind: 'shot', white: ['g5', 'h6', 'h4'], black: ['h8', 'd6', 'a3', 'b6', 'a5'], solution: [['h6', 'g7'], ['h8', 'f6'], ['g5', 'e7'], ['e7', 'c5'], ['c5', 'a7']] },
  { id: 11, kind: 'shot', white: ['d6', 'h6', 'e3'], black: ['g7', 'g3', 'f8', 'b4'], solution: [['d6', 'e7'], ['f8', 'd6'], ['h6', 'f8'], ['f8', 'c5'], ['c5', 'a3']] },
]