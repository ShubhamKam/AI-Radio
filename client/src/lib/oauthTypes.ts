export type OAuthToken = {
  accessToken: string
  refreshToken: string | null
  expiresAtMs: number
  scope?: string
  tokenType?: string
}

export function isExpired(token: OAuthToken | null, skewMs = 30_000): boolean {
  if (!token) return true
  return Date.now() + skewMs >= token.expiresAtMs
}

