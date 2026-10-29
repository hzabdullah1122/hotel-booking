"use client";

import { useEffect, useRef, useState } from "react";
import { IconCalendar } from "./Icons";

const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDay = (s) => {
  const d = parse(s);
  d.setDate(d.getDate() + 1);
  return toISO(d);
};
const fmt = (s) =>
  s ? parse(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "";
const nightsBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);

const WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function Month({ year, month, today, min, checkIn, checkOut, hover, picking, onPick, onHover }) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // week starts Monday
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  // while choosing check-out, preview the stay up to the hovered day
  const end = checkOut || (picking === "out" && checkIn && hover > checkIn ? hover : "");

  return (
    <div>
      <p className="text-center font-display font-bold mb-3">
        {first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
      </p>
      <div className="grid grid-cols-7 text-center text-[0.7rem] font-bold text-mute mb-1">
        {WEEK.map((w) => <span key={w} className="py-1">{w}</span>)}
      </div>
      <div className="grid grid-cols-7" onMouseLeave={() => onHover("")}>
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const iso = toISO(new Date(year, month, d));
          const disabled = iso < min;
          const isStart = iso === checkIn;
          const isEnd = iso === end;
          const inRange = checkIn && end && iso > checkIn && iso < end;

          return (
            <div
              key={i}
              className={`h-10 flex items-center justify-center ${inRange ? "bg-amber/25" : ""} ${
                isStart && end ? "bg-gradient-to-r from-transparent from-50% to-amber/25 to-50%" : ""
              } ${isEnd && checkIn ? "bg-gradient-to-l from-transparent from-50% to-amber/25 to-50%" : ""}`}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(iso)}
                onMouseEnter={() => onHover(iso)}
                className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                  isStart || isEnd
                    ? "bg-navy text-white"
                    : disabled
                    ? "text-mute/40 line-through cursor-not-allowed"
                    : "hover:bg-navy/10"
                } ${iso === today && !(isStart || isEnd) ? "ring-1 ring-navy/40" : ""}`}
              >
                {d}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Check-in and check-out are two separate fields; each opens its own calendar.
export default function DateRange({ checkIn, checkOut, onChange, variant = "field", className = "" }) {
  const [open, setOpen] = useState(null); // null | "in" | "out"
  const [hover, setHover] = useState("");
  const [view, setView] = useState({ y: 0, m: 0 });
  const ref = useRef(null);

  const today = toISO(new Date());
  const now = new Date();
  const minView = now.getFullYear() * 12 + now.getMonth();
  const curView = view.y * 12 + view.m;

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(null);
    };
    const esc = (e) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const showMonth = (iso) => {
    const d = iso ? parse(iso) : new Date();
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const openField = (f) => {
    if (open === f) return setOpen(null);
    // check-out needs a check-in first
    const target = f === "out" && !checkIn ? "in" : f;
    showMonth(target === "in" ? checkIn : checkOut || checkIn);
    setHover("");
    setOpen(target);
  };

  const shift = (n) => {
    const t = curView + n;
    setView({ y: Math.floor(t / 12), m: t % 12 });
  };

  const pick = (iso) => {
    if (open === "in") {
      // keep the old check-out only if it is still after the new check-in
      const keepOut = checkOut && checkOut > iso ? checkOut : "";
      onChange({ in: iso, out: keepOut });
      showMonth(keepOut || iso);
      setHover("");
      setOpen("out"); // jump straight to choosing check-out
    } else {
      onChange({ in: checkIn, out: iso });
      setHover("");
      setOpen(null);
    }
  };

  const min = open === "out" && checkIn ? addDay(checkIn) : today;
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  const lab = "block text-[0.68rem] font-bold uppercase tracking-wider text-mute text-left";
  const val = (v, ph) => (
    <span className={`block text-[0.95rem] font-semibold text-left truncate ${v ? "" : "text-mute font-normal"}`}>
      {v ? fmt(v) : ph}
    </span>
  );

  const trigger = (f) => {
    const active = open === f;
    return variant === "bare"
      ? `w-full text-left outline-none rounded-lg px-1 -mx-1 ${active ? "bg-amber/15" : ""}`
      : `w-full flex items-center gap-3 bg-white border rounded-[0.6rem] px-3.5 py-2.5 outline-none transition-colors ${
          active ? "border-navy shadow-[0_0_0_3px_rgb(15_27_45/0.08)]" : "border-line hover:border-navy/40"
        }`;
  };

  const popup = (
    <div
      role="dialog"
      className="absolute z-50 mt-3 left-0 bg-white border border-line rounded-2xl shadow-2xl shadow-navy/20 p-5 w-[min(340px,calc(100vw-2.5rem))]"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-mute mb-3">
        {open === "in" ? "Select check-in date" : "Select check-out date"}
      </p>
      <div className="relative">
        <button
          type="button"
          aria-label="Previous month"
          disabled={curView <= minView}
          onClick={() => shift(-1)}
          className="absolute left-0 -top-1 z-10 w-8 h-8 rounded-full grid place-items-center hover:bg-navy/10 disabled:opacity-25 disabled:hover:bg-transparent"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>
        </button>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shift(1)}
          className="absolute right-0 -top-1 z-10 w-8 h-8 rounded-full grid place-items-center hover:bg-navy/10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
        </button>
        <Month
          year={view.y}
          month={view.m}
          today={today}
          min={min}
          checkIn={checkIn}
          checkOut={checkOut}
          hover={hover}
          picking={open}
          onPick={pick}
          onHover={setHover}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-3">
        <p className="text-sm text-mute">
          {nights > 0 ? <span className="font-bold text-ink">{nights} {nights === 1 ? "night" : "nights"}</span> : "Pick a date"}
        </p>
        <button
          type="button"
          onClick={() => { onChange({ in: "", out: "" }); setHover(""); setOpen("in"); showMonth(""); }}
          className="text-sm font-bold text-mute hover:text-ink"
        >
          Clear dates
        </button>
      </div>
    </div>
  );

  const field = (f, label, value) => (
    <div className={`relative min-w-0 ${variant === "bare" ? "flex-1" : ""}`}>
      <button type="button" onClick={() => openField(f)} className={trigger(f)} aria-haspopup="dialog" aria-expanded={open === f}>
        {variant === "field" && <IconCalendar width={18} height={18} className="text-mute shrink-0" />}
        <span className="block flex-1 min-w-0">
          <span className={lab}>{label}</span>
          {val(value, "Add date")}
        </span>
      </button>
      {open === f && popup}
    </div>
  );

  return (
    <div ref={ref} className={`${variant === "bare" ? "flex items-center gap-4" : "grid grid-cols-2 gap-3"} ${className}`}>
      {field("in", "Check-in", checkIn)}
      {variant === "bare" && <span className="w-px self-stretch bg-line" />}
      {field("out", "Check-out", checkOut)}
    </div>
  );
}
