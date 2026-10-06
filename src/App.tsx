import { useEffect, useRef, useState } from 'react'
import './App.css'
import './newgame.css'
import type { Color, State } from './board'
import { init, key } from './board'
import { botMove } from './bot'
import { useLang } from './i18n'
import { NewGame } from './NewGame'
import { apply, hasMoves, legal } from './rules'
import { fmtClock, loadTC } from './timeControls'
import type { TC } from './timeControls'
import { TIME_TEXT } from './timeText'

function Clock({ ms, on }: { ms: number; on: boolean }) {
  return <div className={`clock${on ? ' on' : ''}${ms < 10000 ? ' low' : ''}`}>{fmtClock(ms)}</div>
}

function Match({ vsBot, tc, onNew }: { vsBot: boolean; tc: TC | null; onNew: () => void }) {
  const { t, lang } = useLang()
  const T = TIME_TEXT[(lang in TIME_TEXT ? lang : 'en') as keyof typeof TIME_TEXT]
  const [s, setS] = useState<State>(init)
  const [sel, setSel] = useState<[number, number] | null>(null)
  const startMs = tc ? tc.min * 60000 : 0
  const [clock, setClock] = useState<{ w: number; b: number }>({ w: startMs, b: startMs })
  const [moves, setMoves] = useState(0)
  const [flag, setFlag] = useState<Color | null>(null)
  const lastTick = useRef(Date.now())

  const active = s.chain ?? sel
  const targets = active ? legal(s, active[0], active[1]) : []
  const noMoves: Color | null = !s.chain && !hasMoves(s.board, s.turn) ? (s.turn === 'w' ? 'b' : 'w') : null
  const winner: Color | null = flag ? (flag === 'w' ? 'b' : 'w') : noMoves
  const running = !!tc && moves >= 1 && !winner

  function turnDone(mover: Color) {
    setMoves(m => m + 1)
    if (tc && tc.inc) setClock(c => ({ ...c, [mover]: c[mover] + tc.inc * 1000 }))
  }

  useEffect(() => {
    if (!running) return
    lastTick.current = Date.now()
    const id = setInterval(() => {
      const now = Date.now()
      const dt = now - lastTick.current
      lastTick.current = now
      setClock(c => ({ ...c, [s.turn]: Math.max(0, c[s.turn] - dt) }))
    }, 100)
    return () => clearInterval(id)
  }, [running, s.turn])

  useEffect(() => {
    if (tc && !flag && (clock.w <= 0 || clock.b <= 0)) setFlag(clock.w <= 0 ? 'w' : 'b')
  }, [clock, tc, flag])

  useEffect(() => {
    if (!vsBot || winner || s.turn !== 'b') return
    const timer = setTimeout(() => {
      const b = botMove(s)
      if (b) {
        const n = apply(s, b.from, b.m)
        setS(n)
        if (n.turn !== s.turn) turnDone('b')
      }
    }, 500)
    return () => clearTimeout(timer)
  })

  function click(r: number, c: number) {
    if (winner || (vsBot && s.turn === 'b')) return
    const m = targets.find(x => x.r === r && x.c === c)
    if (m && active) {
      const n = apply(s, active, m)
      setS(n)
      setSel(null)
      if (n.turn !== s.turn) turnDone(s.turn)
      return
    }
    if (s.chain) return
    setSel(legal(s, r, c).length ? [r, c] : null)
  }

  const status = flag
    ? flag === 'w'
      ? T.blackWinsTime
      : T.whiteWinsTime
    : winner
      ? winner === 'w'
        ? t('whiteWins')
        : t('blackWins')
      : s.turn === 'w'
        ? t('whiteMoves')
        : t('blackMoves')

  return (
    <div className="app">
      <h1>{vsBot ? t('vsBotTitle') : t('play')}</h1>
      <p>{status}</p>
      {tc && <Clock ms={clock.b} on={running && s.turn === 'b'} />}
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
      {tc && <Clock ms={clock.w} on={running && s.turn === 'w'} />}
      <button onClick={onNew}>{t('newGame')}</button>
    </div>
  )
}

export function Game({ vsBot = false }: { vsBot?: boolean }) {
  const [phase, setPhase] = useState<'setup' | 'play'>('setup')
  const [tc, setTc] = useState<TC | null>(loadTC)
  const [gid, setGid] = useState(0)

  if (phase === 'setup') {
    return (
      <div className="app">
        <NewGame
          initial={tc}
          onStart={x => {
            setTc(x)
            setGid(g => g + 1)
            setPhase('play')
          }}
        />
      </div>
    )
  }
  return <Match key={gid} vsBot={vsBot} tc={tc} onNew={() => setPhase('setup')} />
}