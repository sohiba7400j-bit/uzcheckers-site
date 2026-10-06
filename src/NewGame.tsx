import { useState } from 'react'
import './newgame.css'
import { useLang } from './i18n'
import { GROUPS, category, label, saveTC } from './timeControls'
import type { TC } from './timeControls'
import { TIME_TEXT } from './timeText'

const ICON = { bullet: '🚀', blitz: '⚡', rapid: '⏱️' }

export function NewGame({
  initial,
  onStart,
}: {
  initial: TC | null
  onStart: (tc: TC | null) => void
}) {
  const { lang } = useLang()
  const L = TIME_TEXT[(lang in TIME_TEXT ? lang : 'en') as keyof typeof TIME_TEXT]
  const [tc, setTc] = useState<TC | null>(initial)
  const same = (a: TC | null, b: TC) => !!a && a.min === b.min && a.inc === b.inc

  return (
    <div className="ng">
      <h2>{L.newGame}</h2>
      <div className="ng-current">
        ⏱ {tc ? `${label(tc, L.min)} (${L[category(tc)]})` : L.noClock}
      </div>

      {GROUPS.map(g => (
        <div key={g.key}>
          <div className="ng-cat">{ICON[g.key]} {L[g.key]}</div>
          <div className="ng-row">
            {g.items.map(it => (
              <button
                key={label(it)}
                className={`ng-btn${same(tc, it) ? ' on' : ''}`}
                onClick={() => setTc(it)}
              >
                {label(it, L.min)}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <div className="ng-cat">☀️ {L.daily}</div>
        <div className="ng-row">
          {[L.d1, L.d3, L.d7].map(x => (
            <button key={x} className="ng-btn" disabled title={L.needAcc}>{x}</button>
          ))}
        </div>
      </div>

      <button className={`ng-btn wide${tc === null ? ' on' : ''}`} onClick={() => setTc(null)}>
        {L.noClock}
      </button>
      <p className="ng-note">{L.clockHint}</p>
      <button
        className="ng-start"
        onClick={() => {
          saveTC(tc)
          onStart(tc)
        }}
      >
        {L.start}
      </button>
    </div>
  )
}