import type { PrototypeController } from "../controllers/usePrototypeController";
import { usePagedResource } from "../controllers/useCommunityController";
import { listSpaces } from "../services/communityApi";
import { ResourceState, SpaceResult } from "./components/CommunityContent";
import { Icon } from "./components/Icon";

export function SpacesPage({ app }: { app: PrototypeController }) {
  const mine = Boolean(app.profile);
  const spaces = usePagedResource(
    `spaces:${app.profile?.id ?? "visitor"}`,
    (cursor, signal) => listSpaces(mine, cursor, signal),
  );
  return (
    <div className="spaces-page">
      <header className="page-heading">
        <h1>{mine ? "Your spaces" : "Find your circle"}</h1>
      </header>
      <p className="muted">
        Gather with friends, family, or a congregation. Public Spaces welcome
        everyone. Private Space posts are shared only with members.
      </p>
      <div className="community-toolbar">
        <a
          className="button button-primary"
          href={mine ? "#create-space" : "#login"}
        >
          <Icon name="plus" size={18} /> Create a Space
        </a>
        <a className="button button-outline" href="#explore">
          Explore Spaces <Icon name="search" size={18} />
        </a>
      </div>
      <ResourceState resource={spaces} empty="You haven’t joined a Space yet.">
        <div className="space-grid">
          {spaces.items.map((space) => (
            <SpaceResult key={space.id} space={space} />
          ))}
        </div>
      </ResourceState>
    </div>
  );
}
