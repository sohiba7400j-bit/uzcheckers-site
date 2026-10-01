import { useState } from 'react'
import { Game } from './App'
import { LANGS, setLang, useLang } from './i18n'
import type { Keys, Lang } from './i18n'
import './site.css'

type View = 'home' | 'play' | 'bot' | 'auth'

const NAV: [string, Keys, string][] = [
  ['♟', 'play', 'play'],
  ['🤖', 'vsBot', 'bot'],
  ['🧩', 'puzzles', 'soon'],
  ['📚', 'learn', 'soon'],
  ['👥', 'friends', 'soon'],
]

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
  const [view, setView] = useState<View>('home')
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('uz_user'))
  const [name, setName] = useState('')
  const [toast, setToast] = useState('')

  function say(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }
  function openAuth(m: 'login' | 'signup') { setMode(m); setView('auth') }
  function submit() {
    if (name.trim().length < 3) return say(t('nameShort'))
    localStorage.setItem('uz_user', name.trim())
    setUser(name.trim())
    setView('home')
  }
  function logout() {
    localStorage.removeItem('uz_user')
    setUser(null)
  }

  return (
    <div className="site">
      <aside className="side">
        <div className="logo" onClick={() => setView('home')}>♛ UzCheckers</div>
        {NAV.map(([icon, label, to]) => (
          <button
            key={label}
            className={`nav ${view === to ? 'on' : ''}`}
            onClick={() => (to === 'soon' ? say(t('soon')) : setView(to as View))}
          >
            <span>{icon}</span>{t(label)}
          </button>
        ))}
        <div className="grow" />
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
        {user ? (
          <>
            <div className="me">👤 {user}</div>
            <button className="btn gray" onClick={logout}>{t('logout')}</button>
          </>
        ) : (
          <>
            <button className="btn green" onClick={() => openAuth('signup')}>{t('signup')}</button>
            <button className="btn gray" onClick={() => openAuth('login')}>{t('login')}</button>
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
              <button className="btn green big" onClick={() => setView('play')}>▶ {t('play')}</button>
              <button className="btn gray big" onClick={() => setView('bot')}>🤖 {t('vsBot')}</button>
            </div>
          </div>
        )}

        {view === 'play' && <Game key="play" />}
        {view === 'bot' && <Game key="bot" vsBot />}

        {view === 'auth' && (
          <div className="card">
            <h2>{mode === 'signup' ? t('signup') : t('login')}</h2>
            <input placeholder={t('username')} value={name} onChange={e => setName(e.target.value)} />
            <input type="password" placeholder={t('password')} />
            <button className="btn green big" onClick={submit}>
              {mode === 'signup' ? t('signup') : t('login')}
            </button>
            <p className="hint">{t('demoHint')}</p>
            <button className="link" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
              {mode === 'signup' ? t('haveAcc') : t('noAcc')}
            </button>
          </div>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}