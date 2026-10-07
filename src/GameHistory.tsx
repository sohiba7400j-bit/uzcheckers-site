import { useMemo, useState } from 'react'
import './App.css'
import './gamehistory.css'
import { key } from './board'
import { clearGames, deleteGame, replay, useGames } from './games'
import type { GameRecord } from './games'
import { useLang } from './i18n'
import { label } from './timeControls'
import { TIME_TEXT } from './timeText'

const TEXT = {
  en: {
    title: 'Game history',
    empty: 'No games yet. Finished games will appear here.',
    note: 'Games are saved in this browser. Online games will be saved to your account once accounts are added.',
    vsComputer: 'Vs computer',
    twoPlayers: 'Two players',
    whiteWon: 'White won',
    blackWon: 'Black won',
    onTime: 'on time',
    moves: 'moves',
    open: 'Replay',
    del: 'Delete',
    clear: 'Clear history',
    back: 'Back',
    noClock: 'No clock',
  },
  uz: {
    title: "O'yinlar tarixi",
    empty: "Hali o'yin yo'q. Tugagan o'yinlar shu yerda paydo bo'ladi.",
    note: "O'yinlar shu brauzerda saqlanadi. Hisoblar qo'shilgach, onlayn o'yinlar akkauntingizga saqlanadi.",
    vsComputer: 'Kompyuterga qarshi',
    twoPlayers: 'Ikki kishi',
    whiteWon: 'Oq yutdi',
    blackWon: 'Qora yutdi',
    onTime: "vaqt bo'yicha",
    moves: 'yurish',
    open: "Ko'rish",
    del: "O'chirish",
    clear: 'Tarixni tozalash',
    back: 'Orqaga',
    noClock: 'Soatsiz',
  },
  ru: {
    title: 'История игр',
    empty: 'Игр пока нет. Завершённые партии появятся здесь.',
    note: 'Партии хранятся в этом браузере. Онлайн-партии будут сохраняться в аккаунте, когда появятся аккаунты.',
    vsComputer: 'Против компьютера',
    twoPlayers: 'Два игрока',
    whiteWon: 'Победили белые',
    blackWon: 'Победили чёрные',
    onTime: 'по времени',
    moves: 'ходов',
    open: 'Смотреть',
    del: 'Удалить',
    clear: 'Очистить историю',
    back: 'Назад',
    noClock: 'Без часов',
  },
}

type HText = (typeof TEXT)['en']

export const historyTitle = (lang: string) =>
  (lang in TEXT ? TEXT[lang as keyof typeof TEXT] : TEXT.en).title

function Replay({ g, L, onBack }: { g: GameRecord; L: HText; onBack: () => void }) {
  const rp = useMemo(() => replay(g.steps), [g])
  const [p, setP] = useState(0)
  const total = rp.turns.length
  const upTo = p === 0 ? 0 : rp.turns[p - 1].upTo
  const s = rp.states[upTo]
  const last = upTo > 0 ? g.steps[upTo - 1] : null

  const rows: { n: number; w: number; b: number | null }[] = []
  for (let i = 0; i < total; i += 2) rows.push({ n: i / 2 + 1, w: i, b: i + 1 < total ? i + 1 : null })

  return (
    <div className="replay">
      <div className="replay-left">
        <button className="gray" onClick={onBack}>← {L.back}</button>
        <h2>{g.winner === 'w' ? L.whiteWon : L.blackWon}{g.reason === 'time' ? ` (${L.onTime})` : ''}</h2>
        <div className="board">
          {s.board.map((row, r) =>
            row.map((piece, c) => {
              const dark = (r + c) % 2 === 1
              const isLast =
                last && ((last[0] === r && last[1] === c) || (last[2] === r && last[3] === c))
              return (
                <div key={key(r, c)} className={`cell ${dark ? 'dark' : 'light'}${isLast ? ' last' : ''}`}>
                  {piece && <div className={`piece ${piece.c}`}>{piece.k ? '♛' : ''}</div>}
                </div>
              )
            })
          )}
        </div>
        <div className="replay-ctrl">
          <button disabled={p === 0} onClick={() => setP(0)}>⏮</button>
          <button disabled={p === 0} onClick={() => setP(p - 1)}>◀</button>
          <button disabled={p >= total} onClick={() => setP(p + 1)}>▶</button>
          <button disabled={p >= total} onClick={() => setP(total)}>⏭</button>
        </div>
      </div>

      <div className="replay-moves">
        {rows.map(row => (
          <div key={row.n} className="mv-row">
            <span className="mv-num">{row.n}.</span>
            <button className={`mv${p === row.w + 1 ? ' on' : ''}`} onClick={() => setP(row.w + 1)}>
              {rp.turns[row.w].text}
            </button>
            {row.b !== null ? (
              <button className={`mv${p === row.b + 1 ? ' on' : ''}`} onClick={() => setP((row.b ?? 0) + 1)}>
                {rp.turns[row.b].text}
              </button>
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function GameHistory() {
  const { lang } = useLang()
  const L: HText = lang in TEXT ? TEXT[lang as keyof typeof TEXT] : TEXT.en
  const T = TIME_TEXT[(lang in TIME_TEXT ? lang : 'en') as keyof typeof TIME_TEXT]
  const games = useGames()
  const [openId, setOpenId] = useState<string | null>(null)
  const open = games.find(g => g.id === openId)

  if (open) return <Replay g={open} L={L} onBack={() => setOpenId(null)} />

  return (
    <div className="hist">
      <h1>{L.title}</h1>
      <p className="hist-note">{L.note}</p>
      {games.length === 0 && <p>{L.empty}</p>}
      {games.map(g => (
        <div key={g.id} className="hist-row">
          <div className="hist-main">
            <b>
              {g.winner === 'w' ? L.whiteWon : L.blackWon}
              {g.reason === 'time' ? ` (${L.onTime})` : ''}
            </b>
            <span>
              {g.mode === 'bot' ? L.vsComputer : L.twoPlayers} ·{' '}
              {g.tc ? label(g.tc, T.min) : L.noClock} · {g.turns} {L.moves}
            </span>
            <span className="hist-date">{new Date(g.at).toLocaleString()}</span>
          </div>
          <div className="hist-btns">
            <button onClick={() => setOpenId(g.id)}>{L.open}</button>
            <button className="gray" onClick={() => deleteGame(g.id)}>{L.del}</button>
          </div>
        </div>
      ))}
      {games.length > 0 && (
        <button className="gray" onClick={clearGames}>{L.clear}</button>
      )}
    </div>
  )
}