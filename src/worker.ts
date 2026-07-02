export interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
  CMS_WORKER?: {
    fetch(request: Request): Promise<Response>
  }
  CMS_POS_INGEST_URL?: string
  POS_INGEST_SECRET?: string
}

const POS_SESSION_COOKIE = 'bbm_pos_session'
const POS_SESSION_TTL_SECONDS = 60 * 60 * 12
const encoder = new TextEncoder()

function json(data: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  })
}

function base64UrlEncode(input: ArrayBuffer | string) {
  const bytes = typeof input === 'string' ? encoder.encode(input) : new Uint8Array(input)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

function base64UrlDecode(input: string) {
  const padded = input.replaceAll('-', '+').replaceAll('_', '/') + '==='.slice((input.length + 3) % 4)

  return atob(padded)
}

async function hmacSha256(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value))

  return base64UrlEncode(signature)
}

function timingSafeEqual(left: string, right: string) {
  const maxLength = Math.max(left.length, right.length)
  let mismatch = left.length ^ right.length

  for (let index = 0; index < maxLength; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0)
  }

  return mismatch === 0
}

function readCookie(request: Request, name: string) {
  const cookies = request.headers.get('Cookie') ?? ''
  const match = cookies
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))

  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined
}

function sameOrigin(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = request.headers.get('Origin')

  return !origin || origin === requestUrl.origin
}

function getSecret(env: Env) {
  return env.POS_INGEST_SECRET?.trim() || ''
}

