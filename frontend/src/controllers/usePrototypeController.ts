import { useEffect, useRef, useState } from 'react'
import { addToHelplist, getHeroes, screenFromHash, type FeedFilter, type Insight, type Person } from '../models/prototype'
import { insights } from '../services/prototypeData'
import { copyInsight } from '../services/prototypeSharing'
import { createMyQuestion, deleteMyQuestion, getMyProfile, listMyQuestions, saveMyProfile, uploadAvatar, type AccountProfile, type PrivateQuestion } from '../services/accountApi'
import { supabase } from '../services/supabase'

export type PrototypeDialog = { type: 'save'; post: Insight } | { type: 'message'; person: Person; thanks: boolean } | { type: 'share'; post: Insight } | { type: 'compose' } | null

export function usePrototypeController() {
  const [screen, setScreen] = useState(() => screenFromHash(window.location.hash))
  const [saved, setSaved] = useState<{ postId: string; questionId: string }[]>([])
  const [liked, setLiked] = useState<string[]>([])
  const [comments, setComments] = useState<Record<string, string[]>>({})
  const [filter, setFilter] = useState<FeedFilter>('for-you')
  const [dialog, setDialog] = useState<PrototypeDialog>(null)
  const [notice, setNotice] = useState('')
  const [thanked, setThanked] = useState<string[]>([])
  const [drafts, setDrafts] = useState<string[]>([])
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [questions, setQuestions] = useState<PrivateQuestion[]>([])
  const [authLoading, setAuthLoading] = useState(Boolean(supabase))
  const [accountError, setAccountError] = useState('')
  const signedIn = Boolean(profile)
  const loadVersion = useRef(0)

  async function refreshAccount() {
    if (!supabase) { setAuthLoading(false); return }
    const version = ++loadVersion.current
    setAuthLoading(true)
    setProfile(null)
    setQuestions([])
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (version !== loadVersion.current) return
      if (error || !user) { setProfile(null); setQuestions([]); setSaved([]); setAccountError(''); return }
      const [nextProfile, nextQuestions] = await Promise.all([getMyProfile(), listMyQuestions()])
      if (version !== loadVersion.current) return
      setProfile(nextProfile)
      setQuestions(nextQuestions)
      setAccountError('')
    } catch (error) {
      if (version === loadVersion.current) setAccountError(error instanceof Error ? error.message : 'Unable to load your account.')
    } finally { if (version === loadVersion.current) setAuthLoading(false) }
  }

  useEffect(() => {
    void refreshAccount()
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') { ++loadVersion.current; setProfile(null); setQuestions([]); setSaved([]); setDialog(null); setAccountError(''); setAuthLoading(false) }
      if (event === 'SIGNED_IN') window.setTimeout(() => void refreshAccount(), 0)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const navigate = () => {
      // The keyboard skip link moves focus within the current screen.
      if (window.location.hash === '#main-content') return
      const next = screenFromHash(window.location.hash)
      setScreen(next)
      setDialog(null)
    }
    window.addEventListener('hashchange', navigate)
    return () => window.removeEventListener('hashchange', navigate)
  }, [])

  useEffect(() => {
    if (profile && screen === 'login') window.location.hash = '#profile'
  }, [profile, screen])

  useEffect(() => {
    const title = screen === 'welcome' ? 'Learn through connection' : screen === 'home' ? 'Your home' : screen === 'heroes' ? 'Scripture Heroes' : screen === 'profile' && signedIn ? 'Your profile' : screen === 'questions' && signedIn ? 'Your Soul Questions' : 'Sign in'
    document.title = `${title} · Scripture Hero`
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [screen, signedIn])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 6000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const heroes = getHeroes(insights, saved)
  const visiblePosts = filter === 'saved' ? insights.filter(post => saved.some(item => item.postId === post.id)) : insights

  async function signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase is not configured for this site.')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error('Unable to sign in. Check your email and password, then try again.')
    setAuthLoading(true)
    window.location.hash = '#profile'
  }
  async function signUp(email: string, password: string) {
    if (!supabase) throw new Error('Supabase is not configured for this site.')
    const redirectTo = import.meta.env.VITE_AUTH_REDIRECT_URL ?? window.location.origin
    const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
    if (error) throw new Error('Unable to create the account. Check your details and try again.')
    if (data.session) { setAuthLoading(true); window.location.hash = '#profile'; return 'signed-in' as const }
    return 'check-email' as const
  }
  async function signOut() {
    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) { setNotice('Unable to sign out. Try again.'); return }
    }
    ++loadVersion.current
    setProfile(null)
    setQuestions([])
    setSaved([])
    setFilter('for-you')
    setDialog(null)
    setDrafts([])
    setComments({})
    setLiked([])
    setThanked([])
    window.location.hash = '#welcome'
  }
  async function updateProfile(details: Pick<AccountProfile, 'name' | 'location' | 'bio'>) {
    const next = await saveMyProfile(details)
    setProfile(next)
    setNotice('Profile updated.')
  }
  async function updatePhoto(file: File) {
    if (!profile) throw new Error('Please sign in again.')
    const next = await uploadAvatar(file, profile.id)
    setProfile(next)
    setNotice('Profile photo uploaded.')
  }
  async function addQuestion(value: string) {
    const title = value.trim().slice(0, 500)
    if (!profile || !title) throw new Error('Please sign in and enter a question.')
    const next = await createMyQuestion(title, crypto.randomUUID())
    setQuestions(current => [next, ...current])
    setNotice('Soul Question recorded privately.')
  }
  async function removeQuestion(id: string) {
    await deleteMyQuestion(id)
    setQuestions(current => current.filter(question => question.id !== id))
    setSaved(current => current.filter(item => item.questionId !== id))
    setNotice('Soul Question removed.')
  }

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
    if (!profile || !questions.some(question => question.id === questionId)) return
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
  return { screen, profile, questions, authLoading, accountError, refreshAccount, signIn, signUp, signOut, updateProfile, updatePhoto, addQuestion, removeQuestion, saved, liked, comments, filter, setFilter, dialog, setDialog, notice, setNotice, thanked, drafts, heroes, visiblePosts, toggleLike, addComment, save, removeSaved, share, sendDemoMessage, submitDraft }
}

export type PrototypeController = ReturnType<typeof usePrototypeController>
