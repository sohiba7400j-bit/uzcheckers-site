import { useEffect, useState } from 'react'
import './App.css'
import type { Color, State } from './board'
import { init, key } from './board'
import { botMove } from './bot'
import { apply, hasMoves, legal } from './rules'

export function Game({ vsBot = false }: { vsBot?: boolean }) {
  const [s, setS] = useState<State>(init)
  const [sel, setSel] = useState<[number, number] | null>(null)
  const active = s.chain ?? sel
  const targets = active ? legal(s, active[0], active[1]) : []
  const winner: Color | null =
    !s.chain && !hasMoves(s.board, s.turn) ? (s.turn === 'w' ? 'b' : 'w') : null

  useEffect(() => {
    if (!vsBot || winner || s.turn !== 'b') return
    const t = setTimeout(() => {
      const b = botMove(s)
      if (b) setS(apply(s, b.from, b.m))
    }, 600)
    return () => clearTimeout(t)
  }, [s, vsBot, winner])

  function click(r: number, c: number) {
    if (winner || (vsBot && s.turn === 'b')) return
    const m = targets.find(t => t.r === r && t.c === c)
    if (m && active) { setS(apply(s, active, m)); setSel(null); return }
    if (s.chain) return
    setSel(legal(s, r, c).length ? [r, c] : null)
  }

  return (
    <div className="app">
      <h1>{vsBot ? 'Kompyuter bilan' : "O'ynash"}</h1>
      <p>
        {winner
          ? winner === 'w' ? "Oq g'alaba qozondi!" : "Qora g'alaba qozondi!"
          : s.turn === 'w' ? 'Oq yuradi' : 'Qora yuradi'}
      </p>
      <div className="board">
        {s.board.map((row, r) =>
          row.map((p, c) => {
            const dark = (r + c) % 2 === 1
            const isSel = active && active[0] === r && active[1] === c
            const isT = targets.some(t => t.r === r && t.c === c)
            return (
              <div
                key={key(r, c)}
                className={`cell ${dark ? 'dark' : 'light'}${isSel ? ' sel' : ''}`}
                onClick={() => click(r, c)}
              >
                {isT && <span className="dot" />}
                {p && <div className={`piece ${p.c}`}>{p.k ? '♛' : ''}</div>}
              </div>
            )
          })
        )}
      </div>
      <button onClick={() => { setS(init()); setSel(null) }}>Yangi o'yin</button>
    </div>
  )
}