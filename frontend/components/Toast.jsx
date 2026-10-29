"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

const LOOK = {
  error: { bar: "bg-bad", icon: "text-bad bg-bad/10", title: "Something went wrong", ms: 6000 },
  success: { bar: "bg-good", icon: "text-good bg-good/10", title: "Done", ms: 4000 },
  info: { bar: "bg-navy", icon: "text-navy bg-navy/10", title: "Notice", ms: 4500 },
};

const Icon = ({ type }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === "success" && <path d="M5 12.5l4.5 4.5L19 7.5" />}
    {type === "error" && <path d="M7 7l10 10M17 7L7 17" />}
    {type === "info" && <path d="M12 8v.01M12 11v5" />}
  </svg>
);

function ToastItem({ toast, onClose }) {
  const look = LOOK[toast.type];
  const timer = useRef(null);

  const start = useCallback(
    (ms) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(onClose, ms);
    },
    [onClose]
  );
  useEffect(() => {
    start(look.ms);
    return () => clearTimeout(timer.current);
  }, [start, look.ms]);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      onMouseEnter={() => clearTimeout(timer.current)}
      onMouseLeave={() => start(2000)}
      className="toast-in card relative overflow-hidden pl-4 pr-3 py-3.5 flex items-start gap-3"
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${look.bar}`} />
      <span className={`mt-0.5 grid place-items-center w-7 h-7 rounded-full shrink-0 ${look.icon}`}>
        <Icon type={toast.type} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-tight">{toast.title || look.title}</p>
        <p className="text-sm text-mute mt-0.5 leading-snug break-words">{toast.text}</p>
      </div>
      <button onClick={onClose} aria-label="Dismiss" className="p-1 -mr-1 text-mute hover:text-ink">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(1);

  const close = useCallback((id) => setItems((p) => p.filter((t) => t.id !== id)), []);
  const push = useCallback((type, text, title) => {
    if (!text) return;
    const id = nextId.current++;
    // the same message twice in a row is shown once
    setItems((p) => (p.some((t) => t.text === text && t.type === type) ? p : [...p, { id, type, text, title }].slice(-4)));
  }, []);

  const api = useMemo(
    () => ({
      error: (text, title) => push("error", text, title),
      success: (text, title) => push("success", text, title),
      info: (text, title) => push("info", text, title),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed z-[100] top-20 right-4 left-4 sm:left-auto sm:w-[380px] flex flex-col gap-3 pointer-events-none">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onClose={() => close(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
