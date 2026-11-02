import { useEffect, useState } from 'react'
import './friends.css'
import { avatarOf, displayName, useAuth } from './auth'
import {
  NICK_RE,
  acceptRequest,
  createProfile,
  getProfile,
  getProfiles,
  listFriendships,
  removeFriendship,
  searchProfiles,
  sendRequest,
} from './friends'
import type { Friendship, Profile } from './friends'
import { useLang } from './i18n'

const TEXT = {
  en: {
    title: 'Friends',
    needSignIn: 'Sign in to add friends.',
    signIn: 'Sign in',
    guestNote: 'Guests cannot use friends. Link Google, Facebook or Telegram first.',
    link: 'Link an account',
    chooseNick: 'Choose your nickname',
    nickHint: 'Friends will find you by it. 3–20 characters: letters, digits and _.',
    nickRule: 'Use 3–20 letters, digits or _ only',
    nickTaken: 'This nickname is already taken',
    save: 'Save',
    yourNick: 'Your nickname',
    searchPh: 'Search by nickname',
    search: 'Search',
    minTwo: 'Type at least 2 characters',
    add: 'Add friend',
    sent: 'Request sent',
    isFriend: 'Friends',
    nobody: 'Nobody found',
    requests: 'Friend requests',
    accept: 'Accept',
    decline: 'Decline',
    yourFriends: 'Your friends',
    noFriends: 'No friends yet. Search by nickname to add someone.',
    pendingTitle: 'Sent requests',
    cancel: 'Cancel',
    remove: 'Remove',
    playSoon: 'Play (soon)',
    exists: 'A request or friendship already exists',
    loadError: 'Could not load data',
    notConfigured: 'Sign-in is not set up yet.',
    loading: 'Loading…',
  },
  uz: {
    title: "Do'stlar",
    needSignIn: "Do'st qo'shish uchun kiring.",
    signIn: 'Kirish',
    guestNote: "Mehmonlar do'stlar bo'limidan foydalana olmaydi. Avval Google, Facebook yoki Telegram ulang.",
    link: 'Akkaunt ulash',
    chooseNick: 'Laqabingizni tanlang',
    nickHint: "Do'stlaringiz sizni shu laqab bilan topadi. 3–20 belgi: harf, raqam va _.",
    nickRule: 'Faqat 3–20 ta harf, raqam yoki _ ishlating',
    nickTaken: 'Bu laqab band',
    save: 'Saqlash',
    yourNick: 'Sizning laqabingiz',
    searchPh: 'Laqab bo‘yicha qidirish',
    search: 'Qidirish',
    minTwo: 'Kamida 2 ta belgi yozing',
    add: "Do'st qo'shish",
    sent: "So'rov yuborildi",
    isFriend: "Do'stsiz",
    nobody: 'Hech kim topilmadi',
    requests: "Do'stlik so'rovlari",
    accept: 'Qabul qilish',
    decline: 'Rad etish',
    yourFriends: "Sizning do'stlaringiz",
    noFriends: "Hali do'st yo'q. Laqab bo'yicha qidirib, qo'shing.",
    pendingTitle: "Yuborilgan so'rovlar",
    cancel: 'Bekor qilish',
    remove: "O'chirish",
    playSoon: "O'ynash (tez orada)",
    exists: "So'rov yoki do'stlik allaqachon bor",
    loadError: "Ma'lumotni yuklab bo'lmadi",
    notConfigured: 'Kirish tizimi hali sozlanmagan.',
    loading: 'Yuklanmoqda…',
  },
  ru: {
    title: 'Друзья',
    needSignIn: 'Войдите, чтобы добавлять друзей.',
    signIn: 'Войти',
    guestNote: 'Гости не могут пользоваться друзьями. Сначала привяжите Google, Facebook или Telegram.',
    link: 'Привязать аккаунт',
    chooseNick: 'Выберите никнейм',
    nickHint: 'По нему вас найдут друзья. 3–20 символов: буквы, цифры и _.',
    nickRule: 'Только 3–20 букв, цифр или _',
    nickTaken: 'Этот никнейм уже занят',
    save: 'Сохранить',
    yourNick: 'Ваш никнейм',
    searchPh: 'Поиск по никнейму',
    search: 'Найти',
    minTwo: 'Введите минимум 2 символа',
    add: 'Добавить в друзья',
    sent: 'Запрос отправлен',
    isFriend: 'Друзья',
    nobody: 'Никого не найдено',
    requests: 'Запросы в друзья',
    accept: 'Принять',
    decline: 'Отклонить',
    yourFriends: 'Ваши друзья',
    noFriends: 'Друзей пока нет. Найдите кого-нибудь по никнейму.',
    pendingTitle: 'Отправленные запросы',
    cancel: 'Отменить',
    remove: 'Удалить',
    playSoon: 'Играть (скоро)',
    exists: 'Запрос или дружба уже существует',
    loadError: 'Не удалось загрузить данные',
    notConfigured: 'Вход ещё не настроен.',
    loading: 'Загрузка…',
  },
}

