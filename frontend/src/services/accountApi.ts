import { supabase } from './supabase'

export interface AccountProfile { id: string; name: string; location: string; bio: string; avatarPath: string | null }
export interface PrivateQuestion { id: string; title: string; createdAt: string }

const apiUrl = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!supabase) throw new Error('Supabase is not configured for this site.')
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) throw new Error('Please sign in again.')
  const response = await fetch(`${apiUrl}/v1${path}`, { ...init, cache: 'no-store', headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json', ...init.headers } })
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null
    throw new Error(payload?.error?.message ?? 'The request could not be completed. Try again.')
  }
  return response.status === 204 ? undefined as T : ((await response.json()) as { data: T }).data
}

export const getMyProfile = () => request<AccountProfile>('/me')
export const saveMyProfile = (details: Pick<AccountProfile, 'name' | 'location' | 'bio'>) => request<AccountProfile>('/me', { method: 'PATCH', body: JSON.stringify(details) })
export const saveAvatarPath = (path: string) => request<AccountProfile>('/me/avatar', { method: 'PATCH', body: JSON.stringify({ path }) })
export const listMyQuestions = () => request<PrivateQuestion[]>('/soul-questions')
export const createMyQuestion = (text: string, id: string) => request<PrivateQuestion>('/soul-questions', { method: 'POST', body: JSON.stringify({ text, id }) })
export const deleteMyQuestion = (id: string) => request<void>(`/soul-questions/${id}`, { method: 'DELETE' })

export async function uploadAvatar(file: File, userId: string): Promise<AccountProfile> {
  if (!supabase) throw new Error('Supabase is not configured for this site.')
  const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
  const extension = extensions[file.type]
  if (!extension || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPG, PNG, or WebP image under 5 MB.')
  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  const { data: signed, error: signError } = await supabase.storage.from('avatars').createSignedUploadUrl(path)
  if (signError || !signed) throw new Error('Unable to start the upload. Try again.')
  const { error: uploadError } = await supabase.storage.from('avatars').uploadToSignedUrl(path, signed.token, file, { contentType: file.type })
  if (uploadError) throw new Error('Unable to upload your photo. Try again.')
  return saveAvatarPath(path)
}
