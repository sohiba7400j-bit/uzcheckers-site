import { useEffect, useState } from 'react'
import './App.css'
import './puzzles.css'
import type { Board, State } from './board'
import { key } from './board'
import { useLang } from './i18n'
import { apply, legal } from './rules'
import { PUZZLES } from './puzzleData'
import type { Puzzle } from './puzzleData'

const FILES = 'abcdefgh'
const toRC = (a: string): [number, number] => [8 - Number(a[1]), FILES.indexOf(a[0])]

function build(p: Puzzle): State {
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null))
  const put = (list: string[] | undefined, c: 'w' | 'b', k: boolean) => {
    for (const a of list ?? []) {
      const [r, col] = toRC(a)
      board[r][col] = { c, k }
    }
  }
  put(p.white, 'w', false)
  put(p.whiteKings, 'w', true)
  put(p.black, 'b', false)
  return { board, turn: 'w', chain: null, ghosts: [] }
}

const TEXT = {
  en: {
    puzzle: 'Puzzle',
    turn: 'White to move',
    capture: 'Capture as many pieces as you can',
    shot: 'Sacrifice a piece, then win more',
    wrong: 'Not that one. Try again.',
    done: 'Solved! 🎉',
    hint: 'Hint',
    restart: 'Restart',
    next: 'Next puzzle',
  },
  uz: {
    puzzle: 'Topishmoq',
    turn: 'Oq yuradi',
    capture: "Imkon qadar ko'p dona uring",
    shot: "Dona qurbon qiling, keyin ko'proq oling",
    wrong: "Bu emas. Yana urinib ko'ring.",
    done: 'Yechildi! 🎉',
    hint: 'Maslahat',
    restart: 'Qaytadan',
    next: 'Keyingi topishmoq',
  },
  ru: {
    puzzle: 'Задача',
    turn: 'Ход белых',
    capture: 'Возьмите как можно больше шашек',
    shot: 'Пожертвуйте шашку, затем выиграйте больше',
    wrong: 'Не то. Попробуйте ещё.',
    done: 'Решено! 🎉',
    hint: 'Подсказка',
    restart: 'Заново',
    next: 'Следующая задача',
  },
}

export function Puzzles() {
  const { lang, t } = useLang()
  const L = TEXT[(lang in TEXT ? lang : 'en') as keyof typeof TEXT]
  const [idx, setIdx] = useState(0)
  const [s, setS] = useState<State>(() => build(PUZZLES[0]))
  const [step, setStep] = useState(0)
  const [sel, setSel] = useState<[number, number] | null>(null)
  const [status, setStatus] = useState<'play' | 'wrong' | 'done'>('play')
  const [hint, setHint] = useState(false)
  const [solved, setSolved] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('uz_solved') ?? '[]') as number[]
    } catch {
      return []
    }
  })

  const puzzle = PUZZLES[idx]
  const active = s.chain ?? sel
  const targets = active ? legal(s, active[0], active[1]) : []
  const hintSq =
    hint && status === 'play' && s.turn === 'w' && step < puzzle.solution.length
      ? toRC(puzzle.solution[step][0])
      : null

  function open(i: number) {
    setIdx(i)
    setS(build(PUZZLES[i]))
    setStep(0)
    setSel(null)
    setStatus('play')
    setHint(false)
  }

  function finish() {
    setStatus('done')
    const next = solved.includes(puzzle.id) ? solved : [...solved, puzzle.id]
    setSolved(next)
    try {
      localStorage.setItem('uz_solved', JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (status !== 'play' || step >= puzzle.solution.length || s.turn !== 'b') return
    const timer = setTimeout(() => {
      const [f, to] = puzzle.solution[step]
      const from = toRC(f)
      const dest = toRC(to)
      const m = legal(s, from[0], from[1]).find(x => x.r === dest[0] && x.c === dest[1])
      if (m) {
        setS(apply(s, from, m))
        if (step + 1 >= puzzle.solution.length) finish()
        else setStep(step + 1)
      }
    }, 600)
    return () => clearTimeout(timer)
  })

  function click(r: number, c: number) {
    if (status !== 'play' || s.turn !== 'w') return
    const m = targets.find(x => x.r === r && x.c === c)
    if (m && active) {
      const ef = toRC(puzzle.solution[step][0])
      const et = toRC(puzzle.solution[step][1])
      const good = ef[0] === active[0] && ef[1] === active[1] && et[0] === r && et[1] === c
      if (good) {
        setS(apply(s, active, m))
        setSel(null)
        setHint(false)
        if (step + 1 >= puzzle.solution.length) finish()
        else setStep(step + 1)
      } else {
        setStatus('wrong')
        setSel(null)
        setTimeout(() => open(idx), 1200)
      }
      return
    }
    if (s.chain) return
    setSel(legal(s, r, c).length ? [r, c] : null)
  }

  return (
    <div className="app">
      <h1>{t('puzzles')}</h1>
      <div className="pz-list">
        {PUZZLES.map((p, i) => (
          <button
            key={p.id}
            className={`${i === idx ? 'on' : ''} ${solved.includes(p.id) ? 'done' : ''}`}
            onClick={() => open(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p className="pz-goal">
        {L.puzzle} {idx + 1} · {puzzle.kind === 'capture' ? L.capture : L.shot}
      </p>
      <p>{L.turn}</p>
      <div className="board">
        {s.board.map((row, r) =>
          row.map((p, c) => {
            const dark = (r + c) % 2 === 1
            const isSel = active && active[0] === r && active[1] === c
            const isT = targets.some(x => x.r === r && x.c === c)
            const isHint = hintSq && hintSq[0] === r && hintSq[1] === c
            return (
              <div
                key={key(r, c)}
                className={`cell ${dark ? 'dark' : 'light'}${isSel ? ' sel' : ''}${isHint ? ' hint' : ''}`}
                onClick={() => click(r, c)}
              >
                {isT && <span className="dot" />}
                {p && <div className={`piece ${p.c}`}>{p.k ? '♛' : ''}</div>}
              </div>
            )
          })
        )}
      </div>
      <p className={`pz-msg ${status === 'done' ? 'ok' : 'bad'}`}>
        {status === 'done' ? L.done : status === 'wrong' ? L.wrong : ''}
      </p>
      <div className="pz-actions">
        <button className="gray" onClick={() => setHint(true)}>{L.hint}</button>
        <button className="gray" onClick={() => open(idx)}>{L.restart}</button>
        {status === 'done' && idx < PUZZLES.length - 1 && (
          <button onClick={() => open(idx + 1)}>{L.next}</button>
        )}
      </div>
    </div>
  )
}