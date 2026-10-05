import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './learn.css'
import type { State } from './board'
import { init, key } from './board'
import { bestTurn, describe, review, turnsOf } from './coach'
import { useLang } from './i18n'
import { fmt, TEXT } from './learnText'
import type { LearnText } from './learnText'
import { apply, legal } from './rules'

type MsgKey =
  | 'welcome'
  | 'captured'
  | 'threat'
  | 'better'
  | 'good'
  | 'hintCapture'
  | 'hintKing'
  | 'hintSafe'
type Msg = { k: MsgKey; v?: Record<string, string | number> }

const KIND: Record<MsgKey, string> = {
  welcome: 'tip',
  captured: 'good',
  threat: 'warn',
  better: 'tip',
  good: 'good',
  hintCapture: 'tip',
  hintKing: 'tip',
  hintSafe: 'tip',
}

export function Learn() {
  const { lang } = useLang()
  const L: LearnText = TEXT[(lang in TEXT ? lang : 'en') as keyof typeof TEXT]
  const [s, setS] = useState<State>(init)
  const [start, setStart] = useState<State>(init)
  const [sel, setSel] = useState<[number, number] | null>(null)
  const [hint, setHint] = useState<{ from: [number, number]; to: [number, number] } | null>(null)
  const [log, setLog] = useState<Msg[]>([{ k: 'welcome' }])
  const [showRules, setShowRules] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  const turns = useMemo(() => turnsOf(s), [s])
  const winner = !s.chain && turns.length === 0 ? (s.turn === 'w' ? 'b' : 'w') : null
  const forced = s.turn === 'w' && turns.some(t => t.captures > 0)
  const active = s.chain ?? sel
  const targets = active ? legal(s, active[0], active[1]) : []

  useEffect(() => {
    if (winner || s.turn !== 'b') return
    const timer = setTimeout(() => {
      const b = bestTurn(s, 2, true)
      if (b) {
        setS(b.turn.state)
        setStart(b.turn.state)
      }
    }, 700)
    return () => clearTimeout(timer)
  }, [s, winner])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [log])

  function click(r: number, c: number) {
    if (winner || s.turn !== 'w') return
    const m = targets.find(x => x.r === r && x.c === c)
    if (m && active) {
      const n = apply(s, active, m)
      setS(n)
      setSel(null)
      setHint(null)
      if (n.turn === 'b') {
        const rv = review(start, n)
        const add: Msg[] = []
        if (rv.captured > 0) add.push({ k: 'captured', v: { n: rv.captured } })
        if (rv.threat > 0) add.push({ k: 'threat', v: { n: rv.threat } })
        if (rv.better) add.push({ k: 'better', v: { move: describe(start, rv.better).path } })
        else if (rv.threat === 0) add.push({ k: 'good' })
        setLog(old => [...old, ...add])
      }
      return
    }
    if (s.chain) return
    setSel(legal(s, r, c).length ? [r, c] : null)
  }

  function showHint() {
    if (winner || s.turn !== 'w') return
    const b = bestTurn(s, 4)
    if (!b) return
    const d = describe(s, b.turn)
    setHint({ from: d.from, to: d.to })
    const k: MsgKey = d.captures > 0 ? 'hintCapture' : d.makesKing ? 'hintKing' : 'hintSafe'
    setLog(old => [...old, { k, v: { n: d.captures, move: d.path } }])
  }

  function restart() {
    const g = init()
    setS(g)
    setStart(g)
    setSel(null)
    setHint(null)
    setLog([{ k: 'welcome' }])
  }

  const status = winner
    ? winner === 'w'
      ? L.win
      : L.lose
    : s.turn === 'b'
      ? L.thinking
      : forced
        ? L.forced
        : L.yourMove

  return (
    <div className="learn">
      <div className="learn-board">
        <h1>{L.title}</h1>
        <p className="learn-status">{status}</p>
        <div className="board">
          {s.board.map((row, r) =>
            row.map((p, c) => {
              const dark = (r + c) % 2 === 1
              const isSel = active && active[0] === r && active[1] === c
              const isT = targets.some(x => x.r === r && x.c === c)
              const isFrom = hint && hint.from[0] === r && hint.from[1] === c
              const isTo = hint && hint.to[0] === r && hint.to[1] === c
              return (
                <div
                  key={key(r, c)}
                  className={`cell ${dark ? 'dark' : 'light'}${isSel ? ' sel' : ''}${isFrom ? ' hint' : ''}${isTo ? ' hint2' : ''}`}
                  onClick={() => click(r, c)}
                >
                  {isT && <span className="dot" />}
                  {p && <div className={`piece ${p.c}`}>{p.k ? '♛' : ''}</div>}
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="coach">
        <h2>{L.coach}</h2>
        <div className="coach-btns">
          <button onClick={showHint}>{L.hint}</button>
          <button className="gray" onClick={() => setShowRules(v => !v)}>{L.rules}</button>
          <button className="gray" onClick={restart}>{L.newGame}</button>
        </div>
        {showRules && (
          <div>
            <b>{L.rulesTitle}</b>
            <ol className="coach-rules">
              {L.rulesList.map(x => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </div>
        )}
        <div className="coach-log" ref={logRef}>
          {log.map((m, i) => (
            <div key={i} className={`coach-msg ${KIND[m.k]}`}>
              {fmt(L[m.k], m.v)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}