import { Fragment } from 'react'
import { StaticPage } from './components/StaticPage'

const faqs: { question: string; answer: string }[] = [
  {
    question: 'How do I save an insight?',
    answer:
      'Tap "Add to helplist" on any insight, then choose which Soul Question it helped with. You\'ll need to be signed in and have at least one Soul Question recorded first.',
  },
  {
    question: 'Will the author know I saved their insight?',
    answer:
      "No. Saving is private. The author only learns you exist if you choose to start a conversation with them from your Scripture Heroes list.",
  },
  {
    question: 'Are my Soul Questions ever shown to anyone?',
    answer:
      'Never. Soul Questions are only visible to you, in your own private space. They are never shown on your profile, in the feed, or to anyone you message.',
  },
  {
    question: 'How do Spaces work?',
    answer:
      'A Space is a smaller circle within Scripture Hero — a congregation, a family, a group of friends. Posts shared in a Space are only visible to that Space\'s members, unlike the Global feed.',
  },
  {
    question: "I don't know what to write about. Where do I start?",
    answer:
      'Visit the Questions Library for common prompts other people start with, or just browse Topics on Home for insights related to what you\'re feeling.',
  },
]

export function HelpPage() {
  return (
    <StaticPage eyebrow="SUPPORT" title="Help & support.">
      {faqs.map((item) => (
        <Fragment key={item.question}>
          <h2>{item.question}</h2>
          <p>{item.answer}</p>
        </Fragment>
      ))}
    </StaticPage>
  )
}
