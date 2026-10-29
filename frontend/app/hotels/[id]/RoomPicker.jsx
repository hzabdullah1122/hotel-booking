"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { formatPKR } from "@/lib/data";
import { IconBed, IconCheck } from "@/components/Icons";
import DateRange from "@/components/DateRange";

export default function RoomPicker({ hotel, initialIn = "", initialOut = "", onBooked }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const back = encodeURIComponent(pathname + (search ? `?${search}` : ""));
  const [checkIn, setCheckIn] = useState(initialIn);
  const [checkOut, setCheckOut] = useState(initialOut);
  const [guests, setGuests] = useState(2);
  const [picked, setPicked] = useState(null);
  const [booking, setBooking] = useState(null); // confirmed booking from the API
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const hasDates = checkIn && checkOut;
  // availability for the chosen dates; falls back to today's availability
  const { data: avail, reload } = useApi(hasDates ? `/api/hotels/${hotel.id}?in=${checkIn}&out=${checkOut}` : null);
  const roomTypes = (hasDates && avail?.hotel?.roomTypes) || hotel.roomTypes;

  const nights = hasDates ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 0;
  const room = roomTypes.find((r) => r.name === picked);
  const total = room ? room.price * nights : 0;

  const lab = "block text-xs font-bold text-mute mb-1";

  const changeDates = ({ in: i, out: o }) => {
    setCheckIn(i);
    setCheckOut(o);
    setBooking(null);
  };

  const reserve = async () => {
    setBusy(true);
    try {
      const { booking } = await api("/api/bookings", {
        method: "POST",
        body: { hotelId: hotel.id, roomType: room.name, checkIn, checkOut, guests: Number(guests) || 1 },
      });
      setBooking(booking);
      toast.success("The hotel will confirm it shortly.", "Booking request sent");
      reload();
      onBooked?.();
    } catch (e) {
      toast.error(e.message, "Could not book");
      reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5">
      <div className="card p-4 grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className={lab}>Dates</label>
          <DateRange checkIn={checkIn} checkOut={checkOut} onChange={changeDates} />
        </div>
        <div>
          <label className={lab}>Guests</label>
          <input type="number" min={1} max={10} className="field" value={guests} onChange={(e) => setGuests(e.target.value)} />
        </div>
      </div>
      {!hasDates && <p className="text-sm text-mute mt-3">Pick your dates to see exactly which rooms are free.</p>}

      <div className="card mt-4 overflow-hidden divide-y divide-line">
        {roomTypes.map((r) => {
          const out = r.left === 0;
          const active = picked === r.name;
          return (
            <div key={r.name} className={`p-5 grid md:grid-cols-[1fr_auto] gap-4 items-center ${active ? "bg-amber/10" : ""}`}>
              <div>
                <p className="font-display font-bold text-lg">{r.name}</p>
                <p className="flex items-center gap-2 text-sm text-mute mt-1"><IconBed width={16} height={16} /> {[r.beds, r.size].filter(Boolean).join(" · ")}</p>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-good font-semibold">
                  {r.perks.map((p) => (
                    <li key={p} className="flex items-center gap-1"><IconCheck width={14} height={14} /> {p}</li>
                  ))}
                </ul>
              </div>
              <div className="md:text-right flex md:block items-center justify-between gap-4">
                <div>
                  <p className="font-extrabold text-xl">{formatPKR(r.price)}</p>
                  <p className="text-xs text-mute">per night</p>
                  <p className={`text-xs font-bold mt-1 ${out || r.left <= 2 ? "text-bad" : "text-mute"}`}>
                    {out ? "Sold out" : r.left <= 2 ? `Only ${r.left} left` : `${r.left} available`}
                  </p>
                </div>
                <button
                  disabled={out}
                  onClick={() => { setPicked(r.name); setBooking(null); }}
                  className={`btn md:mt-3 ${out ? "bg-line text-mute cursor-not-allowed" : active ? "btn-navy" : "btn-ghost"}`}
                >
                  {out ? "Unavailable" : active ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {room && (
        <div className="card mt-4 p-5">
          {booking ? (
            <div>
              <p className="font-display font-bold text-xl text-good">Booking request sent · {booking.code}</p>
              <p className="text-sm text-mute mt-1">
                {room.name} at {hotel.name}, {booking.nights} {booking.nights === 1 ? "night" : "nights"}, {formatPKR(booking.total)}. The hotel will confirm it shortly. Track it under{" "}
                <Link href="/my-bookings" className="underline font-semibold">My trips</Link>.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold">{room.name}</p>
                  <p className="text-sm text-mute">
                    {nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"} × ${formatPKR(room.price)}` : "Pick your dates to see the total"}
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  {nights > 0 && <p className="font-display font-extrabold text-2xl">{formatPKR(total)}</p>}
                  {user ? (
                    <button disabled={!nights || busy} onClick={reserve} className="btn btn-amber disabled:opacity-40 disabled:cursor-not-allowed">
                      {busy ? "Booking…" : "Reserve now"}
                    </button>
                  ) : (
                    <Link href={`/login?next=${back}`} className="btn btn-navy">Sign in to reserve</Link>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
