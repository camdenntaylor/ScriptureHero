import type { PrototypeController } from "../../controllers/usePrototypeController";
import { usePagedResource } from "../../controllers/useCommunityController";
import { listProfilePosts } from "../../services/communityApi";
import { PostResult, ResourceState } from "./CommunityContent";

export function OwnPosts({ app }: { app: PrototypeController }) {
  const id = app.profile!.id;
  const posts = usePagedResource(`my-posts:${id}`, (cursor, signal) =>
    listProfilePosts(id, true, cursor, signal),
  );
  return (
    <section className="community-section" aria-label="Your posts">
      <div className="section-intro">
        <h2>Your posts</h2>
        <button className="button-link" onClick={posts.refresh}>
          Refresh posts
        </button>
      </div>
      <p className="muted">
        Revisit what you’ve shared. Unpublished posts are visible only to you.
      </p>
      <ResourceState
        resource={posts}
        empty="You haven’t shared an insight yet."
      >
        <div className="insight-list">
          {posts.items.map((p) => (
            <PostResult key={p.id} post={p} />
          ))}
        </div>
      </ResourceState>
      {app.drafts.length > 0 && (
        <div className="community-section">
          <h3>Submissions from this demo session</h3>
          <p className="field-hint">
            These are held in memory and reset when you reload.
          </p>
          {app.drafts.map((body, index) => (
            <article className="profile-card community-post" key={index}>
              <p className="pending-note">
                Awaiting review · Only you can see this submission
              </p>
              <p className="community-post-body">{body}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
