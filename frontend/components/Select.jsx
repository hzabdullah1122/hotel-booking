"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck } from "./Icons";

const norm = (o) => (typeof o === "string" ? { value: o, label: o } : o);

// Custom dropdown. variant "field" = bordered input look, "bare" = no border (used inside SearchBar)
export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select",
  variant = "field",
  required = false,
  align = "left",
  className = "",
}) {
  const opts = options.map(norm);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef(null);
  const listRef = useRef(null);

  const selected = opts.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (open) {
      const i = opts.findIndex((o) => o.value === value);
      setActive(i >= 0 ? i : 0);
    }
  }, [open]);

  useEffect(() => {
    if (open && listRef.current && active >= 0) {
      listRef.current.children[active]?.scrollIntoView({ block: "nearest" });
    }
  }, [active, open]);

  const pick = (o) => {
    onChange(o.value);
    setOpen(false);
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + d + opts.length) % opts.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) setOpen(true);
      else if (active >= 0) pick(opts[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const trigger =
    variant === "bare"
      ? "w-full flex items-center justify-between gap-2 text-left text-[0.95rem] font-semibold outline-none"
      : `w-full flex items-center justify-between gap-2 text-left bg-white border rounded-[0.6rem] px-3.5 py-[0.7rem] text-[0.92rem] outline-none transition-colors ${
          open ? "border-navy shadow-[0_0_0_3px_rgb(15_27_45/0.08)]" : "border-line hover:border-navy/40"
        }`;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(!open)}
        onKeyDown={onKey}
        className={trigger}
      >
        <span className={`truncate ${selected ? "" : "text-mute font-normal"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 text-mute transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value={value || ""}
          onChange={() => {}}
          className="absolute inset-x-0 bottom-0 h-px opacity-0 pointer-events-none"
        />
      )}

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className={`absolute z-50 mt-2 min-w-full w-max max-w-[280px] max-h-64 overflow-auto bg-white border border-line rounded-xl shadow-xl shadow-navy/15 p-1.5 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {opts.map((o, i) => {
            const isSel = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={isSel}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o)}
                className={`flex items-center justify-between gap-6 px-3 py-2.5 rounded-lg text-sm cursor-pointer ${
                  i === active ? "bg-navy/5" : ""
                } ${isSel ? "font-bold text-navy" : "font-medium"}`}
              >
                {o.label}
                {isSel && <IconCheck width={16} height={16} className="text-amber-dark" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
