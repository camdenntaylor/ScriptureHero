import type { Authenticator } from './auth.js'

interface AuthApi {
  auth: {
    getUser(accessToken: string): Promise<{ data: { user: { id: string } | null }; error: unknown }>
  }
}

// Asks Supabase Auth to validate the access token, so signature, expiry, and
// revocation are all checked by the issuer rather than guessed at here.
export class SupabaseAuthenticator implements Authenticator {
  constructor(private readonly client: AuthApi) {}

  async verify(accessToken: string) {
    try {
      const { data, error } = await this.client.auth.getUser(accessToken)
      return error || !data.user ? null : { id: data.user.id }
    } catch {
      return null
    }
  }
}
