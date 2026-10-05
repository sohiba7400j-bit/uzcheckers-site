export type LearnText = {
  title: string
  coach: string
  hint: string
  rules: string
  newGame: string
  yourMove: string
  forced: string
  thinking: string
  win: string
  lose: string
  welcome: string
  captured: string
  threat: string
  better: string
  good: string
  hintCapture: string
  hintKing: string
  hintSafe: string
  rulesTitle: string
  rulesList: string[]
}

export const TEXT: Record<'en' | 'uz' | 'ru', LearnText> = {
  en: {
    title: 'Learn',
    coach: 'Coach',
    hint: 'Hint',
    rules: 'Rules',
    newGame: 'New game',
    yourMove: 'Your move (white)',
    forced: 'You must capture!',
    thinking: 'Opponent is thinking…',
    win: 'You won! 🎉',
    lose: 'You lost this one. Try again!',
    welcome: 'Welcome! You play white. Make a move and I will review it. Ask for a hint any time.',
    captured: 'Nice! You captured {n} piece(s).',
    threat: 'Careful: your opponent can now capture {n} of your piece(s).',
    better: 'A stronger move was {move}.',
    good: 'Good move, nothing is hanging.',
    hintCapture: 'Capture {n} piece(s): {move}',
    hintKing: 'This move makes a king: {move}',
    hintSafe: 'A solid move: {move}',
    rulesTitle: 'Rules of Russian draughts',
    rulesList: [
      'The game is played on the dark squares of an 8×8 board. Each side starts with 12 pieces.',
      'A man moves one square diagonally forward.',
      'Capturing is mandatory, and men can capture forward and backward.',
      'If you can keep capturing after a jump, you must continue with the same piece.',
      'A man that reaches the far row becomes a king (♛).',
      'A king moves any distance along a diagonal and captures from afar.',
      'You win when your opponent has no pieces or no legal moves.',
    ],
  },
  uz: {
    title: "O'rganish",
    coach: 'Murabbiy',
    hint: 'Maslahat',
    rules: 'Qoidalar',
    newGame: "Yangi o'yin",
    yourMove: 'Sizning yurishingiz (oq)',
    forced: 'Urish majburiy!',
    thinking: "Raqib o'ylayapti…",
    win: 'Siz yutdingiz! 🎉',
    lose: "Bu safar yutqazdingiz. Yana urinib ko'ring!",
    welcome: "Xush kelibsiz! Siz oq bilan o'ynaysiz. Yuring, men yurishingizni baholayman. Istalgan vaqtda maslahat so'rang.",
    captured: "Zo'r! {n} dona urdingiz.",
    threat: "Ehtiyot bo'ling: raqib endi {n} dona ura oladi.",
    better: 'Kuchliroq yurish: {move}.',
    good: 'Yaxshi yurish, hech narsa xavf ostida emas.',
    hintCapture: '{n} dona uring: {move}',
    hintKing: 'Bu yurish damka qiladi: {move}',
    hintSafe: 'Ishonchli yurish: {move}',
    rulesTitle: 'Ruscha shashka qoidalari',
    rulesList: [
      "O'yin 8×8 doskaning to'q katakchalarida o'ynaladi. Har tomonda 12 ta dona bor.",
      "Oddiy dona diagonal bo'ylab oldinga bir katak yuradi.",
      'Urish majburiy, oddiy dona oldinga ham, orqaga ham uradi.',
      "Urgandan keyin yana urish imkoni bo'lsa, o'sha dona bilan davom etishingiz shart.",
      "Oxirgi qatorga yetgan dona damka (♛) bo'ladi.",
      "Damka diagonal bo'ylab istalgan masofaga yuradi va uzoqdan uradi.",
      "Raqibning donasi qolmasa yoki yura olmasa, siz yutasiz.",
    ],
  },
  ru: {
    title: 'Обучение',
    coach: 'Тренер',
    hint: 'Подсказка',
    rules: 'Правила',
    newGame: 'Новая игра',
    yourMove: 'Ваш ход (белые)',
    forced: 'Нужно бить!',
    thinking: 'Соперник думает…',
    win: 'Вы победили! 🎉',
    lose: 'В этот раз проигрыш. Попробуйте ещё!',
    welcome: 'Добро пожаловать! Вы играете белыми. Сделайте ход, я его оценю. Подсказку можно попросить в любой момент.',
    captured: 'Отлично! Вы взяли шашек: {n}.',
    threat: 'Осторожно: соперник теперь может взять шашек: {n}.',
    better: 'Сильнее было сходить {move}.',
    good: 'Хороший ход, ничего не висит.',
    hintCapture: 'Возьмите шашек: {n}. Ход: {move}',
    hintKing: 'Этот ход даёт дамку: {move}',
    hintSafe: 'Надёжный ход: {move}',
    rulesTitle: 'Правила русских шашек',
    rulesList: [
      'Играют на тёмных полях доски 8×8. У каждого по 12 шашек.',
      'Простая шашка ходит на одно поле по диагонали вперёд.',
      'Бить обязательно, простые шашки бьют и вперёд, и назад.',
      'Если после взятия можно бить дальше, нужно продолжать той же шашкой.',
      'Шашка, дошедшая до последнего ряда, становится дамкой (♛).',
      'Дамка ходит по диагонали на любое расстояние и бьёт издалека.',
      'Вы выигрываете, если у соперника нет шашек или ходов.',
    ],
  },
}

export const fmt = (s: string, v?: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k: string) => String(v?.[k] ?? ''))