import type { PrototypeController } from "../../controllers/usePrototypeController";
import { usePostComposerController } from "../../controllers/usePostComposerController";
import { destinationDescription } from "../../models/postDestination";
import { Icon } from "./Icon";
import { useEffect } from "react";

export function ComposePostForm({
  app,
  onPendingChange,
}: {
  app: PrototypeController;
  onPendingChange?: (pending: boolean) => void;
}) {
  const initialSpaceId =
    app.dialog?.type === "compose" ? app.dialog.spaceId : undefined;
  const form = usePostComposerController(
    app.profile?.id ?? null,
    initialSpaceId,
    app.onPostSubmitted,
  );
  useEffect(() => {
    onPendingChange?.(form.pending);
  }, [form.pending, onPendingChange]);
  if (!app.profile)
    return (
      <>
        <p className="modal-description">
          Log in to choose a Space and share your insight.
        </p>
        <a className="button button-primary full-width" href="#login">
          Log in to share
        </a>
      </>
    );
  return (
    <form
      className="post-composer"
      onSubmit={(e) => {
        e.preventDefault();
        void form.submit();
      }}
    >
      <p className="modal-description">
        Share a small moment, a scripture, or something you’re learning.
      </p>
      <label className="field-label" htmlFor="post-space">
        Post to
      </label>
      <select
        id="post-space"
        value={form.selected?.id ?? ""}
        required
        disabled={form.pending}
        aria-describedby="post-destination"
        onChange={(e) => form.setSpaceId(e.target.value)}
      >
        <option value="" disabled>
          Choose a Space
        </option>
        {form.choices.map((space) => (
          <option key={space.id} value={space.id}>
            {space.name} ·{" "}
            {space.visibility === "private" ? "Private" : "Public"}
          </option>
        ))}
      </select>
      <p
        id="post-destination"
        className={
          form.selected?.visibility === "private"
            ? "privacy-note post-destination"
            : "pending-note post-destination"
        }
        role="status"
      >
        <Icon
          name={form.selected?.visibility === "private" ? "lock" : "globe"}
          size={18}
        />
        <span>
          {form.selected
            ? destinationDescription(form.selected)
            : "Choose where this post will go. Each post belongs to one Space."}
        </span>
      </p>
      {(form.spaces.loading || form.context.loading) && (
        <p role="status">Loading your Spaces…</p>
      )}
      {form.spaces.error && (
        <div>
          <p className="form-error" role="alert">
            {form.spaces.error}
          </p>
          <button
            type="button"
            className="button button-outline"
            disabled={form.pending || form.spaces.loading}
            onClick={
              form.spaces.items.length ? form.spaces.more : form.spaces.refresh
            }
          >
            Try loading Spaces again
          </button>
        </div>
      )}
      {form.context.error && !form.selected && (
        <p className="form-error" role="alert">
          Unable to load the original Space. Choose another destination, or
          close this dialog and try again.
        </p>
      )}
      {initialSpaceId &&
        form.context.value &&
        !form.choices.some((s) => s.id === initialSpaceId) && (
          <p className="privacy-note">
            <Icon name="lock" size={16} /> Join this Space before posting here.
            You can choose another Space below.
          </p>
        )}
      {form.spaces.nextCursor && (
        <button
          type="button"
          className="button-link"
          disabled={form.spaces.loading || form.pending}
          onClick={form.spaces.more}
        >
          Load more Spaces
        </button>
      )}
      {!form.spaces.loading && !form.spaces.error && !form.choices.length && (
        <p className="muted">
          No posting destinations are available right now. Join a Space or try
          again.
        </p>
      )}
      <label className="field-label" htmlFor="insight-body">
        Your insight
      </label>
      <textarea
        id="insight-body"
        rows={6}
        maxLength={1500}
        value={form.body}
        disabled={form.pending}
        onChange={(e) => form.setBody(e.target.value)}
        placeholder="Lately, I’ve been learning…"
        required
      />
      <p className="field-hint">{form.body.length}/1500</p>
      <p className="field-hint">
        Your insight will be saved for review. It won’t appear in the Space
        until approved.
      </p>
      {form.error && (
        <p className="form-error" role="alert">
          {form.error} Your text is still here; you can retry.
        </p>
      )}
      {form.pending && (
        <p role="status">Submitting to {form.selected?.name}…</p>
      )}
      <button
        className="button button-primary full-width"
        disabled={form.blocked}
      >
        <Icon name="leaf" size={18} />
        {form.pending
          ? "Submitting…"
          : form.selected
            ? `Submit to ${form.selected.name} for review`
            : "Choose a Space to continue"}
      </button>
    </form>
  );
}
