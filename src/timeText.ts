export type TimeText = {
  bullet: string
  blitz: string
  rapid: string
  daily: string
  d1: string
  d3: string
  d7: string
  needAcc: string
  noClock: string
  start: string
  clockHint: string
  min: string
  whiteWinsTime: string
  blackWinsTime: string
  newGame: string
}

export const TIME_TEXT: Record<'en' | 'uz' | 'ru', TimeText> = {
  en: {
    bullet: 'Bullet',
    blitz: 'Blitz',
    rapid: 'Rapid',
    daily: 'Daily',
    d1: '1 day',
    d3: '3 days',
    d7: '7 days',
    needAcc: 'Needs accounts, coming soon',
    noClock: 'No clock',
    start: 'Start game',
    clockHint: 'The clock starts after White’s first move.',
    min: 'min',
    whiteWinsTime: 'Time is up. White wins!',
    blackWinsTime: 'Time is up. Black wins!',
    newGame: 'New game',
  },
  uz: {
    bullet: 'Bullet',
    blitz: 'Blitz',
    rapid: 'Rapid',
    daily: 'Kunlik',
    d1: '1 kun',
    d3: '3 kun',
    d7: '7 kun',
    needAcc: 'Hisob kerak, tez orada',
    noClock: 'Soatsiz',
    start: "O'yinni boshlash",
    clockHint: 'Soat oq birinchi yurgandan keyin boshlanadi.',
    min: 'daq',
    whiteWinsTime: "Vaqt tugadi. Oq g'alaba qozondi!",
    blackWinsTime: "Vaqt tugadi. Qora g'alaba qozondi!",
    newGame: "Yangi o'yin",
  },
  ru: {
    bullet: 'Пуля',
    blitz: 'Блиц',
    rapid: 'Рапид',
    daily: 'По переписке',
    d1: '1 день',
    d3: '3 дня',
    d7: '7 дней',
    needAcc: 'Нужен аккаунт, скоро',
    noClock: 'Без часов',
    start: 'Начать игру',
    clockHint: 'Часы запускаются после первого хода белых.',
    min: 'мин',
    whiteWinsTime: 'Время вышло. Победа белых!',
    blackWinsTime: 'Время вышло. Победа чёрных!',
    newGame: 'Новая игра',
  },
}