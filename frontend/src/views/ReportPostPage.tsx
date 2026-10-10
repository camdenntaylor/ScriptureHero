import { useState } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import { insights } from '../services/prototypeData'
import { Icon } from './components/Icon'

const REASONS = ['Spam', 'Harassment or hate', 'Inappropriate content', 'Something else'] as const

export function ReportPostPage({ app }: { app: PrototypeController }) {
  const post = insights.find((item) => item.id === app.viewedPostId)
  const [reason, setReason] = useState<(typeof REASONS)[number]>('Spam')
  const [details, setDetails] = useState('')
  const [sent, setSent] = useState(false)

  function submit() {
    setSent(true)
    app.setNotice('Report submitted in this demo. A real moderation team would review it before anything is removed.')
  }

  return (
    <div className="profile-page">
      <a className="button-link topics-back" href={post ? '#post' : '#home'}>
        <Icon name="chevron" size={16} /> {post ? 'Back to insight' : 'Home'}
      </a>
      <header className="page-heading">
        <p className="eyebrow">
          <Icon name="flag" size={16} /> REPORT
        </p>
        <h1>Report this post.</h1>
        <p>Our team reviews every report. Reporting is anonymous to the author.</p>
      </header>
      <section className="profile-card" aria-label="Report this post">
        {sent ? (
          <div className="empty-state">
            <Icon name="check" size={32} />
            <h2>Report submitted.</h2>
            <p>Thank you for helping keep Scripture Hero a safe, uplifting place.</p>
          </div>
        ) : (
          <>
            <h2>Why are you reporting this?</h2>
            <fieldset className="question-choices">
              {REASONS.map((value) => (
                <label key={value}>
                  <input type="radio" name="reason" value={value} checked={reason === value} onChange={() => setReason(value)} />
                  <span>{value}</span>
                </label>
              ))}
            </fieldset>
            <label className="field-label" htmlFor="report-details">
              Details <span className="optional">optional</span>
            </label>
            <textarea id="report-details" rows={4} maxLength={500} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Anything else we should know…" />
            <button className="button button-primary" type="button" onClick={submit}>
              <Icon name="flag" size={17} /> Submit report
            </button>
          </>
        )}
      </section>
    </div>
  )
}
