"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Sk } from "@/components/Skeleton";

export default function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12 space-y-4" role="status" aria-busy="true" aria-label="Loading">
        <Sk className="h-9 w-64" />
        <Sk className="h-4 w-80 max-w-full" />
        <Sk className="h-56 w-full !rounded-2xl mt-6" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-28 text-center">
        <h1 className="font-display font-extrabold text-3xl">Sign in to continue</h1>
        <p className="text-mute mt-3">You need an account to view this page.</p>
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn btn-amber mt-8">Sign in</Link>
      </div>
    );
  }
  return children;
}
