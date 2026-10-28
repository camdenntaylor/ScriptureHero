import type { PrototypeController } from "../controllers/usePrototypeController";
import {
  useExploreController,
  useSpaceController,
} from "../controllers/useCommunityController";
import {
  PersonResult,
  PostResult,
  ResourceState,
} from "./components/CommunityContent";
import { Icon } from "./components/Icon";

function InviteMembers({
  space,
}: {
  space: ReturnType<typeof useSpaceController>;
}) {
  const search = useExploreController(space.space.value?.ownerId ?? null);
  const people = search.results.items
    .flatMap((p) => p.users.items)
    .filter((p) => p.id !== space.space.value?.ownerId);
  return (
    <section
      className="profile-card community-section"
      aria-label="Invite members"
    >
      <h2>Invite someone in.</h2>
      <form
        className="community-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          search.setKind("users");
          search.search();
          search.results.refresh();
        }}
      >
        <label className="field-label" htmlFor="invite-name">
          Find a member by name
        </label>
        <div className="community-toolbar">
          <input
            type="search"
            id="invite-name"
            maxLength={100}
            value={search.term}
            onChange={(e) => search.setTerm(e.target.value)}
          />
          <button type="submit" className="button button-outline">
            Find people
          </button>
        </div>
      </form>
      <p className="field-hint">
        Invitations appear on their Spaces page. They choose whether to join.
      </p>
      {search.submitted !== null && (
        <ResourceState
          resource={{ ...search.results, items: people }}
          empty="No other people found. Try another name."
        >
          {people.map((person) => {
            const member = space.members.items.find(
              (m) => m.user.id === person.id,
            );
            return (
              <div className="community-member" key={person.id}>
                <PersonResult person={person} />
                <button
                  className="button button-soft"
                  disabled={
                    space.pending ||
                    member?.status === "active" ||
                    member?.status === "invited"
                  }
                  onClick={() => void space.act("invite", person.id)}
                >
                  {member?.status === "active"
                    ? "Member"
                    : member?.status === "invited"
                      ? "Invited"
                      : "Invite"}
                </button>
              </div>
            );
          })}
        </ResourceState>
      )}
    </section>
  );
}
export function SpaceOverviewPage({
  id,
  app,
}: {
  id: string;
  app: PrototypeController;
}) {
  const state = useSpaceController(id, app.profile?.id ?? null);
  const space = state.space.value;
  return (
    <div className="spaces-page">
      <a className="button-link topics-back" href="#spaces">
        <Icon name="chevron" size={16} /> Spaces
      </a>
      <header className="page-heading">
        <h1>{space?.name ?? "A place to connect."}</h1>
      </header>
      <ResourceState
        resource={state.space}
        empty="This Space could not be found."
      >
        {space && (
          <>
            <section className="profile-card community-section">
              <p className="space-kind">
                <Icon
                  name={space.visibility === "private" ? "lock" : "globe"}
                  size={17}
                />{" "}
                {space.visibility === "private"
                  ? "Private Space"
                  : "Public Space"}
              </p>
              <p>
                {space.description ||
                  "A little circle for uplifting conversation."}
              </p>
              <p
                className={
                  space.visibility === "private" ? "privacy-note" : "muted"
                }
              >
                {space.visibility === "private"
                  ? "Only members can read posts. The owner reviews requests to join."
                  : "Anyone can read approved posts and join this Space."}
              </p>
              {!app.profile ? (
                <a className="button button-primary" href="#login">
                  Log in to join
                </a>
              ) : space.membership === "active" ? (
                <p className="pending-note">
                  <Icon name="check" size={17} />{" "}
                  {state.owner ? "You own this Space." : "You’re a member."}
                </p>
              ) : space.membership === "requested" ? (
                <div className="community-toolbar">
                  <p className="pending-note">
                    Your request is waiting for the owner.
                  </p>
                  <button
                    className="button button-outline"
                    disabled={state.pending}
                    onClick={() => void state.act("decline")}
                  >
                    Cancel request
                  </button>
                </div>
              ) : space.membership === "invited" ? (
                <div className="community-toolbar">
                  <button
                    className="button button-primary"
                    disabled={state.pending}
                    onClick={() => void state.act("accept")}
                  >
                    Accept invitation
                  </button>
                  <button
                    className="button button-outline"
                    disabled={state.pending}
                    onClick={() => void state.act("decline")}
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <button
                  className="button button-primary"
                  disabled={state.pending}
                  onClick={() => void state.act("join")}
                >
                  {state.pending
                    ? "Sending…"
                    : space.visibility === "private"
                      ? "Request to join"
                      : "Join Space"}
                </button>
              )}
              {state.pending && <p role="status">Updating membership…</p>}
            </section>
            {state.error && (
              <p className="form-error" role="alert">
                {state.error}
              </p>
            )}
            {state.notice && (
              <p className="pending-note" role="status">
                {state.notice}
              </p>
            )}
            {state.owner && (
              <>
                <InviteMembers space={state} />
                <section
                  className="profile-card community-section"
                  aria-label="Manage members"
                >
                  <h2>Members & requests</h2>
                  <ResourceState
                    resource={state.members}
                    empty="No members or requests yet."
                  >
                    {state.members.items.map((member) => (
                      <div className="community-member" key={member.user.id}>
                        <PersonResult person={member.user} />
                        <span className="muted">
                          {member.status === "active"
                            ? "Member"
                            : member.status === "invited"
                              ? "Invited"
                              : "Wants to join"}
                        </span>
                        {member.status === "requested" && (
                          <button
                            className="button button-soft"
                            disabled={state.pending}
                            onClick={() =>
                              void state.act("approve", member.user.id)
                            }
                          >
                            Approve
                          </button>
                        )}
                        {member.status !== "active" && (
                          <button
                            className="button button-outline"
                            disabled={state.pending}
                            onClick={() =>
                              void state.act("decline", member.user.id)
                            }
                          >
                            {member.status === "invited"
                              ? "Cancel invite"
                              : "Decline"}
                          </button>
                        )}
                      </div>
                    ))}
                  </ResourceState>
                </section>
              </>
            )}
            {state.canRead && (
              <section className="community-section" aria-label="Space posts">
                <div className="section-intro">
                  <h2>Shared in this Space</h2>
                </div>
                <ResourceState
                  resource={state.posts}
                  empty="Nothing shared here yet."
                >
                  <div className="insight-list">
                    {state.posts.items.map((p) => (
                      <PostResult key={p.id} post={p} />
                    ))}
                  </div>
                </ResourceState>
              </section>
            )}
          </>
        )}
      </ResourceState>
    </div>
  );
}
