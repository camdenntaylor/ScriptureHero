import { createGuestSandbox } from './guestSandbox'

let current: ReturnType<typeof createGuestSandbox> | null = null
let avatar: string | null = null

export const guestSession = () => current

export function startGuestSession() {
  endGuestSession()
  current = createGuestSandbox()
  return current
}

export function endGuestSession() {
  if (avatar) URL.revokeObjectURL(avatar)
  avatar = null
  current = null
}

export function guestAvatarUrl(path: string) {
  return current && path === avatar ? avatar : null
}

export function setGuestPhoto(file: File) {
  if (!current) throw new Error('Your guest session has ended. Refresh to start again.')
  if (avatar) URL.revokeObjectURL(avatar)
  avatar = URL.createObjectURL(file)
  return current.setAvatar(avatar)
}
