import { useCreateSpaceController } from "../controllers/useCommunityController";
import { Icon } from "./components/Icon";

export function CreateSpacePage() {
  const form = useCreateSpaceController();
  return (
    <div className="spaces-page">
      <a className="button-link topics-back" href="#circles">
        <Icon name="chevron" size={16} /> Your Circles
      </a>
      <header className="page-heading">
        <h1>Make room for connection.</h1>
      </header>
      <form
        className="profile-card community-form"
        onSubmit={(e) => {
          e.preventDefault();
          void form.submit();
        }}
      >
        <label className="field-label" htmlFor="space-name">
          Circle name
        </label>
        <input
          id="space-name"
          autoComplete="off"
          required
          maxLength={80}
          value={form.name}
          onChange={(e) => form.setName(e.target.value)}
          disabled={form.pending}
        />
        <label className="field-label" htmlFor="space-description">
          A little about this Circle
        </label>
        <textarea
          id="space-description"
          rows={4}
          maxLength={500}
          value={form.description}
          onChange={(e) => form.setDescription(e.target.value)}
          disabled={form.pending}
        />
        <p className="privacy-note">
          <Icon name="globe" size={16} /> The name and description appear in
          Explore, including for private Circles. Keep personal details out of
          them.
        </p>
        <fieldset className="question-choices" disabled={form.pending}>
          <legend>Who can join?</legend>
          <label>
            <input
              type="radio"
              name="visibility"
              checked={form.visibility === "public"}
              onChange={() => form.setVisibility("public")}
            />
            <span>
              <strong>Public</strong> · Anyone can join and read approved posts.
            </span>
          </label>
          <label>
            <input
              type="radio"
              name="visibility"
              checked={form.visibility === "private"}
              onChange={() => form.setVisibility("private")}
            />
            <span>
              <strong>Private</strong> · People request access or accept your
              invitation. Only members can read posts.
            </span>
          </label>
        </fieldset>
        {form.error && (
          <p className="form-error" role="alert">
            {form.error}
          </p>
        )}
        <button
          className="button button-primary"
          disabled={form.pending || !form.name.trim()}
        >
          <Icon name="plus" size={18} />{" "}
          {form.pending ? "Creating…" : "Create Circle"}
        </button>
        <p className="field-hint">
          Once it’s created, you can invite members from the Circle overview.
        </p>
      </form>
    </div>
  );
}
