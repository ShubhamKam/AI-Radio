import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/api/integrations/spotify/callback';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export function getSpotifyAuthUrl(userId: string): string {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID || '',
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: scopes,
    state: userId,
  });

  return `${SPOTIFY_AUTH_URL}?${params}`;
}

export async function handleSpotifyCallback(code: string, userId: string): Promise<void> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Spotify code for token');
  }

  const data = await response.json();

  await prisma.user.update({
    where: { id: userId },
    data: {
      spotifyToken: data.access_token,
      spotifyRefresh: data.refresh_token,
    },
  });
}

export async function refreshSpotifyToken(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { spotifyRefresh: true },
  });

  if (!user?.spotifyRefresh || !SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return null;
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: user.spotifyRefresh,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  await prisma.user.update({
    where: { id: userId },
    data: {
      spotifyToken: data.access_token,
    },
  });

  return data.access_token;
}

export async function searchSpotify(
  query: string,
  type: string = 'track',
  accessToken: string
): Promise<any> {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/search?${new URLSearchParams({
      q: query,
      type,
      limit: '20',
    })}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Spotify search failed');
  }

  const data = await response.json();

  if (type === 'track' && data.tracks) {
    return {
      tracks: data.tracks.items.map((track: any) => ({
        id: track.id,
        sourceId: track.id,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album?.name,
        thumbnail: track.album?.images?.[0]?.url,
        duration: Math.floor(track.duration_ms / 1000),
        source: 'spotify',
      })),
    };
  }

  return data;
}

export async function getSpotifyPlaylists(accessToken: string): Promise<any[]> {
  const response = await fetch(`${SPOTIFY_API_BASE}/me/playlists?limit=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Spotify playlists');
  }

  const data = await response.json();

  return data.items.map((playlist: any) => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    thumbnail: playlist.images?.[0]?.url,
    trackCount: playlist.tracks?.total || 0,
    source: 'spotify',
  }));
}

export async function getSpotifyTrack(trackId: string, accessToken: string): Promise<any> {
  const response = await fetch(`${SPOTIFY_API_BASE}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Spotify track');
  }

  const track = await response.json();

  return {
    id: track.id,
    sourceId: track.id,
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(', '),
    album: track.album?.name,
    thumbnail: track.album?.images?.[0]?.url,
    duration: Math.floor(track.duration_ms / 1000),
    source: 'spotify',
  };
}
