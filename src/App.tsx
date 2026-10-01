import { useEffect, useState } from 'react'
import './App.css'
import type { Color, State } from './board'
import { init, key } from './board'
import { botMove } from './bot'
import { useLang } from './i18n'
import { apply, hasMoves, legal } from './rules'

export function Game({ vsBot = false }: { vsBot?: boolean }) {
  const { t } = useLang()
  const [s, setS] = useState<State>(init)
  const [sel, setSel] = useState<[number, number] | null>(null)
  const active = s.chain ?? sel
  const targets = active ? legal(s, active[0], active[1]) : []
  const winner: Color | null =
    !s.chain && !hasMoves(s.board, s.turn) ? (s.turn === 'w' ? 'b' : 'w') : null

  useEffect(() => {
    if (!vsBot || winner || s.turn !== 'b') return
    const timer = setTimeout(() => {
      const b = botMove(s)
      if (b) setS(apply(s, b.from, b.m))
    }, 600)
    return () => clearTimeout(timer)
  }, [s, vsBot, winner])

  function click(r: number, c: number) {
    if (winner || (vsBot && s.turn === 'b')) return
    const m = targets.find(x => x.r === r && x.c === c)
    if (m && active) { setS(apply(s, active, m)); setSel(null); return }
    if (s.chain) return
    setSel(legal(s, r, c).length ? [r, c] : null)
  }

  return (
    <div className="app">
      <h1>{vsBot ? t('vsBotTitle') : t('play')}</h1>
      <p>
        {winner
          ? winner === 'w' ? t('whiteWins') : t('blackWins')
          : s.turn === 'w' ? t('whiteMoves') : t('blackMoves')}
      </p>
      <div className="board">
        {s.board.map((row, r) =>
          row.map((p, c) => {
            const dark = (r + c) % 2 === 1
            const isSel = active && active[0] === r && active[1] === c
            const isT = targets.some(x => x.r === r && x.c === c)
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
      <button onClick={() => { setS(init()); setSel(null) }}>{t('newGame')}</button>
    </div>
  )
}