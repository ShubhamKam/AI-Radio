import { useEffect, useMemo, useState } from 'react'
import './App.css'

import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { storageGet, storageSet } from './lib/storage'
import { spotifyConnect, spotifyGetToken, spotifySignOut, spotifySync, type SpotifyFeedItem } from './lib/spotify'
import { youtubeConnect, youtubeGetToken, youtubeSignOut, youtubeSync, type YouTubeFeedItem } from './lib/googleYoutube'

type FeedPlatform = 'spotify' | 'youtube'

type FeedItem = {
  key: string
  platform: FeedPlatform
  title: string
  subtitle: string
  imageUrl: string | null
  embedUrl: string
}

const FEED_CACHE_KEY = 'ai-radio-cursor.feedCache.v1'

function App() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [youtubeConnected, setYoutubeConnected] = useState(false)

  const [feed, setFeed] = useState<FeedItem[]>([])
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const active = useMemo(() => feed.find((f) => f.key === activeKey) ?? null, [feed, activeKey])

  async function loadConnectionState() {
    const sp = await spotifyGetToken()
    const yt = await youtubeGetToken()
    setSpotifyConnected(Boolean(sp?.accessToken))
    setYoutubeConnected(Boolean(yt?.accessToken))
  }

  async function loadCachedFeed() {
    const raw = await storageGet(FEED_CACHE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as FeedItem[]
      if (Array.isArray(parsed)) {
        setFeed(parsed)
        setActiveKey(parsed[0]?.key ?? null)
      }
    } catch {
      // ignore
    }
  }

  async function syncAll() {
    setError(null)
    setBusy('sync')
    try {
      const merged: FeedItem[] = []

      if (spotifyConnected) {
        const sp: SpotifyFeedItem[] = await spotifySync()
        merged.push(
          ...sp.map((x) => ({
            key: `spotify:${x.type}:${x.id}`,
            platform: 'spotify' as const,
            title: x.title,
            subtitle: x.subtitle,
            imageUrl: x.imageUrl,
            embedUrl: x.embedUrl
          }))
        )
      }

      if (youtubeConnected) {
        const yt: YouTubeFeedItem[] = await youtubeSync()
        merged.push(
          ...yt
            .filter((x) => x.embedUrl !== 'about:blank')
            .map((x) => ({
              key: `youtube:${x.type}:${x.id}`,
              platform: 'youtube' as const,
              title: x.title,
              subtitle: x.subtitle,
              imageUrl: x.imageUrl,
              embedUrl: x.embedUrl
            }))
        )
      }

      setFeed(merged)
      setActiveKey((prev) => prev ?? merged[0]?.key ?? null)
      await storageSet(FEED_CACHE_KEY, JSON.stringify(merged))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  useEffect(() => {
    void (async () => {
      await loadConnectionState()
      await loadCachedFeed()
    })()
  }, [])

  useEffect(() => {
    // Auto-sync on app resume (native)
    if (!Capacitor.isNativePlatform()) return
    let removed = false
    let handle: { remove: () => Promise<void> | void } | null = null

    void CapApp.addListener('resume', () => {
      void loadConnectionState().then(() => void syncAll())
    }).then((h) => {
      if (removed) {
        void h.remove()
        return
      }
      handle = h
    })

    return () => {
      removed = true
      if (handle) void handle.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyConnected, youtubeConnected])

  useEffect(() => {
    // Auto-sync on initial connect state
    if (spotifyConnected || youtubeConnected) void syncAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyConnected, youtubeConnected])

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brandTitle">AI Radio Cursor</div>
          <div className="brandSubtitle">OAuth sync + in-app playback (YouTube / Spotify)</div>
        </div>
      </header>

      <main className="main">
        <section className="panel">
          <h2 className="panelTitle">Accounts</h2>
          <div className="actions">
            <button
              className="button"
              disabled={busy !== null}
              onClick={async () => {
                setError(null)
                setBusy('spotify')
                try {
                  await spotifyConnect()
                  await loadConnectionState()
                } catch (e) {
                  setError(e instanceof Error ? e.message : String(e))
                } finally {
                  setBusy(null)
                }
              }}
            >
              {spotifyConnected ? 'Spotify connected' : 'Connect Spotify'}
            </button>
            <button
              className="buttonSecondary"
              disabled={busy !== null || !spotifyConnected}
              onClick={async () => {
                await spotifySignOut()
                await loadConnectionState()
              }}
            >
              Sign out
            </button>
          </div>
          <div className="actions" style={{ marginTop: 10 }}>
            <button
              className="button"
              disabled={busy !== null}
              onClick={async () => {
                setError(null)
                setBusy('youtube')
                try {
                  await youtubeConnect()
                  await loadConnectionState()
                } catch (e) {
                  setError(e instanceof Error ? e.message : String(e))
                } finally {
                  setBusy(null)
                }
              }}
            >
              {youtubeConnected ? 'YouTube connected' : 'Connect YouTube'}
            </button>
            <button
              className="buttonSecondary"
              disabled={busy !== null || !youtubeConnected}
              onClick={async () => {
                await youtubeSignOut()
                await loadConnectionState()
              }}
            >
              Sign out
            </button>
          </div>

          <h2 className="panelTitle" style={{ marginTop: 18 }}>
            Synced feed
          </h2>
          <div className="actions">
            <button className="button" disabled={busy !== null || (!spotifyConnected && !youtubeConnected)} onClick={syncAll}>
              {busy === 'sync' ? 'Syncing…' : 'Sync now'}
            </button>
            <div className="hint" style={{ marginTop: 0 }}>
              Auto-sync runs on app open / resume.
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}

          {feed.length === 0 ? (
            <div className="empty">
              Connect Spotify/YouTube to automatically pull your content (recently played, playlists, uploads, etc.).
            </div>
          ) : (
            <ul className="list">
              {feed.map((item) => {
                const isActive = item.key === activeKey
                return (
                  <li key={item.key} className={`listItem ${isActive ? 'active' : ''}`}>
                    <button className="listSelect" onClick={() => setActiveKey(item.key)}>
                      <span className={`pill ${item.platform}`}>{item.platform}</span>
                      <span className="itemTitle">{item.title}</span>
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
            <div className="empty">Select an item from your synced feed.</div>
          ) : (
            <>
              <div className="nowPlayingMeta">
                <span className={`pill ${active.platform}`}>{active.platform}</span>
                <span className="nowPlayingTitle">{active.title}</span>
              </div>
              <div className="playerFrame">
                <iframe
                  key={active.key}
                  src={active.embedUrl}
                  title={active.title}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="hint">
                Playback is controlled inside the embedded player (YouTube / Spotify).
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
