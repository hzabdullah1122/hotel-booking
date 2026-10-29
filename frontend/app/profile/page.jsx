"use client";

import { useEffect, useMemo, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Avatar from "@/components/Avatar";
import PasswordInput from "@/components/PasswordInput";
import { shrinkImage } from "@/lib/image";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";

const lab = "block text-xs font-bold text-mute mb-1.5";

function ProfileForm() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [file, setFile] = useState(null);
  const [removed, setRemoved] = useState(false);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const shown = preview ? { ...user, avatar: preview } : removed ? { ...user, avatar: "" } : user;
  const changed = name.trim() !== user.name || !!file || removed;
  const valid = name.trim().length >= 2;

  const pick = async (e) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(picked.type) || picked.size > 15 * 1024 * 1024) {
      toast.error("Use a JPG, PNG or WebP image under 15 MB.", "Photo not added");
      return;
    }
    setFile(await shrinkImage(picked, { maxSide: 512 }));
    setRemoved(false);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      if (file) form.append("avatar", file);
      else if (removed) form.append("removeAvatar", "true");
      const { user: updated } = await api("/api/auth/me", { method: "PATCH", form });
      setUser(updated);
      setName(updated.name);
      setFile(null);
      setRemoved(false);
      toast.success("Your profile was updated.", "Saved");
    } catch (err) {
      toast.error(err.message, "Could not save profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="card p-6 space-y-6">
      <h2 className="font-display font-bold text-xl">Profile</h2>
      <div className="flex items-center gap-5">
        <Avatar user={shown} size={88} />
        <div className="flex flex-wrap gap-3">
          <label className="btn btn-ghost !py-2 cursor-pointer">
            {shown.avatar ? "Change photo" : "Upload photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="sr-only" />
          </label>
          {(shown.avatar || file) && (
            <button type="button" onClick={() => { setFile(null); setRemoved(true); }} className="text-sm font-bold text-bad px-2">
              Remove
            </button>
          )}
        </div>
      </div>
      <div>
        <label className={lab}>Full name</label>
        <input className="field" required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className={lab}>Email</label>
        <input className="field opacity-60" value={user.email} disabled />
      </div>
      <button disabled={!changed || !valid || busy} className="btn btn-amber !px-8 disabled:opacity-40 disabled:cursor-not-allowed">
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/auth/password", { method: "PUT", body: { current: cur, next } });
      setCur("");
      setNext("");
      toast.success("Your password was changed.", "Password updated");
    } catch (err) {
      toast.error(err.message, "Could not change password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="card p-6 space-y-5">
      <h2 className="font-display font-bold text-xl">Change password</h2>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={lab}>Current password</label>
          <PasswordInput required autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} />
        </div>
        <div>
          <label className={lab}>New password (min 6)</label>
          <PasswordInput required minLength={6} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
      </div>
      <button disabled={!cur || next.length < 6 || busy} className="btn btn-navy !px-8 disabled:opacity-40 disabled:cursor-not-allowed">
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <div className="bg-navy text-white">
        <div className="mx-auto max-w-3xl px-5 py-12">
          <h1 className="font-display font-extrabold text-4xl">Your profile</h1>
          <p className="mt-2 text-white/70">Update your photo, name and password.</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-5 py-10 space-y-6">
        <ProfileForm />
        <PasswordForm />
      </div>
    </RequireAuth>
  );
}
