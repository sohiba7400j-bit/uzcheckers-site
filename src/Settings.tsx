import './App.css'
import './settings.css'
import { useLang } from './i18n'
import {
  BOARD_PRESETS,
  PIECE_PRESETS,
  resetPrefs,
  setPrefs,
  usePrefs,
} from './prefs'

const TEXT = {
  en: {
    title: 'Settings',
    board: 'Board colors',
    pieces: 'Piece colors',
    light: 'Light squares',
    dark: 'Dark squares',
    white: 'White pieces',
    black: 'Black pieces',
    preview: 'Preview',
    reset: 'Reset to default',
  },
  uz: {
    title: 'Sozlamalar',
    board: 'Doska ranglari',
    pieces: 'Dona ranglari',
    light: 'Och katakchalar',
    dark: "To'q katakchalar",
    white: 'Oq donalar',
    black: 'Qora donalar',
    preview: "Ko'rinishi",
    reset: 'Dastlabki holatga qaytarish',
  },
  ru: {
    title: 'Настройки',
    board: 'Цвета доски',
    pieces: 'Цвета шашек',
    light: 'Светлые поля',
    dark: 'Тёмные поля',
    white: 'Белые шашки',
    black: 'Чёрные шашки',
    preview: 'Предпросмотр',
    reset: 'Сбросить по умолчанию',
  },
}

export const settingsTitle = (lang: string) =>
  (lang in TEXT ? TEXT[lang as keyof typeof TEXT] : TEXT.en).title

function Preview() {
  return (
    <div className="board prev">
      {Array.from({ length: 64 }, (_, i) => {
        const r = Math.floor(i / 8)
        const c = i % 8
        const dark = (r + c) % 2 === 1
        let piece: 'w' | 'b' | null = r < 3 ? 'b' : r > 4 ? 'w' : null
        let king = false
        if (r === 3 && c === 4) { piece = 'w'; king = true }
        if (r === 4 && c === 3) { piece = 'b'; king = true }
        return (
          <div key={i} className={`cell ${dark ? 'dark' : 'light'}`}>
            {dark && piece && <div className={`piece ${piece}`}>{king ? '♛' : ''}</div>}
          </div>
        )
      })}
    </div>
  )
}

export function Settings() {
  const { lang } = useLang()
  const L = lang in TEXT ? TEXT[lang as keyof typeof TEXT] : TEXT.en
  const s = usePrefs()

  return (
    <div className="settings">
      <div className="settings-panel">
        <h2>{L.title}</h2>

        <h3>{L.board}</h3>
        <div className="swatches">
          {BOARD_PRESETS.map(p => (
            <button
              key={p.light + p.dark}
              className={`swatch${s.light === p.light && s.dark === p.dark ? ' on' : ''}`}
              style={{ background: `linear-gradient(135deg, ${p.light} 50%, ${p.dark} 50%)` }}
              onClick={() => setPrefs({ light: p.light, dark: p.dark })}
              aria-label="board colors"
            />
          ))}
        </div>
        <label className="pair">
          {L.light}
          <input type="color" value={s.light} onChange={e => setPrefs({ light: e.target.value })} />
        </label>
        <label className="pair">
          {L.dark}
          <input type="color" value={s.dark} onChange={e => setPrefs({ dark: e.target.value })} />
        </label>

        <h3>{L.pieces}</h3>
        <div className="swatches">
          {PIECE_PRESETS.map(p => (
            <button
              key={p.pw + p.pb}
              className={`swatch round${s.pw === p.pw && s.pb === p.pb ? ' on' : ''}`}
              style={{ background: `linear-gradient(90deg, ${p.pw} 50%, ${p.pb} 50%)` }}
              onClick={() => setPrefs({ pw: p.pw, pb: p.pb })}
              aria-label="piece colors"
            />
          ))}
        </div>
        <label className="pair">
          {L.white}
          <input type="color" value={s.pw} onChange={e => setPrefs({ pw: e.target.value })} />
        </label>
        <label className="pair">
          {L.black}
          <input type="color" value={s.pb} onChange={e => setPrefs({ pb: e.target.value })} />
        </label>

        <button className="reset" onClick={resetPrefs}>{L.reset}</button>
      </div>

      <div className="settings-preview">
        <h3>{L.preview}</h3>
        <Preview />
      </div>
    </div>
  )
}