import { useState } from 'react'
import { Game } from './App'
import './site.css'

type View = 'home' | 'play' | 'bot' | 'auth'

const NAV = [
  ['♟', "O'ynash", 'play'],
  ['🤖', 'Kompyuter bilan', 'bot'],
  ['🧩', 'Topishmoqlar', 'soon'],
  ['📚', "O'rganish", 'soon'],
  ['👥', "Do'stlar", 'soon'],
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
  const [view, setView] = useState<View>('home')
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('uz_user'))
  const [name, setName] = useState('')
  const [toast, setToast] = useState('')

  function say(t: string) {
    setToast(t)
    setTimeout(() => setToast(''), 2000)
  }
  function openAuth(m: 'login' | 'signup') { setMode(m); setView('auth') }
  function submit() {
    if (name.trim().length < 3) return say("Ism kamida 3 ta belgi bo'lsin")
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
            onClick={() => (to === 'soon' ? say('Tez orada!') : setView(to as View))}
          >
            <span>{icon}</span>{label}
          </button>
        ))}
        <div className="grow" />
        {user ? (
          <>
            <div className="me">👤 {user}</div>
            <button className="btn gray" onClick={logout}>Chiqish</button>
          </>
        ) : (
          <>
            <button className="btn green" onClick={() => openAuth('signup')}>Ro'yxatdan o'tish</button>
            <button className="btn gray" onClick={() => openAuth('login')}>Kirish</button>
          </>
        )}
      </aside>

      <main className="main">
        {view === 'home' && (
          <div className="hero">
            <MiniBoard />
            <div className="heroText">
              <h1>Shashkani onlayn o'ynang!</h1>
              <p>Ruscha shashka, bepul va qulay.</p>
              <button className="btn green big" onClick={() => setView('play')}>▶ O'ynash</button>
              <button className="btn gray big" onClick={() => setView('bot')}>🤖 Kompyuter bilan</button>
            </div>
          </div>
        )}

        {view === 'play' && <Game key="play" />}
        {view === 'bot' && <Game key="bot" vsBot />}

        {view === 'auth' && (
          <div className="card">
            <h2>{mode === 'signup' ? "Ro'yxatdan o'tish" : 'Kirish'}</h2>
            <input placeholder="Foydalanuvchi nomi" value={name} onChange={e => setName(e.target.value)} />
            <input type="password" placeholder="Parol" />
            <button className="btn green big" onClick={submit}>
              {mode === 'signup' ? "Ro'yxatdan o'tish" : 'Kirish'}
            </button>
            <p className="hint">Hozircha demo: parol saqlanmaydi, faqat ism eslab qolinadi.</p>
            <button className="link" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
              {mode === 'signup' ? 'Hisobingiz bormi? Kirish' : "Hisobingiz yo'qmi? Ro'yxatdan o'tish"}
            </button>
          </div>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}