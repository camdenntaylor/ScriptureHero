import { useState, type FormEvent } from "react";
import type { PrototypeController } from "../controllers/usePrototypeController";
import { avatarUrl } from "../services/supabase";
import { Icon } from "./components/Icon";

export function ProfileEditPage({ app }: { app: PrototypeController }) {
  const profile = app.profile!;
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio);
  const [verse, setVerse] = useState(app.favoriteVerse);
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
      app.setFavoriteVerse(verse.trim());
      window.location.hash = "#profile";
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
      <a className="button-link topics-back" href="#profile">
        <Icon name="chevron" size={16} /> Your profile
      </a>
      <header className="page-heading">
        <h1>Edit your profile.</h1>
      </header>
      <section className="profile-card" aria-labelledby="details-heading">
        <h2 id="details-heading">Personal details</h2>
        <p>
          Your name, location, bio, photo, and favorite verse are public
          profile details. Your Soul Questions stay separate and private.
        </p>
        <div className="photo-row">
          {photoUrl ? (
            <img className="profile-photo" src={photoUrl} alt="Your profile" />
          ) : (
            <span className="avatar avatar-gold avatar-large" aria-hidden="true">
              {initials}
            </span>
          )}
          <div>
            <label className="button button-soft upload-label" htmlFor="profile-photo">
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
            <p className="field-hint">JPG, PNG or WebP · up to 5 MB · public</p>
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
          <label className="field-label" htmlFor="profile-verse">
            Favorite scripture verse <span className="optional">optional</span>
          </label>
          <input
            id="profile-verse"
            value={verse}
            onChange={(event) => setVerse(event.target.value)}
            maxLength={120}
            placeholder="John 14:27"
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button button-primary" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save details"}
          </button>
        </form>
      </section>
    </div>
  );
}
