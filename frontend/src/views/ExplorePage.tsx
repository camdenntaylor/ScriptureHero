import type { PrototypeController } from "../controllers/usePrototypeController";
import { useExploreController } from "../controllers/useCommunityController";
import {
  PersonResult,
  PostResult,
  ResourceState,
  SpaceResult,
} from "./components/CommunityContent";
import { Icon } from "./components/Icon";

export function ExplorePage({ app }: { app: PrototypeController }) {
  const search = useExploreController(app.profile?.id ?? null);
  const users = search.results.items.flatMap((result) => result.users.items);
  const spaces = search.results.items.flatMap((result) => result.spaces.items);
  const posts = search.results.items.flatMap((result) => result.posts.items);
  const count = users.length + spaces.length + posts.length;
  return (
    <div className="explore-page">
      {/* <header className="page-heading">
        <h1>A world of connection</h1>
      </header> */}
      {/* <p className="muted">Look for people, Spaces, and shared insights.</p> */}
      <form
        className="community-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          search.search();
          search.results.refresh();
        }}
      >
        {/* <label className="field-label" htmlFor="explore-search">
          Search the community
        </label> */}
        <div className="community-toolbar">
          <input
            id="explore-search"
            type="search"
            maxLength={100}
            value={search.term}
            onChange={(e) => search.setTerm(e.target.value)}
            placeholder="A name, Space, or word of encouragement"
          />
          <button className="button button-primary" type="submit">
            <Icon name="search" size={18} /> Search
          </button>
        </div>
      </form>
      <div className="feed-tabs community-tabs" aria-label="Search category">
        {(["all", "users", "spaces", "posts"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            className={search.kind === kind ? "active" : ""}
            aria-pressed={search.kind === kind}
            onClick={() => search.setKind(kind)}
          >
            {
              { all: "All", users: "People", spaces: "Spaces", posts: "Posts" }[
                kind
              ]
            }
          </button>
        ))}
      </div>
      {search.submitted === null ? (
        <div className="empty-state">
          <Icon name="search" size={30} />
          <h2>Who or what is on your mind?</h2>
          <p>Enter a search above, or search with an empty field to browse.</p>
        </div>
      ) : (
        <ResourceState
          resource={{
            ...search.results,
            items: count ? search.results.items : [],
          }}
          empty="No matches yet. Try another name or phrase."
        >
          <p className="sr-only" role="status">
            {count} results shown
          </p>
          {users.length > 0 && (
            <section className="community-section" aria-label="People">
              <div className="section-intro">
                <h2>People</h2>
                {search.kind === "all" && (
                  <button
                    className="button-link"
                    onClick={() => search.setKind("users")}
                  >
                    See more people
                  </button>
                )}
              </div>
              <div className="profile-card">
                {users.map((p) => (
                  <PersonResult key={p.id} person={p} />
                ))}
              </div>
            </section>
          )}
          {spaces.length > 0 && (
            <section className="community-section" aria-label="Spaces">
              <div className="section-intro">
                <h2>Spaces</h2>
                {search.kind === "all" && (
                  <button
                    className="button-link"
                    onClick={() => search.setKind("spaces")}
                  >
                    See more Spaces
                  </button>
                )}
              </div>
              <div className="space-grid">
                {spaces.map((s) => (
                  <SpaceResult key={s.id} space={s} />
                ))}
              </div>
            </section>
          )}
          {posts.length > 0 && (
            <section className="community-section" aria-label="Posts">
              <div className="section-intro">
                <h2>Posts</h2>
                {search.kind === "all" && (
                  <button
                    className="button-link"
                    onClick={() => search.setKind("posts")}
                  >
                    See more posts
                  </button>
                )}
              </div>
              <div className="insight-list">
                {posts.map((p) => (
                  <PostResult key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}
        </ResourceState>
      )}
    </div>
  );
}
