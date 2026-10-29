import { Suspense } from "react";
import HotelsBrowser from "./HotelsBrowser";

export const metadata = { title: "Hotels — Stayfield" };

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-5 py-16 text-mute">Loading…</div>}>
      <HotelsBrowser />
    </Suspense>
  );
}
