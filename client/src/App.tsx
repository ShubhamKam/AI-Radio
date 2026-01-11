import { useState } from 'react'
import './App.css'

type Platform = 'youtube' | 'spotify'
type SpotifyType = 'track' | 'playlist' | 'album' | 'artist' | 'episode' | 'show'

type MediaItem = {
  id: string
  platform: Platform
  title: string
  addedAt: number
  youtube?: { videoId: string }
  spotify?: { type: SpotifyType; itemId: string }
}

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function youtubeIdFromUrl(raw: string): string | null {
  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '')

    // https://youtu.be/<id>
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id || null
    }

    // https://youtube.com/watch?v=<id>
    if (host.endsWith('youtube.com')) {
      const v = url.searchParams.get('v')
      if (v) return v

      // /shorts/<id>, /embed/<id>
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] === 'shorts' || parts[0] === 'embed') return parts[1] || null
    }

    return null
  } catch {
    return null
  }
}

function spotifyFromUrl(raw: string): { type: SpotifyType; itemId: string } | null {
  // spotify:track:<id>
  if (raw.startsWith('spotify:')) {
    const parts = raw.split(':')
    if (parts.length >= 3) {
      const type = parts[1] as SpotifyType
      const itemId = parts[2]
      if (itemId && ['track', 'playlist', 'album', 'artist', 'episode', 'show'].includes(type))
        return { type, itemId }
    }
    return null
  }

  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '')
    if (!host.endsWith('spotify.com')) return null
    const parts = url.pathname.split('/').filter(Boolean)
    const type = parts[0] as SpotifyType
    const itemId = parts[1]
    if (!itemId) return null
    if (!['track', 'playlist', 'album', 'artist', 'episode', 'show'].includes(type)) return null
    return { type, itemId }
  } catch {
    return null
  }
}

function embedUrl(item: MediaItem): string {
  if (item.platform === 'youtube' && item.youtube) {
    const vid = encodeURIComponent(item.youtube.videoId)
    return `https://www.youtube-nocookie.com/embed/${vid}?playsinline=1`
  }

  if (item.platform === 'spotify' && item.spotify) {
    const type = encodeURIComponent(item.spotify.type)
    const id = encodeURIComponent(item.spotify.itemId)
    return `https://open.spotify.com/embed/${type}/${id}`
  }

  return 'about:blank'
}

function newId(): string {
  // good enough for local-only storage
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const STORAGE_KEY = 'ai-radio-cursor.mediaItems.v1'

function App() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [items, setItems] = useState<MediaItem[]>(() => {
    const parsed = safeParseJson<MediaItem[]>(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(parsed) ? parsed : []
  })

  const [activeId, setActiveId] = useState<string | null>(() => {
    const first = safeParseJson<MediaItem[]>(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(first) && first.length > 0 ? first[0].id : null
  })

  const active = items.find((i) => i.id === activeId) ?? null

  function persist(next: MediaItem[]) {
    setItems(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function addFromUrl() {
    setError(null)

    const trimmed = url.trim()
    if (!trimmed) {
      setError('Paste a YouTube or Spotify URL (or a spotify: URI).')
      return
    }

    const yt = youtubeIdFromUrl(trimmed)
    if (yt) {
      const item: MediaItem = {
        id: newId(),
        platform: 'youtube',
        title: title.trim() || 'YouTube video',
        addedAt: Date.now(),
        youtube: { videoId: yt }
      }
      const next = [item, ...items]
      persist(next)
      setActiveId(item.id)
      setUrl('')
      setTitle('')
      return
    }

    const sp = spotifyFromUrl(trimmed)
    if (sp) {
      const item: MediaItem = {
        id: newId(),
        platform: 'spotify',
        title: title.trim() || `Spotify ${sp.type}`,
        addedAt: Date.now(),
        spotify: { type: sp.type, itemId: sp.itemId }
      }
      const next = [item, ...items]
      persist(next)
      setActiveId(item.id)
      setUrl('')
      setTitle('')
      return
    }

    setError('Could not parse that URL. Try a standard YouTube or open.spotify.com link.')
  }

  function remove(id: string) {
    const next = items.filter((i) => i.id !== id)
    persist(next)
    if (activeId === id) setActiveId(next[0]?.id ?? null)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brandTitle">AI Radio Cursor</div>
          <div className="brandSubtitle">YouTube + Spotify inside one player</div>
        </div>
      </header>

      <main className="main">
        <section className="panel">
          <h2 className="panelTitle">Add content</h2>
          <div className="formRow">
            <label className="label">
              Title (optional)
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Chill mix / My playlist"
              />
            </label>
          </div>
          <div className="formRow">
            <label className="label">
              YouTube / Spotify URL
              <input
                className="input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtu.be/... or https://open.spotify.com/track/..."
              />
            </label>
          </div>
          <div className="actions">
            <button className="button" onClick={addFromUrl}>
              Add to library
            </button>
            <button className="buttonSecondary" onClick={() => persist([])} disabled={items.length === 0}>
              Clear library
            </button>
          </div>
          {error ? <div className="error">{error}</div> : null}

          <h2 className="panelTitle" style={{ marginTop: 18 }}>
            Library
          </h2>
          {items.length === 0 ? (
            <div className="empty">No items yet. Paste a YouTube or Spotify link above.</div>
          ) : (
            <ul className="list">
              {items.map((item) => {
                const isActive = item.id === activeId
                return (
                  <li key={item.id} className={`listItem ${isActive ? 'active' : ''}`}>
                    <button className="listSelect" onClick={() => setActiveId(item.id)}>
                      <span className={`pill ${item.platform}`}>{item.platform}</span>
                      <span className="itemTitle">{item.title}</span>
                    </button>
                    <button className="listDelete" onClick={() => remove(item.id)} aria-label="Remove">
                      ✕
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="panel playerPanel">
          <h2 className="panelTitle">Now playing</h2>
          {!active ? (
            <div className="empty">Select an item from the library.</div>
          ) : (
            <>
              <div className="nowPlayingMeta">
                <span className={`pill ${active.platform}`}>{active.platform}</span>
                <span className="nowPlayingTitle">{active.title}</span>
              </div>
              <div className="playerFrame">
                <iframe
                  key={active.id}
                  src={embedUrl(active)}
                  title={active.title}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="hint">
                Tip: playback is controlled inside the embedded player (YouTube / Spotify).
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
