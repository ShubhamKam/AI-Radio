import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'

type Pending = {
  providerPath: string
  state: string
  resolve: (result: { code: string }) => void
  reject: (err: Error) => void
  timeoutId: number
}

let listening = false
let pending: Pending | null = null

function ensureListener() {
  if (listening) return
  listening = true

  App.addListener('appUrlOpen', async ({ url }) => {
    if (!pending) return

    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return
    }

    // expecting: airadiocursor://oauth/<provider>?code=...&state=...
    if (parsed.protocol !== 'airadiocursor:') return
    if (parsed.hostname !== 'oauth') return
    if (parsed.pathname !== `/${pending.providerPath}`) return

    const code = parsed.searchParams.get('code')
    const state = parsed.searchParams.get('state')
    const error = parsed.searchParams.get('error')

    if (state !== pending.state) return

    window.clearTimeout(pending.timeoutId)
    const done = pending
    pending = null

    try {
      // Close in-app browser if still open
      await Browser.close()
    } catch {
      // ignore
    }

    if (error) {
      done.reject(new Error(error))
      return
    }

    if (!code) {
      done.reject(new Error('Missing OAuth code'))
      return
    }

    done.resolve({ code })
  })
}

export async function waitForOAuthCode(opts: {
  providerPath: 'spotify' | 'google'
  state: string
  timeoutMs?: number
}): Promise<{ code: string }> {
  ensureListener()

  if (pending) throw new Error('Another OAuth flow is already in progress')

  const timeoutMs = opts.timeoutMs ?? 2 * 60_000

  return await new Promise<{ code: string }>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      pending = null
      reject(new Error('OAuth timed out'))
    }, timeoutMs)

    pending = {
      providerPath: opts.providerPath,
      state: opts.state,
      resolve,
      reject,
      timeoutId
    }
  })
}

