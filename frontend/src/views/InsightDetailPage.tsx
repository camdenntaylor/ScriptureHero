import type { PrototypeController } from "../controllers/usePrototypeController";
import { useResource } from "../controllers/useCommunityController";
import { getInsight } from "../services/communityApi";
import { PostResult, ResourceState } from "./components/CommunityContent";
import { Icon } from "./components/Icon";

export function InsightDetailPage({
  id,
  app,
}: {
  id: string;
  app: PrototypeController;
}) {
  const post = useResource(
    `insight:${id}:${app.profile?.id ?? "visitor"}`,
    (signal) => getInsight(id, signal),
  );
  return (
    <div className="profile-page">
      <a className="button-link topics-back" href="#explore">
        <Icon name="chevron" size={16} /> Explore
      </a>
      <header className="page-heading">
        <h1>{post.value?.title ?? "A shared insight."}</h1>
      </header>
      <ResourceState resource={post} empty="This insight is unavailable.">
        {post.value && <PostResult post={post.value} detail />}
      </ResourceState>
    </div>
  );
}
