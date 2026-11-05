import './installcard.css'
import { useLang } from './i18n'
import { useInstall } from './install'

const TEXT = {
  en: {
    title: 'Get the app',
    install: 'Install app',
    apk: 'Download for Android (APK)',
    play: 'Get it on Google Play',
    ios: 'On iPhone: tap Share, then “Add to Home Screen”.',
  },
  uz: {
    title: 'Ilovani oling',
    install: "Ilovani o'rnatish",
    apk: 'Android uchun yuklab olish (APK)',
    play: 'Google Play’dan olish',
    ios: 'iPhone’da: «Ulashish» tugmasini bosing, so‘ng «Bosh ekranga qo‘shish» ni tanlang.',
  },
  ru: {
    title: 'Получите приложение',
    install: 'Установить приложение',
    apk: 'Скачать для Android (APK)',
    play: 'Скачать в Google Play',
    ios: 'На iPhone: нажмите «Поделиться», затем «На экран “Домой”».',
  },
}

const APK_URL = (import.meta.env.VITE_APK_URL as string | undefined) ?? ''
const PLAY_URL = (import.meta.env.VITE_PLAY_URL as string | undefined) ?? ''

export function InstallCard() {
  const { lang } = useLang()
  const L = lang in TEXT ? TEXT[lang as keyof typeof TEXT] : TEXT.en
  const { canInstall, install } = useInstall()
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isAndroid = /Android/i.test(ua)
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  const showApk = !!APK_URL && isAndroid
  const showPlay = !!PLAY_URL && isAndroid

  if (standalone || !(canInstall || isIOS || showApk || showPlay)) return null

  return (
    <div className="ic">
      <b>{L.title}</b>
      {showPlay && <a className="ic-btn" href={PLAY_URL}>{L.play}</a>}
      {canInstall && <button className="ic-btn" onClick={() => void install()}>{L.install}</button>}
      {showApk && <a className="ic-btn gray" href={APK_URL} download>{L.apk}</a>}
      {isIOS && <p className="ic-note">{L.ios}</p>}
    </div>
  )
}