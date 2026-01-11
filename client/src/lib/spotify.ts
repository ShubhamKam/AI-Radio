import { Browser } from '@capacitor/browser'
import { CapacitorHttp } from '@capacitor/core'
import { createPkce, randomString } from './pkce'
import { storageGet, storageRemove, storageSet } from './storage'
import type { OAuthToken } from './oauthTypes'
import { isExpired } from './oauthTypes'
import { waitForOAuthCode } from './oauthRedirect'

const TOKEN_KEY = 'ai-radio-cursor.oauth.spotify.v1'

const REDIRECT_URI = 'airadiocursor://oauth/spotify'

function clientId(): string {
  const id = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined
  if (!id) throw new Error('Missing VITE_SPOTIFY_CLIENT_ID')
  return id
}

function formEncode(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}

async function httpPostForm(url: string, body: Record<string, string>) {
  // CapacitorHttp avoids CORS issues on device; in web it still works.
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

export async function spotifyGetToken(): Promise<OAuthToken | null> {
  const raw = await storageGet(TOKEN_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OAuthToken
  } catch {
    return null
  }
}

async function spotifySetToken(token: OAuthToken | null): Promise<void> {
  if (!token) {
    await storageRemove(TOKEN_KEY)
    return
  }
  await storageSet(TOKEN_KEY, JSON.stringify(token))
}

export async function spotifySignOut(): Promise<void> {
  await spotifySetToken(null)
}

export async function spotifyEnsureValidToken(): Promise<OAuthToken> {
  const existing = await spotifyGetToken()
  if (existing && !isExpired(existing)) return existing
  if (existing?.refreshToken) {
    const data = (await httpPostForm('https://accounts.spotify.com/api/token', {
      grant_type: 'refresh_token',
      refresh_token: existing.refreshToken,
      client_id: clientId()
    })) as SpotifyTokenResponse

    const refreshed: OAuthToken = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? existing.refreshToken ?? null,
      expiresAtMs: Date.now() + Number(data.expires_in) * 1000,
      scope: data.scope,
      tokenType: data.token_type
    }
    await spotifySetToken(refreshed)
    return refreshed
  }
  throw new Error('Spotify not connected')
}

export async function spotifyConnect(): Promise<void> {
  const { verifier, challenge } = await createPkce()
  const state = randomString(16)

  const scope = [
    'user-read-email',
    'user-read-private',
    'user-library-read',
    'playlist-read-private',
    'user-read-recently-played',
    'user-top-read'
  ].join(' ')

  const authUrl = new URL('https://accounts.spotify.com/authorize')
  authUrl.searchParams.set('client_id', clientId())
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('code_challenge', challenge)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('scope', scope)
  authUrl.searchParams.set('show_dialog', 'true')

  // Start listening before opening browser
  const codePromise = waitForOAuthCode({ providerPath: 'spotify', state })
  await Browser.open({ url: authUrl.toString(), presentationStyle: 'fullscreen' })
  const { code } = await codePromise

  const data = (await httpPostForm('https://accounts.spotify.com/api/token', {
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: clientId(),
    code_verifier: verifier
  })) as SpotifyTokenResponse

  const token: OAuthToken = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAtMs: Date.now() + Number(data.expires_in) * 1000,
    scope: data.scope,
    tokenType: data.token_type
  }
  await spotifySetToken(token)
}

type SpotifyTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
}

export type SpotifyFeedItem = {
  id: string
  type: 'track' | 'playlist' | 'album'
  title: string
  subtitle: string
  imageUrl: string | null
  embedUrl: string
}

function bestImage(images: Array<{ url: string }> | undefined): string | null {
  if (!images || images.length === 0) return null
  return images[0]?.url ?? null
}

type SpotifyArtist = { name: string }
type SpotifyImages = Array<{ url: string }>
type SpotifyAlbum = { images?: SpotifyImages }
type SpotifyTrack = { id: string; name: string; artists?: SpotifyArtist[]; album?: SpotifyAlbum }
type SpotifyRecentlyPlayedResponse = { items?: Array<{ track?: SpotifyTrack }> }
type SpotifyPlaylist = { id: string; name: string; owner?: { display_name?: string }; images?: SpotifyImages }
type SpotifyPlaylistsResponse = { items?: SpotifyPlaylist[] }
type SpotifySavedAlbumsResponse = { items?: Array<{ album?: { id: string; name: string; artists?: SpotifyArtist[]; images?: SpotifyImages } }> }

export async function spotifySync(): Promise<SpotifyFeedItem[]> {
  const token = await spotifyEnsureValidToken()

  // Recently played
  const recent = (await httpGetJson(
    'https://api.spotify.com/v1/me/player/recently-played?limit=20',
    token.accessToken
  )) as SpotifyRecentlyPlayedResponse
  const recentItems: SpotifyFeedItem[] = (recent.items ?? [])
    .map((it) => it.track)
    .filter((t): t is SpotifyTrack => Boolean(t?.id))
    .map((t) => {
      const id = t.id
      return {
        id,
        type: 'track',
        title: t.name ?? 'Track',
        subtitle: (t.artists ?? []).map((a) => a.name).filter(Boolean).join(', ') || 'Spotify',
        imageUrl: bestImage(t.album?.images),
        embedUrl: `https://open.spotify.com/embed/track/${encodeURIComponent(id)}`
      }
    })

  // User playlists (first page)
  const playlists = (await httpGetJson(
    'https://api.spotify.com/v1/me/playlists?limit=20',
    token.accessToken
  )) as SpotifyPlaylistsResponse
  const playlistItems: SpotifyFeedItem[] = (playlists.items ?? [])
    .filter((p): p is SpotifyPlaylist => Boolean(p?.id))
    .map((p) => {
      const id = p.id
      return {
        id,
        type: 'playlist',
        title: p.name ?? 'Playlist',
        subtitle: p.owner?.display_name ?? 'Spotify',
        imageUrl: bestImage(p.images),
        embedUrl: `https://open.spotify.com/embed/playlist/${encodeURIComponent(id)}`
      }
    })

  // Saved albums (first page)
  const savedAlbums = (await httpGetJson('https://api.spotify.com/v1/me/albums?limit=20', token.accessToken)) as
    | SpotifySavedAlbumsResponse
    | undefined
  const albumItems: SpotifyFeedItem[] = (savedAlbums?.items ?? [])
    .map((it) => it.album)
    .filter((a): a is NonNullable<NonNullable<SpotifySavedAlbumsResponse['items']>[number]['album']> => Boolean(a?.id))
    .map((a) => {
      const id = a.id
      return {
        id,
        type: 'album',
        title: a.name ?? 'Album',
        subtitle: (a.artists ?? []).map((x) => x.name).filter(Boolean).join(', ') || 'Spotify',
        imageUrl: bestImage(a.images),
        embedUrl: `https://open.spotify.com/embed/album/${encodeURIComponent(id)}`
      }
    })

  // De-dupe by (type,id)
  const seen = new Set<string>()
  const merged = [...recentItems, ...playlistItems, ...albumItems].filter((x) => {
    const key = `${x.type}:${x.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return merged
}

