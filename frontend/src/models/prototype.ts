export type Screen = 'welcome' | 'home' | 'heroes'
export type FeedFilter = 'for-you' | 'saved'
export interface Person { id: string; name: string; location: string; initials: string; color: 'clay' | 'sage' | 'gold' | 'lilac' }
export interface Insight { id: string; author: Person; title: string; body: string; scripture: string; verse: string; time: string; likes: number; comments: { name: string; body: string }[]; video?: string }
export interface SoulQuestion { id: string; title: string; label: string }
export interface SavedInsight { postId: string; questionId: string }
export interface Appreciation { person: Person; quote: string; postTitle: string }

export function addToHelplist(saved: SavedInsight[], postId: string, questionId: string): SavedInsight[] {
  return saved.some(item => item.postId === postId && item.questionId === questionId)
    ? saved
    : [...saved, { postId, questionId }]
}

export function getHeroes(posts: Insight[], saved: SavedInsight[]): Person[] {
  const savedIds = new Set(saved.map(item => item.postId))
  return [...new Map(posts.filter(post => savedIds.has(post.id)).map(post => [post.author.id, post.author])).values()]
}

/** No private question or matching fields belong in a share payload. */
export function publicShareText(post: Insight): string {
  return `${post.title}\n\n${post.body}\n\n${post.scripture}\n— ${post.author.name}, Scripture Hero`
}

export function screenFromHash(hash: string): Screen {
  return hash === '#home' ? 'home' : hash === '#heroes' ? 'heroes' : 'welcome'
}
