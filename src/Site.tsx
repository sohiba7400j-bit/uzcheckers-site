import { useState } from 'react'
import { Game } from './App'
import { avatarOf, displayName, signOut, useAuth } from './auth'
import { AuthPage, authText } from './AuthPage'
import { GameHistory, historyTitle } from './GameHistory'
import { LANGS, setLang, useLang } from './i18n'
import type { Keys, Lang } from './i18n'
import { useInstall } from './install'
import { Learn } from './Learn'
import { Puzzles } from './Puzzles'
import { Settings, settingsTitle } from './Settings'
import './site.css'

type View = 'home' | 'play' | 'bot' | 'puzzles' | 'learn' | 'history' | 'settings' | 'auth'

const NAV: [string, Keys, string][] = [
  ['♟', 'play', 'play'],
  ['🤖', 'vsBot', 'bot'],
  ['🧩', 'puzzles', 'puzzles'],
  ['📚', 'learn', 'learn'],
  ['👥', 'friends', 'soon'],
]

const TABS: [string, Keys, View][] = [
  ['♟', 'play', 'play'],
  ['🤖', 'vsBot', 'bot'],
  ['🧩', 'puzzles', 'puzzles'],
  ['📚', 'learn', 'learn'],
]

type Words = Record<'en' | 'uz' | 'ru', string>
const WORDS: Record<'more' | 'install', Words> = {
  more: { en: 'More', uz: 'Yana', ru: 'Ещё' },
  install: { en: 'Install app', uz: "Ilovani o'rnatish", ru: 'Установить приложение' },
}
const word = (w: Words, lang: string) => (lang in w ? w[lang as keyof Words] : w.en)

function MiniBoard() {
  return (
    <div className="board mini">
      {Array.from({ length: 64 }, (_, i) => {
        const r = Math.floor(i / 8), c = i % 8
        const dark = (r + c) % 2 === 1
        const color = r < 3 ? 'b' : r > 4 ? 'w' : null
        return (
          <div key={i} className={`cell ${dark ? 'dark' : 'light'}`}>
            {dark && color && <div className={`piece ${color}`} />}
          </div>
        )
      })}
    </div>
  )
}

