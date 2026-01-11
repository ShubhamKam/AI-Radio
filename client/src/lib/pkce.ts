import { base64UrlEncode, utf8ToBytes } from './base64url'

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

export function randomString(lengthBytes = 32): string {
  return base64UrlEncode(randomBytes(lengthBytes))
}

export async function sha256Base64Url(value: string): Promise<string> {
  const bytes = utf8ToBytes(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes.buffer as ArrayBuffer)
  return base64UrlEncode(new Uint8Array(digest))
}

export async function createPkce(): Promise<{ verifier: string; challenge: string }> {
  const verifier = randomString(64)
  const challenge = await sha256Base64Url(verifier)
  return { verifier, challenge }
}

