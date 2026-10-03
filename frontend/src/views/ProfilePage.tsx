import { useState, type FormEvent } from "react";
import type { PrototypeController } from "../controllers/usePrototypeController";
import { avatarUrl } from "../services/supabase";
import { Icon } from "./components/Icon";

export function ProfilePage({ app }: { app: PrototypeController }) {
  const profile = app.profile!;
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio);
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [error, setError] = useState("");
  const photoUrl = avatarUrl(profile.avatarPath);
  const initials = profile.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      await app.updateProfile({ name, location, bio });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save your profile.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function choosePhoto(file: File) {
    setUploadBusy(true);
    setError("");
    try {
      await app.updatePhoto(file);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to upload your photo.",
      );
    } finally {
      setUploadBusy(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-grid">
        <section className="profile-card" aria-labelledby="details-heading">
          <h2 id="details-heading">Personal details</h2>
          <p>
            Your name, location, bio, and photo are public profile details. Your
            Soul Questions stay separate and private.
          </p>
          <div className="photo-row">
            {photoUrl ? (
              <img
                className="profile-photo"
                src={photoUrl}
                alt="Your profile"
              />
            ) : (
              <span
                className="avatar avatar-gold avatar-large"
                aria-hidden="true"
              >
                {initials}
              </span>
            )}
            <div>
              <label
                className="button button-soft upload-label"
                htmlFor="profile-photo"
              >
                {uploadBusy ? "Uploading…" : "Choose photo"}
              </label>
              <input
                id="profile-photo"
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadBusy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void choosePhoto(file);
                  event.target.value = "";
                }}
              />
              <p className="field-hint">
                JPG, PNG or WebP · up to 5 MB · public
              </p>
            </div>
          </div>
          <form onSubmit={saveDetails}>
            <label className="field-label" htmlFor="profile-name">
              Name
            </label>
            <input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
              autoComplete="name"
            />
            <label className="field-label" htmlFor="profile-location">
              Location <span className="optional">optional</span>
            </label>
            <input
              id="profile-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={80}
              autoComplete="address-level2"
            />
            <label className="field-label" htmlFor="profile-bio">
              About you <span className="optional">optional</span>
            </label>
            <textarea
              id="profile-bio"
              rows={4}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={280}
              placeholder="A little about yourself…"
            />
            <p className="field-hint">{bio.length}/280</p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button button-primary"
              type="submit"
              disabled={busy}
            >
              {busy ? "Saving…" : "Save details"}
            </button>
          </form>
        </section>
        <section
          className="profile-card soul-card"
          aria-labelledby="soul-heading"
        >
          <div className="aside-heading">
            <Icon name="book" size={20} />
            <h2 id="soul-heading">A private place to reflect</h2>
            <Icon name="lock" size={15} />
          </div>
          <p>Record and revisit your Soul Questions in your private space.</p>
          <a className="button button-soft" href="#questions">
            Open Soul Questions <Icon name="arrow" size={17} />
          </a>
        </section>
      </div>
      <button
        className="button-link"
        type="button"
        onClick={() => void app.signOut()}
      >
        Sign out
      </button>
    </div>
  );
}
