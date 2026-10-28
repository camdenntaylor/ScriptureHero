import type { ReactNode } from "react";
import type {
  Page,
  PublicProfile,
  Space,
  VisiblePost,
} from "../../services/communityApi";
import {
  insightLink,
  profileLink,
  spaceLink,
} from "../../services/communityApi";
import { avatarUrl } from "../../services/supabase";
import { Icon } from "./Icon";

export function PersonResult({ person }: { person: PublicProfile }) {
  const url = avatarUrl(person.avatarPath);
  return (
    <a className="community-person" href={profileLink(person)}>
      {url ? (
        <img className="header-photo" src={url} alt="" loading="lazy" />
      ) : (
        <span className="avatar avatar-sage" aria-hidden="true">
          {person.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((n) => n[0])
            .join("")}
        </span>
      )}
      <span>
        <strong>{person.name}</strong>
        {person.location && <span className="muted">{person.location}</span>}
      </span>
      <Icon name="arrow" size={18} />
    </a>
  );
}
export function SpaceResult({ space }: { space: Space }) {
  return (
    <article className="space-card">
      <div className="space-card-top">
        <span className="space-kind">
          <Icon
            name={space.visibility === "private" ? "lock" : "globe"}
            size={16}
          />{" "}
          {space.visibility === "private" ? "Private Space" : "Public Space"}
        </span>
      </div>
      <h3>
        <a href={spaceLink(space)}>{space.name}</a>
      </h3>
      <p>
        {space.description || "A little circle for uplifting conversation."}
      </p>
      {space.membership !== "none" && (
        <p className="pending-note">
          {space.membership === "active"
            ? "Member"
            : space.membership === "invited"
              ? "You’re invited"
              : "Request pending"}
        </p>
      )}
      <a className="button button-soft" href={spaceLink(space)}>
        View Space <Icon name="arrow" size={17} />
      </a>
    </article>
  );
}
export function PostResult({
  post,
  detail = false,
}: {
  post: VisiblePost;
  detail?: boolean;
}) {
  return (
    <article className="profile-card community-post">
      <div className="community-post-meta">
        <a href={profileLink(post.author)}>{post.author.name}</a>
        <a href={spaceLink(post.space)}>{post.space.name}</a>
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleDateString()}
        </time>
      </div>
      {post.status !== "published" && (
        <p className="pending-note">
          {
            (
              {
                draft: "Draft",
                pending_moderation: "Awaiting review",
                needs_review: "Awaiting review",
                rejected: "Not published",
                hidden: "Hidden",
              } as Record<string, string>
            )[post.status]
          }{" "}
          · Only you can see this post
        </p>
      )}
      {post.title && (
        <h3>
          {detail ? post.title : <a href={insightLink(post)}>{post.title}</a>}
        </h3>
      )}
      <p className={detail ? "community-post-body" : "community-post-preview"}>
        {post.body}
      </p>
      {post.scriptureReference && (
        <blockquote className="scripture-quote">
          <Icon name="book" size={18} />
          <cite>{post.scriptureReference}</cite>
        </blockquote>
      )}
      {!detail && (
        <a className="button-link" href={insightLink(post)}>
          Read insight <Icon name="arrow" size={16} />
        </a>
      )}
    </article>
  );
}
export function ResourceState({
  resource,
  empty,
  children,
}: {
  resource: Pick<Page<unknown>, "items" | "nextCursor"> & {
    loading: boolean;
    error: string;
    more: () => void;
    refresh: () => void;
  };
  empty: string;
  children: ReactNode;
}) {
  return (
    <>
      {children}
      {resource.loading && <p role="status">Loading…</p>}
      {resource.error && (
        <div className="community-feedback">
          <p className="form-error" role="alert">
            {resource.error}
          </p>
          <button
            className="button button-outline"
            onClick={resource.items.length ? resource.more : resource.refresh}
          >
            Try again
          </button>
        </div>
      )}
      {!resource.loading && !resource.error && resource.items.length === 0 && (
        <div className="empty-state">
          <Icon name="leaf" size={28} />
          <h2>{empty}</h2>
        </div>
      )}
      {resource.nextCursor && !resource.error && (
        <button
          className="button button-outline"
          disabled={resource.loading}
          onClick={resource.more}
        >
          Load more
        </button>
      )}
    </>
  );
}
