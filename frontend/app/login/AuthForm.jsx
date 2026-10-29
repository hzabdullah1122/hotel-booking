"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { IconCheck } from "@/components/Icons";
import PasswordInput from "@/components/PasswordInput";

export default function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, register } = useAuth();
  const [signup, setSignup] = useState(params.get("mode") === "signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (signup) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      const next = params.get("next") || "";
      // only follow same-site paths, never an external address
      router.push(next.startsWith("/") && !next.startsWith("//") ? next : "/");
    } catch (err) {
      toast.error(err.message, signup ? "Could not create account" : "Could not sign in");
      setBusy(false);
    }
  };

  const lab = "block text-xs font-bold text-mute mb-1.5";

  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-68px)]">
      <div className="hidden lg:flex relative bg-navy text-white p-14 flex-col justify-end">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent" />
        <div className="relative">
          <h2 className="font-display font-extrabold text-4xl leading-tight max-w-md">Your next stay is a few clicks away.</h2>
          <ul className="mt-6 space-y-3 text-white/85">
            {["See live room availability", "Manage all your bookings in one place", "List your own hotel for free"].map((t) => (
              <li key={t} className="flex items-center gap-3"><IconCheck className="text-amber" /> {t}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-14">
        <form onSubmit={submit} className="card w-full max-w-md p-8">
          <h1 className="font-display font-extrabold text-3xl">{signup ? "Create your account" : "Sign in"}</h1>
          <p className="text-sm text-mute mt-2">
            {signup ? "Already registered?" : "New to Stayfield?"}{" "}
            <button type="button" onClick={() => { setSignup(!signup); }} className="font-bold text-navy underline underline-offset-4">
              {signup ? "Sign in" : "Create an account"}
            </button>
          </p>

          <div className="mt-6 space-y-4">
            {signup && (
              <div>
                <label className={lab}>Full name</label>
                <input required minLength={2} className="field" value={form.name} onChange={set("name")} />
              </div>
            )}
            <div>
              <label className={lab}>Email address</label>
              <input required type="email" className="field" value={form.email} onChange={set("email")} />
            </div>
            <div>
              <label className={lab}>Password</label>
              <PasswordInput required minLength={6} autoComplete={signup ? "new-password" : "current-password"} value={form.password} onChange={set("password")} />
            </div>
          </div>

          <button disabled={busy} className="btn btn-amber w-full mt-7 !py-3.5 disabled:opacity-60">
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
