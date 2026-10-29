"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cities } from "@/lib/data";
import Select from "./Select";
import DateRange from "./DateRange";
import { IconPin, IconCalendar, IconUser, IconSearch } from "./Icons";

export default function SearchBar({ compact = false, initial = {} }) {
  const router = useRouter();
  const [city, setCity] = useState(initial.city || "");
  const [checkIn, setCheckIn] = useState(initial.in || "");
  const [checkOut, setCheckOut] = useState(initial.out || "");
  const [guests, setGuests] = useState(initial.guests || 2);

  const submit = (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (city) q.set("city", city);
    if (checkIn) q.set("in", checkIn);
    if (checkOut) q.set("out", checkOut);
    q.set("guests", guests);
    router.push(`/hotels?${q.toString()}`);
  };

  const cell = "flex items-center gap-3 px-4 sm:px-5 py-3.5 rounded-xl hover:bg-bg/70 transition-colors";
  const lab = "block text-[0.68rem] font-bold uppercase tracking-wider text-mute";
  const inp = "w-full bg-transparent outline-none text-[0.95rem] font-semibold";

  return (
    <form
      onSubmit={submit}
      className="grid gap-1 md:gap-0 md:grid-cols-[1.3fr_1.7fr_0.7fr_auto] items-center bg-white p-2 rounded-2xl border border-line shadow-2xl shadow-navy/25"
    >
      <div className={cell}>
        <IconPin className="text-amber-dark shrink-0" />
        <div className="flex-1">
          <label className={lab}>Destination</label>
          <Select
            variant="bare"
            value={city}
            onChange={setCity}
            options={[{ value: "", label: "Anywhere" }, ...cities]}
          />
        </div>
      </div>
      <div className={`${cell} md:border-l md:border-line`}>
        <IconCalendar className="text-amber-dark shrink-0" />
        <DateRange
          variant="bare"
          className="flex-1"
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={({ in: i, out: o }) => { setCheckIn(i); setCheckOut(o); }}
        />
      </div>
      <div className={`${cell} md:border-l md:border-line`}>
        <IconUser className="text-amber-dark shrink-0" />
        <div className="flex-1">
          <label className={lab}>Guests</label>
          <input type="number" min={1} max={10} value={guests} onChange={(e) => setGuests(e.target.value)} className={inp} />
        </div>
      </div>
      <button className="flex items-center justify-center gap-2 bg-amber text-navy font-bold px-8 py-4 rounded-xl md:ml-2 mt-1 md:mt-0 hover:bg-amber-dark transition-colors">
        <IconSearch /> Search
      </button>
    </form>
  );
}
