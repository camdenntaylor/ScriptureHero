import { StaticPage } from './components/StaticPage'

export function AboutPage() {
  return (
    <StaticPage eyebrow="OUR STORY" title="About Scripture Hero.">
      <h2>Teaching the world about Jesus, one verse at a time.</h2>
      <p>
        Scripture Hero is a non-denominational space to share spiritual experiences and find wisdom in the
        experiences of others — open to anyone, from any background or stage of faith.
      </p>
      <p>
        People seeking or sharing spiritual insight often turn to group chats or social media, or wait for
        church — workarounds that interrupt unrelated conversations, feel performative, or delay sharing. We
        built a dedicated, always-available place instead.
      </p>
      <p>
        At the center of it is connection: feeling understood, and learning from people you wouldn't
        otherwise meet. When someone's insight genuinely helps you, you can quietly let them know — becoming
        one of their Scripture Heroes.
      </p>
      <p className="muted">
        This is a class project prototype. Nothing here represents a real company or organization.
      </p>
    </StaticPage>
  )
}
