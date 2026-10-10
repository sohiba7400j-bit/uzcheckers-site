import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const reply = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

// Telegram yuborgan ma'lumot haqiqatan Telegram'dan kelganini imzo bilan tekshiradi
function isValid(data, botToken) {
  const { hash, ...rest } = data
  if (typeof hash !== 'string') return false
  const checkString = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join('\n')
  const secret = crypto.createHash('sha256').update(botToken).digest()
  const calc = crypto.createHmac('sha256', secret).update(checkString).digest('hex')
  const a = Buffer.from(calc, 'hex')
  const b = Buffer.from(hash, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export const handler = async event => {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'method-not-allowed' })

  const token = process.env.TELEGRAM_BOT_TOKEN
  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  if (!token || !url || !serviceKey) return reply(500, { error: 'server-not-configured' })

  let data
  try {
    data = JSON.parse(event.body || '{}')
  } catch {
    return reply(400, { error: 'bad-request' })
  }
  if (!data || !data.id || !isValid(data, token)) return reply(401, { error: 'bad-signature' })
  if (Date.now() / 1000 - Number(data.auth_date) > 86400) return reply(401, { error: 'login-expired' })

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const email = `tg${data.id}@telegram.invalid`
  const fullName =
    [data.first_name, data.last_name].filter(Boolean).join(' ') || data.username || 'Telegram'
  const meta = {
    full_name: fullName,
    avatar_url: data.photo_url || null,
    telegram_id: String(data.id),
    telegram_username: data.username || null,
  }

  const created = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: meta,
  })
  if (
    created.error &&
    created.error.code !== 'email_exists' &&
    !/already|registered/i.test(created.error.message)
  ) {
    return reply(500, { error: created.error.message })
  }

  const link = await admin.auth.admin.generateLink({ type: 'magiclink', email })
  if (link.error || !link.data?.properties?.hashed_token) {
    return reply(500, { error: link.error?.message || 'no-token' })
  }
  if (created.error && link.data.user?.id) {
    await admin.auth.admin.updateUserById(link.data.user.id, { user_metadata: meta })
  }

  return reply(200, {
    token_hash: link.data.properties.hashed_token,
    type: link.data.properties.verification_type || 'magiclink',
  })
}