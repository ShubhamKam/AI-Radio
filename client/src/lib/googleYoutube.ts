import { Browser } from '@capacitor/browser'
import { CapacitorHttp } from '@capacitor/core'
import { createPkce, randomString } from './pkce'
import { storageGet, storageRemove, storageSet } from './storage'
import type { OAuthToken } from './oauthTypes'
import { isExpired } from './oauthTypes'
import { waitForOAuthCode } from './oauthRedirect'

const TOKEN_KEY = 'ai-radio-cursor.oauth.google.yt.v1'

const REDIRECT_URI = 'airadiocursor://oauth/google'

function clientId(): string {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  if (!id) throw new Error('Missing VITE_GOOGLE_CLIENT_ID')
  return id
}

function formEncode(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}

async function httpPostForm(url: string, body: Record<string, string>) {
  const res = await CapacitorHttp.post({
    url,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: formEncode(body)
  })
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`HTTP ${res.status}: ${typeof res.data === 'string' ? res.data : JSON.stringify(res.data)}`)
  }
  return res.data as unknown
}

async function httpGetJson(url: string, accessToken: string) {
  const res = await CapacitorHttp.get({
    url,
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`HTTP ${res.status}: ${typeof res.data === 'string' ? res.data : JSON.stringify(res.data)}`)
  }
  return res.data as unknown
}

export async function youtubeGetToken(): Promise<OAuthToken | null> {
  const raw = await storageGet(TOKEN_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OAuthToken
  } catch {
    return null
  }
}

async function youtubeSetToken(token: OAuthToken | null): Promise<void> {
  if (!token) {
    await storageRemove(TOKEN_KEY)
    return
  }
  await storageSet(TOKEN_KEY, JSON.stringify(token))
}

export async function youtubeSignOut(): Promise<void> {
  await youtubeSetToken(null)
}

export async function youtubeEnsureValidToken(): Promise<OAuthToken> {
  const existing = await youtubeGetToken()
  if (existing && !isExpired(existing)) return existing
  if (existing?.refreshToken) {
    const data = (await httpPostForm('https://oauth2.googleapis.com/token', {
      grant_type: 'refresh_token',
      refresh_token: existing.refreshToken,
      client_id: clientId()
    })) as GoogleTokenResponse

    const refreshed: OAuthToken = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? existing.refreshToken ?? null,
      expiresAtMs: Date.now() + Number(data.expires_in) * 1000,
      scope: data.scope,
      tokenType: data.token_type
    }
    await youtubeSetToken(refreshed)
    return refreshed
  }
  throw new Error('YouTube not connected')
}

export async function youtubeConnect(): Promise<void> {
  const { verifier, challenge } = await createPkce()
  const state = randomString(16)

  const scope = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'openid',
    'profile'
  ].join(' ')

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId())
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', scope)
  authUrl.searchParams.set('code_challenge', challenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')

  const codePromise = waitForOAuthCode({ providerPath: 'google', state })
  await Browser.open({ url: authUrl.toString(), presentationStyle: 'fullscreen' })
  const { code } = await codePromise

  const data = (await httpPostForm('https://oauth2.googleapis.com/token', {
    grant_type: 'authorization_code',
    code,
    client_id: clientId(),
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier
  })) as GoogleTokenResponse

  const token: OAuthToken = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAtMs: Date.now() + Number(data.expires_in) * 1000,
    scope: data.scope,
    tokenType: data.token_type
  }
  await youtubeSetToken(token)
}

type GoogleTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
}

export type YouTubeFeedItem = {
  id: string
  type: 'video' | 'playlist'
  title: string
  subtitle: string
  imageUrl: string | null
  embedUrl: string
}

type YtThumbs = { high?: { url?: string }; medium?: { url?: string }; default?: { url?: string } }
type YtSnippet = { title?: string; channelTitle?: string; thumbnails?: YtThumbs }

function ytThumb(snippet: YtSnippet | undefined): string | null {
  const t = snippet?.thumbnails
  return t?.high?.url ?? t?.medium?.url ?? t?.default?.url ?? null
}

export async function youtubeSync(): Promise<YouTubeFeedItem[]> {
  const token = await youtubeEnsureValidToken()

  // Playlists owned by the user (first page)
  const playlists = (await httpGetJson(
    'https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=25',
    token.accessToken
  )) as { items?: Array<{ id?: string; snippet?: YtSnippet }> }

  const playlistItems: YouTubeFeedItem[] = (playlists?.items ?? [])
    .filter(Boolean)
    .filter((p): p is { id: string; snippet?: YtSnippet } => typeof p.id === 'string' && p.id.length > 0)
    .map((p) => {
      const id = p.id
      const title = p.snippet?.title ?? 'Playlist'
      const subtitle = p.snippet?.channelTitle ?? 'YouTube'
      return {
        id,
        type: 'playlist',
        title,
        subtitle,
        imageUrl: ytThumb(p.snippet),
        // YouTube doesn't provide a universal playlist embed like Spotify; we can play the first video when selected.
        embedUrl: 'about:blank'
      }
    })

  // Liked videos (often available as a playlist named "Liked videos" in playlists list)
  // Also fetch the user's channel upload playlist and show a few recent videos.
  const channel = (await httpGetJson(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true',
    token.accessToken
  )) as {
    items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>
  }
  const uploadsPlaylistId =
    channel?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null

  const videoItems: YouTubeFeedItem[] = []
  if (uploadsPlaylistId) {
    const uploads = (await httpGetJson(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(
        uploadsPlaylistId
      )}&maxResults=25`,
      token.accessToken
    )) as {
      items?: Array<{ snippet?: YtSnippet; contentDetails?: { videoId?: string } }>
    }

    for (const it of uploads?.items ?? []) {
      const vid = it?.contentDetails?.videoId
      if (!vid) continue
      videoItems.push({
        id: vid,
        type: 'video',
        title: it?.snippet?.title ?? 'Video',
        subtitle: it?.snippet?.channelTitle ?? 'YouTube',
        imageUrl: ytThumb(it?.snippet),
        embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(vid)}?playsinline=1`
      })
    }
  }

  // Note: YouTube watch history is not reliably accessible via YouTube Data API for privacy reasons.
  // “Feed” is approximated via your own uploads + your playlists here.

  const seen = new Set<string>()
  const merged = [...videoItems, ...playlistItems].filter((x) => {
    const key = `${x.type}:${x.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return merged
}