function Avatar({ p }: { p?: Profile }) {
  if (p?.avatar_url) return <img className="fr-av" src={p.avatar_url} alt="" />
  return <span className="fr-av">{(p?.nickname ?? '?').slice(0, 1).toUpperCase()}</span>
}

export function Friends({ onSignIn }: { onSignIn: () => void }) {
  const { lang } = useLang()
  const L = lang in TEXT ? TEXT[lang as keyof typeof TEXT] : TEXT.en
  const { user, loading, configured } = useAuth()
  const uid = user && !user.is_anonymous ? user.id : null

  const [me, setMe] = useState<Profile | null | undefined>(undefined)
  const [rows, setRows] = useState<Friendship[]>([])
  const [people, setPeople] = useState<Record<string, Profile>>({})
  const [nick, setNick] = useState('')
  const [q, setQ] = useState('')
  const [found, setFound] = useState<Profile[] | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function reload(id: string) {
    const p = await getProfile(id)
    if (p.error) {
      setMsg(`${L.loadError}: ${p.error}`)
      setMe(null)
      return
    }
    setMe(p.data)
    if (!p.data) return
    const fr = await listFriendships()
    if (fr.error) {
      setMsg(`${L.loadError}: ${fr.error}`)
      return
    }
    setRows(fr.data)
    const ids = Array.from(new Set(fr.data.flatMap(r => [r.requester, r.addressee]))).filter(
      x => x !== id,
    )
    const pr = await getProfiles(ids)
    setPeople(pr.data)
  }

  useEffect(() => {
    if (!uid) return
    void reload(uid)
    const timer = setInterval(() => void reload(uid), 20000)
    return () => clearInterval(timer)
  }, [uid])

  // Laqab yo'q bo'lsa, ismdan taklif tayyorlaymiz
  useEffect(() => {
    if (me !== null || nick || !user) return
    const base = displayName(user).replace(/[^A-Za-z0-9_]/g, '').slice(0, 16)
    setNick(base.length >= 3 ? base : `player${Math.floor(100 + Math.random() * 900)}`)
  }, [me, nick, user])

  async function saveNick() {
    if (!uid || !user) return
    if (!NICK_RE.test(nick)) {
      setMsg(L.nickRule)
      return
    }
    setBusy(true)
    setMsg('')
    const e = await createProfile(uid, nick, avatarOf(user))
    setBusy(false)
    if (e) {
      setMsg(e === 'taken' ? L.nickTaken : e)
      return
    }
    await reload(uid)
  }

  async function doSearch() {
    if (!uid) return
    const s = q.trim()
    if (s.length < 2) {
      setMsg(L.minTwo)
      return
    }
    setBusy(true)
    setMsg('')
    const r = await searchProfiles(s, uid)
    setBusy(false)
    if (r.error) setMsg(r.error)
    else setFound(r.data)
  }

  async function act(f: () => Promise<string | null>) {
    if (!uid) return
    setBusy(true)
    setMsg('')
    const e = await f()
    if (e) setMsg(e === 'exists' ? L.exists : e)
    await reload(uid)
    setBusy(false)
  }

  if (!configured) {
    return (
      <div className="fr">
        <h1>{L.title}</h1>
        <p className="fr-msg">{L.notConfigured}</p>
      </div>
    )
  }
  if (loading) {
    return (
      <div className="fr">
        <p>{L.loading}</p>
      </div>
    )
  }
  if (!user) {
    return (
      <div className="fr">
        <h1>{L.title}</h1>
        <p className="fr-hint">{L.needSignIn}</p>
        <button className="fr-btn" onClick={onSignIn}>{L.signIn}</button>
      </div>
    )
  }
  if (user.is_anonymous) {
    return (
      <div className="fr">
        <h1>{L.title}</h1>
        <p className="fr-hint">{L.guestNote}</p>
        <button className="fr-btn" onClick={onSignIn}>{L.link}</button>
      </div>
    )
  }
  if (me === undefined) {
    return (
      <div className="fr">
        <p>{L.loading}</p>
        {msg && <p className="fr-msg">{msg}</p>}
      </div>
    )
  }
  if (me === null) {
    return (
      <div className="fr">
        <h1>{L.title}</h1>
        <div className="fr-card">
          <h2>{L.chooseNick}</h2>
          <p className="fr-hint">{L.nickHint}</p>
          <input
            value={nick}
            maxLength={20}
            onChange={e => setNick(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') void saveNick()
            }}
          />
          {msg && <p className="fr-msg">{msg}</p>}
          <button className="fr-btn" disabled={busy} onClick={() => void saveNick()}>{L.save}</button>
        </div>
      </div>
    )
  }

  const accepted = rows.filter(r => r.status === 'accepted')
  const incoming = rows.filter(r => r.status === 'pending' && r.addressee === uid)
  const outgoing = rows.filter(r => r.status === 'pending' && r.requester === uid)
  const otherOf = (r: Friendship) => people[r.requester === uid ? r.addressee : r.requester]
  const relation = (id: string) => {
    const r = rows.find(x => x.requester === id || x.addressee === id)
    if (!r) return null
    if (r.status === 'accepted') return 'friend'
    return r.requester === uid ? 'sent' : 'received'
  }

  return (
    <div className="fr">
      <div className="fr-top">
        <h1>{L.title}</h1>
        <span className="fr-hint">{L.yourNick}: <b>{me.nickname}</b></span>
      </div>

      <div className="fr-card">
        <div className="fr-search">
          <input
            placeholder={L.searchPh}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') void doSearch()
            }}
          />
          <button className="fr-btn" disabled={busy} onClick={() => void doSearch()}>{L.search}</button>
        </div>
        {msg && <p className="fr-msg">{msg}</p>}
        {found && found.length === 0 && <p className="fr-hint">{L.nobody}</p>}
        {found?.map(p => {
          const rel = relation(p.id)
          const row = rows.find(x => x.requester === p.id || x.addressee === p.id)
          return (
            <div key={p.id} className="fr-row">
              <Avatar p={p} />
              <span className="fr-name">{p.nickname}</span>
              {rel === 'friend' && <span className="fr-label">{L.isFriend}</span>}
              {rel === 'sent' && <span className="fr-label">{L.sent}</span>}
              {rel === 'received' && row && (
                <button className="fr-btn" disabled={busy} onClick={() => void act(() => acceptRequest(row.id))}>
                  {L.accept}
                </button>
              )}
              {rel === null && (
                <button className="fr-btn" disabled={busy} onClick={() => void act(() => sendRequest(uid ?? '', p.id))}>
                  {L.add}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {incoming.length > 0 && (
        <div className="fr-card">
          <h2>{L.requests}</h2>
          {incoming.map(r => (
            <div key={r.id} className="fr-row">
              <Avatar p={otherOf(r)} />
              <span className="fr-name">{otherOf(r)?.nickname ?? '…'}</span>
              <button className="fr-btn" disabled={busy} onClick={() => void act(() => acceptRequest(r.id))}>
                {L.accept}
              </button>
              <button className="fr-btn gray" disabled={busy} onClick={() => void act(() => removeFriendship(r.id))}>
                {L.decline}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="fr-card">
        <h2>{L.yourFriends}</h2>
        {accepted.length === 0 && <p className="fr-hint">{L.noFriends}</p>}
        {accepted.map(r => (
          <div key={r.id} className="fr-row">
            <Avatar p={otherOf(r)} />
            <span className="fr-name">{otherOf(r)?.nickname ?? '…'}</span>
            <button className="fr-btn gray" disabled>{L.playSoon}</button>
            <button className="fr-btn red" disabled={busy} onClick={() => void act(() => removeFriendship(r.id))}>
              {L.remove}
            </button>
          </div>
        ))}
      </div>

      {outgoing.length > 0 && (
        <div className="fr-card">
          <h2>{L.pendingTitle}</h2>
          {outgoing.map(r => (
            <div key={r.id} className="fr-row">
              <Avatar p={otherOf(r)} />
              <span className="fr-name">{otherOf(r)?.nickname ?? '…'}</span>
              <button className="fr-btn gray" disabled={busy} onClick={() => void act(() => removeFriendship(r.id))}>
                {L.cancel}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}