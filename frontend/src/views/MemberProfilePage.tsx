import type { PrototypeController } from "../controllers/usePrototypeController";
import {
  usePagedResource,
  useResource,
} from "../controllers/useCommunityController";
import { getPublicProfile, listProfilePosts } from "../services/communityApi";
import {
  PersonResult,
  PostResult,
  ResourceState,
} from "./components/CommunityContent";
import { Icon } from "./components/Icon";

export function MemberProfilePage({
  id,
  app,
}: {
  id: string;
  app: PrototypeController;
}) {
  const profile = useResource(`profile:${id}`, (signal) =>
    getPublicProfile(id, signal),
  );
  const posts = usePagedResource(
    `profile-posts:${id}:${app.profile?.id ?? "visitor"}`,
    (cursor, signal) => listProfilePosts(id, false, cursor, signal),
  );
  return (
    <div className="profile-page">
      <a className="button-link topics-back" href="#explore">
        <Icon name="chevron" size={16} /> Explore
      </a>
      <header className="page-heading">
        <h1>{profile.value?.name ?? "Member profile"}</h1>
      </header>
      <ResourceState
        resource={profile}
        empty="This profile could not be found."
      >
        {profile.value && (
          <section className="profile-card">
            <PersonResult person={profile.value} />
            {profile.value.bio && <p>{profile.value.bio}</p>}
            {app.profile?.id === id && (
              <a className="button button-soft" href="#profile">
                Your profile & posts
              </a>
            )}
          </section>
        )}
      </ResourceState>
      {profile.value && (
        <section className="community-section" aria-label="Shared insights">
          <div className="section-intro">
            <h2>Shared insights</h2>
          </div>
          <p className="muted">
            Approved posts from public Spaces and private Spaces you belong to.
          </p>
          <ResourceState resource={posts} empty="No insights to show yet.">
            <div className="insight-list">
              {posts.items.map((p) => (
                <PostResult key={p.id} post={p} />
              ))}
            </div>
          </ResourceState>
        </section>
      )}
    </div>
  );
}
