import { useEffect, useState } from 'react'
import type { Post } from '../models/post'
import { getFeed } from '../services/api'

interface FeedState {
  posts: Post[]
  loading: boolean
  error: string | null
}

export function useFeedController(): FeedState {
  const [state, setState] = useState<FeedState>({ posts: [], loading: true, error: null })

  useEffect(() => {
    const controller = new AbortController()

    void getFeed(controller.signal)
      .then((posts) => setState({ posts, loading: false, error: null }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        const message = error instanceof Error ? error.message : 'Something went wrong'
        setState({ posts: [], loading: false, error: message })
      })

    return () => controller.abort()
  }, [])

  return state
}
