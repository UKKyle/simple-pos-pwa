export interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
  CMS_POS_INGEST_URL?: string
  POS_INGEST_SECRET?: string
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function sameOrigin(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = request.headers.get('Origin')

  return !origin || origin === requestUrl.origin
}

async function proxyCmsOrder(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405)
  }

  if (!sameOrigin(request)) {
    return json({ ok: false, error: 'Origin not allowed' }, 403)
  }

  const ingestUrl = env.CMS_POS_INGEST_URL || 'https://bakedbymadyv2.mrkyleoreilly.workers.dev/api/pos/orders'
  const secret = env.POS_INGEST_SECRET?.trim()

  if (!secret) {
    return json({ ok: false, error: 'CMS sync is not configured' }, 500)
  }

  const body = await request.text()
  const response = await fetch(ingestUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
      'Origin': new URL(request.url).origin,
    },
    body,
  })

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

    if (url.pathname === '/api/cms-orders') {
      return proxyCmsOrder(request, env)
    }

    return env.ASSETS.fetch(request)
  },
}
