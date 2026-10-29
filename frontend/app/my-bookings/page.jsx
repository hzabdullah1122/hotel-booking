"use client";

import Link from "next/link";
import { useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { TripsSkeleton } from "@/components/Skeleton";
import { formatPKR, fmtDay } from "@/lib/data";
import { api, imgUrl } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useToast } from "@/components/Toast";
import { IconPin } from "@/components/Icons";

const badge = {
  pending: ["Awaiting confirmation", "bg-amber/20 text-amber-dark"],
  confirmed: ["Confirmed", "bg-good/10 text-good"],
  completed: ["Completed", "bg-line text-mute"],
  cancelled: ["Cancelled", "bg-bad/10 text-bad"],
};

function Trips() {
  const { data, error, loading, reload } = useApi("/api/bookings/mine");
  const toast = useToast();
  const [asking, setAsking] = useState(null); // booking id waiting for a yes / no

  const cancel = async (id) => {
    setAsking(null);
    try {
      await api(`/api/bookings/${id}/status`, { method: "PATCH", body: { status: "cancelled" } });
      toast.success("Your booking was cancelled.", "Booking cancelled");
      reload();
    } catch (e) {
      toast.error(e.message, "Could not cancel");
    }
  };

  if (loading && !data) return <TripsSkeleton />;
  if (error) return <p className="card p-6 mt-8 text-bad">{error}</p>;

  const items = data.items.filter((b) => b.hotel);
  if (!items.length) {
    return (
      <div className="card p-10 mt-8 text-center">
        <p className="font-display font-bold text-xl">No trips yet</p>
        <p className="text-mute mt-2">When you book a stay it will show up here.</p>
        <Link href="/hotels" className="btn btn-amber mt-6">Find a stay</Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {items.map((b) => {
        const [label, cls] = badge[b.displayStatus] || badge.pending;
        const canCancel = (b.status === "pending" || b.status === "confirmed") && new Date(b.checkIn) > new Date();
        return (
          <div key={b.id} className="card overflow-hidden grid sm:grid-cols-[200px_1fr]">
            <div className="h-40 sm:h-full bg-line">
              {b.hotel.images?.[0] && <img src={imgUrl(b.hotel.images[0])} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="p-5 flex flex-wrap justify-between gap-4">
              <div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>{label}</span>
                <Link href={`/hotels/${b.hotel.id}`} className="block font-display font-bold text-xl mt-2 hover:underline">{b.hotel.name}</Link>
                <p className="flex items-center gap-1 text-sm text-mute mt-1"><IconPin width={15} height={15} /> {b.hotel.city}</p>
                <p className="text-sm mt-3">{b.roomType} · {b.guests} {b.guests === 1 ? "guest" : "guests"}</p>
                <p className="text-sm text-mute">{fmtDay(b.checkIn)} → {fmtDay(b.checkOut)} · {b.nights} {b.nights === 1 ? "night" : "nights"}</p>
              </div>
              <div className="text-right flex flex-col justify-between">
                <div>
                  <p className="text-xs text-mute">{b.code}</p>
                  <p className="font-extrabold text-xl mt-1">{formatPKR(b.total)}</p>
                </div>
                {canCancel &&
                  (asking === b.id ? (
                    <span className="text-sm font-bold">
                      Cancel this booking?{" "}
                      <button onClick={() => cancel(b.id)} className="text-bad hover:underline mx-1">Yes</button>
                      <button onClick={() => setAsking(null)} className="text-mute hover:underline">No</button>
                    </span>
                  ) : (
                    <button onClick={() => setAsking(b.id)} className="text-sm font-bold text-bad hover:underline">Cancel booking</button>
                  ))}
                {b.displayStatus === "completed" && (
                  <Link href={`/hotels/${b.hotel.id}#reviews`} className="text-sm font-bold text-navy hover:underline">Write a review</Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MyBookings() {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display font-extrabold text-3xl">My trips</h1>
        <Trips />
      </div>
    </RequireAuth>
  );
}
