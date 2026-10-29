"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import UserMenu from "@/components/UserMenu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/hotels", label: "Stays" },
    { href: "/list-hotel", label: "List your property" },
    ...(user ? [{ href: "/my-bookings", label: "My trips" }, { href: "/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <header className="bg-navy text-white sticky top-0 z-40">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 h-[68px] flex items-center justify-between">
        <Link href="/" className="font-display text-[1.65rem] font-extrabold tracking-tight">
          stay<span className="text-amber">field</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="px-4 py-2 rounded-full text-sm font-semibold text-white/85 hover:bg-white/10">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link href="/login?mode=signup" className="btn btn-ghost !border-white/60 !text-white hover:!bg-white hover:!text-navy !py-2">Register</Link>
              <Link href="/login" className="btn btn-amber !py-2">Sign in</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 -mr-2" aria-label="Menu" onClick={() => setOpen(!open)}>
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white mb-1.5" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 px-5 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" onClick={() => setOpen(false)}>Update profile</Link>
              <button onClick={() => { logout(); setOpen(false); }} className="text-left text-amber">Sign out</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="text-amber">Sign in / Register</Link>
          )}
        </div>
      )}
    </header>
  );
}
