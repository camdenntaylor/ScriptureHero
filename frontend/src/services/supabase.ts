import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = url && key && key !== 'your-publishable-key'
  ? createClient(url, key, { auth: { storage: window.sessionStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null

export function avatarUrl(path: string | null): string | null {
  return path && supabase ? supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl : null
}
