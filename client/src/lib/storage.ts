import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

export async function storageGet(key: string): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    const { value } = await Preferences.get({ key })
    return value ?? null
  }
  return localStorage.getItem(key)
}

export async function storageSet(key: string, value: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key, value })
    return
  }
  localStorage.setItem(key, value)
}

export async function storageRemove(key: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.remove({ key })
    return
  }
  localStorage.removeItem(key)
}

