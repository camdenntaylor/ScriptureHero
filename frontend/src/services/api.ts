import type { Post } from '../models/post'

const apiUrl = import.meta.env.VITE_API_URL ?? '/api'

export async function getFeed(signal?: AbortSignal): Promise<Post[]> {
  const response = await fetch(`${apiUrl}/posts`, { signal })

  if (!response.ok) {
    throw new Error(`Unable to load the feed (${response.status})`)
  }

  const payload = (await response.json()) as { data: Post[] }
  return payload.data
}
