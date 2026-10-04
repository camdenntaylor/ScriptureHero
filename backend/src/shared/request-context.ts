import { AsyncLocalStorage } from 'node:async_hooks'
import type { SupabaseClient } from '@supabase/supabase-js'

// Per-request state for Supabase repositories. `requireUser` stores the verified
// access token here so database calls run as that user and row level security
// applies. Public routes never get a token and run as `anon`.
export interface RequestContext {
  accessToken?: string
  client?: SupabaseClient
}

export const requestContext = new AsyncLocalStorage<RequestContext>()
