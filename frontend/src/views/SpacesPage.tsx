import type { PrototypeController } from "../controllers/usePrototypeController";
import { useRef } from 'react';
import { circleTopics, useCirclesController } from "../controllers/useCirclesController";
import { spaceLink } from "../services/communityApi";
import { ResourceState, SpaceResult } from "./components/CommunityContent";
import { Icon } from "./components/Icon";
import { CircleCover } from "./components/CircleCover";

export function SpacesPage({ app }: { app: PrototypeController }) {
  const mine = Boolean(app.profile);
  const state = useCirclesController(app.profile?.id ?? null);
  const results = useRef<HTMLElement>(null);
  return (
    <div className="spaces-page circles-columns">
      <div className="circles-discovery">
      <header className="page-heading">
        <h1>Find your people.</h1>
        <p>Small circles. Meaningful conversations.</p>
      </header>
      <form className="circles-search" role="search" onSubmit={event => { event.preventDefault(); state.search(); }}>
        <label className="sr-only" htmlFor="circles-search">Search circles by interest, practice, or tradition</label>
        <Icon name="search" size={22} />
        <input id="circles-search" type="search" maxLength={100} placeholder="Search by interest, practice, or tradition" value={state.term} onChange={event => state.setTerm(event.target.value)} />
        <button className="icon-button" type="submit" aria-label="Search circles"><Icon name="arrow" size={20} /></button>
      </form>
      <div className="feed-tabs circles-topics" aria-label="Circle interests">
        {circleTopics.map(topic => <button key={topic} className={state.topic === topic ? 'active' : ''} aria-pressed={state.topic === topic} onClick={() => state.chooseTopic(topic)}>{topic}</button>)}
      </div>
      <section className="spaces-banner" aria-label="Connect with your community">
        <img src="/images/community.webp" alt="" width="1200" height="400" />
        <div><h2>You do not have to<br />walk alone.</h2><button className="button button-soft" onClick={() => { results.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); results.current?.focus({ preventScroll: true }); }}>Explore circles <Icon name="arrow" size={18} /></button></div>
      </section>
      <section ref={results} className="circle-results" aria-label="Discover circles" tabIndex={-1}>
      <ResourceState resource={state.circles} empty="No circles found. Try another interest or search.">
        <div className="space-grid">
          {state.circles.items.map((space) => (
            <SpaceResult key={space.id} space={space} />
          ))}
        </div>
      </ResourceState>
      </section>
      </div>
      <aside className="circles-aside" aria-label="Your circles and invitations">
        <section className="your-circles-card">
          <h2>Your circles</h2><p>The communities you’ve joined.</p>
          {mine ? <ResourceState resource={state.mine} empty="Your circle is waiting. Explore a community to join.">
            {state.mine.items.map(circle => <a className="circle-membership" href={spaceLink(circle)} key={circle.id}>
              <CircleCover circle={circle} small />
              <span><strong>{circle.name}</strong><small>{circle.membership === 'active' ? 'Member' : circle.membership === 'invited' ? 'Invitation to review' : 'Request pending'}</small></span>
              <Icon name="chevron" size={17} />
            </a>)}
          </ResourceState> : <a className="button-link" href="#login">Log in to find your circles <Icon name="arrow" size={17} /></a>}
        </section>
        <section className="your-circles-card circle-create-card">
          <Icon name="people" size={28} />
          <h2>A circle of your own.</h2>
          <p>Make room for friends, family, or your faith community.</p>
          <a className="button button-outline" href={mine ? '#create-circle' : '#login'}><Icon name="plus" size={18} /> Create a circle</a>
          <p className="privacy-note"><Icon name="lock" size={15} /> Private circle posts stay with active members.</p>
        </section>
      </aside>
    </div>
  );
}