export default function Site() {
  const { lang, t } = useLang()
  const { user, loading, configured } = useAuth()
  const { canInstall, install } = useInstall()
  const A = authText(lang)
  const avatar = user ? avatarOf(user) : null
  const [view, setView] = useState<View>('home')
  const [sheet, setSheet] = useState(false)
  const [toast, setToast] = useState('')
  const [gateClosed, setGateClosed] = useState(() => {
    try {
      return sessionStorage.getItem('uz_gate') === '1'
    } catch {
      return false
    }
  })

  // Sayt ochilganda kirish oynasi. "Keyinroq" bosilsa, shu seansda qayta chiqmaydi.
  const showGate = configured && !loading && !user && !gateClosed && view !== 'auth'
  const moreOn = view === 'history' || view === 'settings' || view === 'auth'

  function closeGate() {
    try {
      sessionStorage.setItem('uz_gate', '1')
    } catch {
      // ignore
    }
    setGateClosed(true)
  }

  function say(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  function go(v: View) {
    setView(v)
    setSheet(false)
  }

  const nameOf = user ? displayName(user, A.guestName) : ''

  const langSelect = (
    <select
      className="lang"
      value={lang}
      aria-label={t('language')}
      onChange={e => setLang(e.target.value as Lang)}
    >
      {LANGS.map(l => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  )

  return (
    <div className="site">
      <header className="mtop">
        <div className="logo" onClick={() => go('home')}>♛ UzCheckers</div>
        {user ? (
          <button className="mme" onClick={() => go('auth')} aria-label={nameOf}>
            {avatar ? (
              <img className="avatar" src={avatar} alt="" />
            ) : (
              <span className="avatar ph">{nameOf.slice(0, 1).toUpperCase()}</span>
            )}
          </button>
        ) : (
          <button className="btn green msign" onClick={() => go('auth')}>{t('login')}</button>
        )}
      </header>

      <aside className="side">
        <div className="logo" onClick={() => go('home')}>♛ UzCheckers</div>
        {NAV.map(([icon, label, to]) => (
          <button
            key={label}
            className={`nav ${view === to ? 'on' : ''}`}
            onClick={() => (to === 'soon' ? say(t('soon')) : go(to as View))}
          >
            <span>{icon}</span>{t(label)}
          </button>
        ))}
        <button className={`nav ${view === 'history' ? 'on' : ''}`} onClick={() => go('history')}>
          <span>🕘</span>{historyTitle(lang)}
        </button>
        <button className={`nav ${view === 'settings' ? 'on' : ''}`} onClick={() => go('settings')}>
          <span>⚙️</span>{settingsTitle(lang)}
        </button>
        <div className="grow" />
        {langSelect}
        {user ? (
          <>
            <div className="me" onClick={() => go('auth')}>
              {avatar && <img className="avatar" src={avatar} alt="" />}
              <span>{nameOf}</span>
            </div>
            <button className="btn gray" onClick={() => signOut()}>{t('logout')}</button>
          </>
        ) : (
          <>
            <button className="btn green" onClick={() => go('auth')}>{t('signup')}</button>
            <button className="btn gray" onClick={() => go('auth')}>{t('login')}</button>
          </>
        )}
      </aside>

      <main className="main">
        {view === 'home' && (
          <div className="hero">
            <MiniBoard />
            <div className="heroText">
              <h1>{t('heroTitle')}</h1>
              <p>{t('heroSub')}</p>
              <button className="btn green big" onClick={() => go('play')}>▶ {t('play')}</button>
              <button className="btn gray big" onClick={() => go('bot')}>🤖 {t('vsBot')}</button>
            </div>
          </div>
        )}

        {view === 'play' && <Game key="play" />}
        {view === 'bot' && <Game key="bot" vsBot />}
        {view === 'puzzles' && <Puzzles />}
        {view === 'learn' && <Learn />}
        {view === 'history' && <GameHistory />}
        {view === 'settings' && <Settings />}
        {view === 'auth' && <AuthPage onDone={() => go('home')} />}
      </main>

      <nav className="mbar">
        {TABS.map(([icon, label, to]) => (
          <button key={to} className={`mtab ${view === to ? 'on' : ''}`} onClick={() => go(to)}>
            <span className="ico">{icon}</span>
            <span className="lbl">{t(label)}</span>
          </button>
        ))}
        <button className={`mtab ${moreOn ? 'on' : ''}`} onClick={() => setSheet(true)}>
          <span className="ico">☰</span>
          <span className="lbl">{word(WORDS.more, lang)}</span>
        </button>
      </nav>

      {sheet && (
        <>
          <div className="sheet-bg" onClick={() => setSheet(false)} />
          <div className="sheet">
            <button className="nav" onClick={() => go('history')}>
              <span>🕘</span>{historyTitle(lang)}
            </button>
            <button
              className="nav"
              onClick={() => {
                setSheet(false)
                say(t('soon'))
              }}
            >
              <span>👥</span>{t('friends')}
            </button>
            <button className="nav" onClick={() => go('settings')}>
              <span>⚙️</span>{settingsTitle(lang)}
            </button>
            {canInstall && (
              <button
                className="nav"
                onClick={() => {
                  setSheet(false)
                  void install()
                }}
              >
                <span>📲</span>{word(WORDS.install, lang)}
              </button>
            )}
            {langSelect}
            {user ? (
              <>
                <div className="me" onClick={() => go('auth')}>
                  {avatar && <img className="avatar" src={avatar} alt="" />}
                  <span>{nameOf}</span>
                </div>
                <button
                  className="btn gray"
                  onClick={() => {
                    setSheet(false)
                    void signOut()
                  }}
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <button className="btn green" onClick={() => go('auth')}>{t('signup')}</button>
                <button className="btn gray" onClick={() => go('auth')}>{t('login')}</button>
              </>
            )}
          </div>
        </>
      )}

      {showGate && (
        <div className="gate">
          <div className="gate-box">
            <AuthPage onDone={closeGate} />
            <button className="gate-later" onClick={closeGate}>{A.later}</button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}