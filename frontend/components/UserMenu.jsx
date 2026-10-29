"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/lib/auth";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return;
    const away = (e) => !box.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!user) return null;

  const items = [
    { href: "/profile", label: "Update profile", hint: "Photo, name, password" },
    { href: "/my-bookings", label: "My trips", hint: "Upcoming and past stays" },
    user.role === "guest"
      ? { href: "/list-hotel", label: "List your property", hint: "Start hosting guests" }
      : { href: "/dashboard", label: "Host dashboard", hint: "Bookings and your hotels" },
  ];

  return (
    <div ref={box} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 hover:bg-white/10 text-sm"
      >
        <Avatar user={user} size={32} />
        <span className="max-w-[120px] truncate">{user.name.split(" ")[0]}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" className={`transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M2 4.5 6 8.5l4-4" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+10px)] w-72 card !rounded-xl shadow-xl text-ink overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-line">
            <Avatar user={user} size={44} />
            <div className="min-w-0">
              <p className="font-bold truncate">{user.name}</p>
              <p className="text-xs text-mute truncate">{user.email}</p>
            </div>
          </div>
          <div className="py-1.5">
            {items.map((it) => (
              <Link key={it.href} href={it.href} role="menuitem" onClick={() => setOpen(false)} className="block px-4 py-2.5 hover:bg-bg">
                <span className="block text-sm font-semibold">{it.label}</span>
                <span className="block text-xs text-mute">{it.hint}</span>
              </Link>
            ))}
          </div>
          <button
            role="menuitem"
            onClick={() => { setOpen(false); logout(); }}
            className="w-full text-left px-4 py-3 text-sm font-semibold text-bad border-t border-line hover:bg-bg"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