function cookieAttributes(request: Request, maxAge: number) {
  const url = new URL(request.url)
  const parts = [
    `${POS_SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
  ]

  if (url.protocol === 'https:') {
    parts.push('Secure')
  }

  return parts
}

async function createPosSessionCookie(request: Request, env: Env) {
  const secret = getSecret(env)

  if (!secret) {
    throw new Error('POS session signing is not configured')
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = base64UrlEncode(JSON.stringify({
    iat: now,
    exp: now + POS_SESSION_TTL_SECONDS,
  }))
  const signature = await hmacSha256(payload, secret)
  const parts = cookieAttributes(request, POS_SESSION_TTL_SECONDS)
  parts[0] = `${POS_SESSION_COOKIE}=${encodeURIComponent(`${payload}.${signature}`)}`

  return parts.join('; ')
}

function clearPosSessionCookie(request: Request) {
  return cookieAttributes(request, 0).join('; ')
}

async function hasValidPosSession(request: Request, env: Env) {
  const secret = getSecret(env)
  const cookie = readCookie(request, POS_SESSION_COOKIE)

  if (!secret || !cookie) {
    return false
  }

  const [payload, signature] = cookie.split('.')

  if (!payload || !signature) {
    return false
  }

  const expectedSignature = await hmacSha256(payload, secret)

  if (!timingSafeEqual(signature, expectedSignature)) {
    return false
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as { exp?: unknown }
    const exp = typeof decoded.exp === 'number' ? decoded.exp : 0

    return exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

async function fetchCms(request: Request, env: Env) {
  return env.CMS_WORKER
    ? env.CMS_WORKER.fetch(request)
    : fetch(request)
}

function cmsAccessRequest(request: Request, env: Env, init?: RequestInit) {
  const ingestUrl = env.CMS_POS_INGEST_URL || 'https://bakedbymadyv2.mrkyleoreilly.workers.dev/api/pos/orders'
  const url = env.CMS_WORKER
    ? 'https://cms.internal/api/pos/access'
    : new URL('/api/pos/access', ingestUrl).toString()
  const secret = getSecret(env)

  return new Request(url, {
    ...init,
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'application/json',
      'Origin': new URL(request.url).origin,
      ...init?.headers,
    },
  })
}

function cmsProductsRequest(request: Request, env: Env) {
  const ingestUrl = env.CMS_POS_INGEST_URL || 'https://bakedbymadyv2.mrkyleoreilly.workers.dev/api/pos/orders'
  const url = env.CMS_WORKER
    ? 'https://cms.internal/api/pos/products'
    : new URL('/api/pos/products', ingestUrl).toString()
  const secret = getSecret(env)

  return new Request(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Origin': new URL(request.url).origin,
    },
  })
}

async function getPosAccessStatus(request: Request, env: Env) {
  const secret = getSecret(env)
  const unlocked = await hasValidPosSession(request, env)

  if (!secret) {
    return json({ ok: false, configured: false, unlocked: false, error: 'POS access is not configured' }, 500)
  }

  const response = await fetchCms(cmsAccessRequest(request, env, { method: 'GET' }), env)
  const data = await response.json().catch(() => null) as { configured?: boolean; updatedAt?: string; error?: string } | null

  if (!response.ok || !data) {
    return json({ ok: false, configured: false, unlocked: false, error: data?.error || 'POS access status unavailable' }, response.status || 502)
  }

  return json({
    ok: true,
    configured: Boolean(data.configured),
    updatedAt: data.updatedAt,
    unlocked: Boolean(data.configured && unlocked),
  })
}

async function unlockPos(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405)
  }

  if (!sameOrigin(request)) {
    return json({ ok: false, error: 'Origin not allowed' }, 403)
  }

  let payload: { pin?: unknown }

  try {
    payload = await request.json() as { pin?: unknown }
  } catch {
    return json({ ok: false, error: 'Invalid PIN request' }, 400)
  }

  const pin = String(payload.pin ?? '').trim()

  if (!/^\d{6}$/.test(pin)) {
    return json({ ok: false, error: 'Enter a 6 digit PIN' }, 400)
  }

  const response = await fetchCms(cmsAccessRequest(request, env, {
    method: 'POST',
    body: JSON.stringify({ pin }),
  }), env)
  const data = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null

  if (!response.ok || !data?.ok) {
    return json({ ok: false, error: data?.error || 'Invalid PIN' }, 401)
  }

  return json({ ok: true, unlocked: true }, 200, {
    'Set-Cookie': await createPosSessionCookie(request, env),
  })
}

async function lockPos(request: Request) {
  return json({ ok: true, unlocked: false }, 200, {
    'Set-Cookie': clearPosSessionCookie(request),
  })
}

async function proxyCmsOrder(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405)
  }

  if (!sameOrigin(request)) {
    return json({ ok: false, error: 'Origin not allowed' }, 403)
  }

  if (!(await hasValidPosSession(request, env))) {
    return json({ ok: false, error: 'POS is locked' }, 401)
  }

  const ingestUrl = env.CMS_POS_INGEST_URL || 'https://bakedbymadyv2.mrkyleoreilly.workers.dev/api/pos/orders'
  const secret = getSecret(env)

  if (!secret) {
    return json({ ok: false, error: 'CMS sync is not configured' }, 500)
  }

  const body = await request.text()
  const cmsRequestUrl = env.CMS_WORKER ? 'https://cms.internal/api/pos/orders' : ingestUrl
  const cmsRequest = new Request(cmsRequestUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
      'Origin': new URL(request.url).origin,
    },
    body,
  })
  const response = await fetchCms(cmsRequest, env)

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

async function proxyCmsProducts(request: Request, env: Env) {
  if (request.method !== 'GET') {
    return json({ ok: false, error: 'Method not allowed' }, 405)
  }

  if (!(await hasValidPosSession(request, env))) {
    return json({ ok: false, error: 'POS is locked' }, 401)
  }

  const response = await fetchCms(cmsProductsRequest(request, env), env)

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/pos-session') {
      if (request.method === 'GET') {
        return getPosAccessStatus(request, env)
      }

      if (request.method === 'POST') {
        return unlockPos(request, env)
      }

      if (request.method === 'DELETE') {
        return lockPos(request)
      }

      return json({ ok: false, error: 'Method not allowed' }, 405)
    }

    if (url.pathname === '/api/cms-orders') {
      return proxyCmsOrder(request, env)
    }

    if (url.pathname === '/api/pos-products') {
      return proxyCmsProducts(request, env)
    }

    return env.ASSETS.fetch(request)
  },
}
