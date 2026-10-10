import { StaticPage } from './components/StaticPage'

export function PrivacyPage() {
  return (
    <StaticPage eyebrow="LEGAL" title="Privacy policy.">
      <p className="muted">
        This is a placeholder page for a class project prototype, shown here to demonstrate what a real
        Privacy Policy page would look like. It is not a binding legal document.
      </p>
      <h2>Soul Questions stay private</h2>
      <p>
        Soul Questions are never shown on your profile, in the feed, or to anyone you message. They are
        visible only to you.
      </p>
      <h2>Saves are anonymous to authors</h2>
      <p>
        Saving an insight never notifies its author or reveals your identity. An author only learns who you
        are if you choose to start a conversation with them.
      </p>
      <h2>What we'd collect, if this were real</h2>
      <p>
        Account email, display name, and whatever you choose to post publicly. This prototype's demo data
        resets on reload and is never shared with a third party.
      </p>
    </StaticPage>
  )
}
