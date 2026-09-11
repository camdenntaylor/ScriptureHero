import { useEffect, useState } from 'react'
import { addToHelplist, getHeroes, screenFromHash, type FeedFilter, type Insight, type Person } from '../models/prototype'
import { initialSaved, insights } from '../services/prototypeData'
import { copyInsight } from '../services/prototypeSharing'

export type PrototypeDialog = { type: 'save'; post: Insight } | { type: 'message'; person: Person; thanks: boolean } | { type: 'share'; post: Insight } | { type: 'compose' } | null

export function usePrototypeController() {
  const [screen, setScreen] = useState(() => screenFromHash(window.location.hash))
  const [saved, setSaved] = useState(initialSaved)
  const [liked, setLiked] = useState<string[]>([])
  const [comments, setComments] = useState<Record<string, string[]>>({})
  const [filter, setFilter] = useState<FeedFilter>('for-you')
  const [dialog, setDialog] = useState<PrototypeDialog>(null)
  const [notice, setNotice] = useState('')
  const [thanked, setThanked] = useState<string[]>([])
  const [drafts, setDrafts] = useState<string[]>([])

  useEffect(() => {
    const navigate = () => {
      // The keyboard skip link moves focus within the current screen.
      if (window.location.hash === '#main-content') return
      setScreen(screenFromHash(window.location.hash))
      setDialog(null)
    }
    window.addEventListener('hashchange', navigate)
    return () => window.removeEventListener('hashchange', navigate)
  }, [])

  useEffect(() => {
    const title = screen === 'welcome' ? 'Learn through connection' : screen === 'home' ? 'Your home' : 'Scripture Heroes'
    document.title = `${title} · Scripture Hero`
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [screen])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 6000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const heroes = getHeroes(insights, saved)
  const visiblePosts = filter === 'saved' ? insights.filter(post => saved.some(item => item.postId === post.id)) : insights

  function toggleLike(id: string) {
    setLiked(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }
  function addComment(postId: string, value: string) {
    const body = value.trim()
    if (!body) return
    setComments(current => ({ ...current, [postId]: [...(current[postId] ?? []), body.slice(0, 500)] }))
    setNotice('Comment added to this demo.')
  }
  function save(post: Insight, questionId: string) {
    setSaved(current => addToHelplist(current, post.id, questionId))
    setDialog(null)
    setNotice(`Saved privately. ${post.author.name.split(' ')[0]} is in your Scripture Heroes.`)
  }
  function removeSaved(postId: string) {
    setSaved(current => current.filter(item => item.postId !== postId))
    setNotice('Insight removed from your helplist.')
  }
  async function share(post: Insight) {
    try { await copyInsight(post); setNotice('Insight copied. You can paste it into a message.') }
    catch { setDialog({ type: 'share', post }) }
  }
  function sendDemoMessage(person: Person, thanks: boolean) {
    if (thanks) setThanked(current => current.includes(person.id) ? current : [...current, person.id])
    setDialog(null)
    setNotice(`${thanks ? 'Thank-you' : 'Message'} saved in this demo. Nothing was sent to a real person.`)
  }
  function submitDraft(body: string) {
    if (!body.trim()) return
    setDrafts(current => [...current, body.trim().slice(0, 1500)])
    setDialog(null)
    setNotice('Insight submitted for review in this demo.')
  }
  return { screen, saved, liked, comments, filter, setFilter, dialog, setDialog, notice, setNotice, thanked, drafts, heroes, visiblePosts, toggleLike, addComment, save, removeSaved, share, sendDemoMessage, submitDraft }
}

export type PrototypeController = ReturnType<typeof usePrototypeController>
