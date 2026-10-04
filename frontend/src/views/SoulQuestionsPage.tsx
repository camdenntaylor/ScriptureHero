import { useState } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import { Icon } from './components/Icon'

export function SoulQuestionsPage({ app }: { app: PrototypeController }) {
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function record(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setError('')
    try { await app.addQuestion(question); setQuestion('') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to record your question.') }
    finally { setBusy(false) }
  }
  async function remove(id: string) {
    if (!window.confirm('Remove this Soul Question? This cannot be undone.')) return
    setError('')
    try { await app.removeQuestion(id) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to remove your question.') }
  }
  return <div className="questions-page">
    <header className="page-heading"><p className="eyebrow"><Icon name="lock" size={16} /> PRIVATE SPACE</p><h1>Your Soul Questions.</h1><p>Bring what you’re carrying. You can change your mind later.</p></header>
    <section className="profile-card soul-card" aria-label="Your private Soul Questions">
      <p className="privacy-note"><Icon name="lock" size={16} /> Only you can see these questions. They are never shared with post authors or displayed on your profile.</p>
      <form onSubmit={event => void record(event)}>
        <label className="field-label" htmlFor="new-question">What’s on your heart?</label>
        <textarea id="new-question" rows={4} value={question} onChange={event => setQuestion(event.target.value)} maxLength={500} placeholder="Write a question you’re carrying…" required />
        <p className="field-hint">{question.length}/500</p>
        <button className="button button-primary" type="submit" disabled={!question.trim() || busy}><Icon name="plus" size={18} /> {busy ? 'Recording…' : 'Record question'}</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="profile-questions" aria-live="polite">
        {app.questions.length ? <ul>{app.questions.map(item => <li key={item.id}><span className="question-dot" /><p>{item.title}</p><button className="icon-button" type="button" onClick={() => void remove(item.id)} aria-label="Remove this Soul Question"><Icon name="close" size={18} /></button></li>)}</ul> : <div className="empty-state"><Icon name="book" size={27} /><h2>No questions yet.</h2><p>Start with whatever is on your heart.</p></div>}
      </div>
    </section>
    <a className="button-link" href="#profile"><Icon name="arrow" size={17} /> Back to profile</a>
  </div>
}
