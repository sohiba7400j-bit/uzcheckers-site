import { useEffect, useRef, useState } from 'react'
import './auth.css'
import {
  PROVIDERS_ON,
  TELEGRAM_BOT,
  displayName,
  linkOAuth,
  signInGuest,
  signInOAuth,
  signInTelegram,
  signOut,
  useAuth,
} from './auth'
import { useLang } from './i18n'

const TEXT = {
  en: {
    title: 'Sign in',
    sub: 'Choose how you want to play',
    google: 'Continue with Google',
    facebook: 'Continue with Facebook',
    guest: 'Play as guest',
    guestNote: 'Guests can start playing right away. Link an account later to keep your games.',
    notConfigured: 'Sign-in is not set up yet.',
    signedAs: 'Signed in as',
    guestAs: 'You are playing as a guest',
    linkTitle: 'Keep your progress by linking an account',
    linkGoogle: 'Link Google',
    linkFacebook: 'Link Facebook',
    signOut: 'Sign out',
    home: 'Go to home',
    loading: 'Loading…',
    guestName: 'Guest',
  },
  uz: {
    title: 'Kirish',
    sub: "Qanday o'ynashni tanlang",
    google: 'Google orqali davom etish',
    facebook: 'Facebook orqali davom etish',
    guest: "Mehmon sifatida o'ynash",
    guestNote: "Mehmonlar darrov o'ynashi mumkin. O'yinlaringiz saqlanib qolishi uchun keyinroq akkaunt ulang.",
    notConfigured: 'Kirish tizimi hali sozlanmagan.',
    signedAs: 'Siz kirgansiz:',
    guestAs: "Siz mehmon sifatida o'ynayapsiz",
    linkTitle: "O'yinlaringizni saqlash uchun akkaunt ulang",
    linkGoogle: 'Google ulash',
    linkFacebook: 'Facebook ulash',
    signOut: 'Chiqish',
    home: 'Bosh sahifaga',
    loading: 'Yuklanmoqda…',
    guestName: 'Mehmon',
  },
  ru: {
    title: 'Вход',
    sub: 'Выберите, как хотите играть',
    google: 'Продолжить через Google',
    facebook: 'Продолжить через Facebook',
    guest: 'Играть как гость',
    guestNote: 'Гости могут играть сразу. Позже привяжите аккаунт, чтобы сохранить партии.',
    notConfigured: 'Вход ещё не настроен.',
    signedAs: 'Вы вошли как',
    guestAs: 'Вы играете как гость',
    linkTitle: 'Привяжите аккаунт, чтобы сохранить прогресс',
    linkGoogle: 'Привязать Google',
    linkFacebook: 'Привязать Facebook',
    signOut: 'Выйти',
    home: 'На главную',
    loading: 'Загрузка…',
    guestName: 'Гость',
  },
}

export const authText = (lang: string) =>
  lang in TEXT ? TEXT[lang as keyof typeof TEXT] : TEXT.en

type TgUser = Record<string, unknown>

// Telegram'ning rasmiy kirish tugmasi (Login Widget)
function TelegramButton({ bot, onAuth }: { bot: string; onAuth: (u: TgUser) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const cb = useRef(onAuth)

  useEffect(() => {
    cb.current = onAuth
  })

  useEffect(() => {
    const el = box.current
    if (!el) return
    const w = window as unknown as { onTelegramAuth?: (u: TgUser) => void }
    w.onTelegramAuth = u => cb.current(u)
    const s = document.createElement('script')
    s.src = 'https://telegram.org/js/telegram-widget.js?22'
    s.async = true
    s.setAttribute('data-telegram-login', bot)
    s.setAttribute('data-size', 'large')
    s.setAttribute('data-radius', '8')
    s.setAttribute('data-onauth', 'onTelegramAuth(user)')
    el.appendChild(s)
    return () => {
      el.innerHTML = ''
    }
  }, [bot])

  return <div ref={box} className="tg-box" />
}

export function AuthPage({ onDone }: { onDone: () => void }) {
  const { lang } = useLang()
  const L = authText(lang)
  const { user, loading, configured } = useAuth()
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function run(f: () => Promise<string | null>, after?: () => void) {
    setBusy(true)
    setErr('')
    const e = await f()
    setBusy(false)
    if (e) setErr(e)
    else if (after) after()
  }

  if (!configured) {
    return (
      <div className="auth">
        <h2>{L.title}</h2>
        <p className="auth-err">{L.notConfigured}</p>
      </div>
    )
  }
  if (loading) {
    return (
      <div className="auth">
        <p>{L.loading}</p>
      </div>
    )
  }

  if (user && !user.is_anonymous) {
    return (
      <div className="auth">
        <h2>{L.title}</h2>
        <p>{L.signedAs} <b>{displayName(user, L.guestName)}</b></p>
        <button className="auth-btn guest" onClick={onDone}>{L.home}</button>
        <button className="auth-btn guest" onClick={() => signOut()}>{L.signOut}</button>
      </div>
    )
  }

  if (user) {
    const anyProvider = PROVIDERS_ON.google || PROVIDERS_ON.facebook
    return (
      <div className="auth">
        <h2>{L.title}</h2>
        <p>{L.guestAs}</p>
        {anyProvider && <p>{L.linkTitle}</p>}
        {PROVIDERS_ON.google && (
          <button className="auth-btn google" disabled={busy} onClick={() => run(() => linkOAuth('google'))}>
            {L.linkGoogle}
          </button>
        )}
        {PROVIDERS_ON.facebook && (
          <button className="auth-btn facebook" disabled={busy} onClick={() => run(() => linkOAuth('facebook'))}>
            {L.linkFacebook}
          </button>
        )}
        {err && <p className="auth-err">{err}</p>}
        <button className="auth-btn guest" onClick={onDone}>{L.home}</button>
        <button className="auth-btn guest" onClick={() => signOut()}>{L.signOut}</button>
      </div>
    )
  }

  return (
    <div className="auth">
      <h2>{L.title}</h2>
      <p>{L.sub}</p>
      {PROVIDERS_ON.google && (
        <button className="auth-btn google" disabled={busy} onClick={() => run(() => signInOAuth('google'))}>
          {L.google}
        </button>
      )}
      {PROVIDERS_ON.facebook && (
        <button className="auth-btn facebook" disabled={busy} onClick={() => run(() => signInOAuth('facebook'))}>
          {L.facebook}
        </button>
      )}
      {TELEGRAM_BOT && (
        <TelegramButton
          bot={TELEGRAM_BOT}
          onAuth={u => {
            void run(() => signInTelegram(u), onDone)
          }}
        />
      )}
      <button className="auth-btn guest" disabled={busy} onClick={() => run(signInGuest, onDone)}>
        {L.guest}
      </button>
      <p>{L.guestNote}</p>
      {err && <p className="auth-err">{err}</p>}
    </div>
  )
}