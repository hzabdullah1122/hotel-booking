"use client";

import Link from "next/link";
import { useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { DashboardSkeleton } from "@/components/Skeleton";
import Select from "@/components/Select";
import { formatPKR, fmtDay } from "@/lib/data";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useToast } from "@/components/Toast";
import { IconGrid, IconBed, IconCalendar, IconPlus } from "@/components/Icons";

const statusStyle = {
  confirmed: "bg-good/10 text-good",
  pending: "bg-amber/20 text-amber-dark",
  completed: "bg-line text-mute",
  cancelled: "bg-bad/10 text-bad",
};

function HotelRooms({ hotel, onChanged }) {
  const toast = useToast();
  const [edit, setEdit] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  const call = async (fn, done) => {
    setBusy(true);
    try {
      await fn();
      if (done) toast.success(done, "Saved");
      onChanged();
    } catch (e) {
      toast.error(e.message, "Could not save");
    } finally {
      setBusy(false);
      setAsking(false);
    }
  };

  const startEdit = () => {
    setRooms(hotel.roomTypes.map((r) => ({ ...r, price: String(r.price), count: String(r.count) })));
    setEdit(true);
  };
  const setRoom = (i, k, v) => setRooms((p) => p.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const valid = rooms.every((r) => Number(r.price) >= 500 && Number(r.count) >= 1);

  const saveRooms = () =>
    call(async () => {
      const roomTypes = rooms.map(({ name, beds, size, perks, price, count }) => ({ name, beds, size, perks, price: Number(price), count: Number(count) }));
      await api(`/api/hotels/${hotel.id}`, { method: "PUT", body: { roomTypes } });
      setEdit(false);
    }, "Room details updated.");
  const togglePublished = () =>
    call(() => api(`/api/hotels/${hotel.id}`, { method: "PUT", body: { published: !hotel.published } }), hotel.published ? "Hidden from guests." : "Visible to guests again.");
  const remove = () => call(() => api(`/api/hotels/${hotel.id}`, { method: "DELETE" }), "The property was deleted.");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <p className="font-display font-bold text-lg">{hotel.name}</p>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${hotel.published ? "bg-good/10 text-good" : "bg-line text-mute"}`}>
            {hotel.published ? "Live" : "Hidden"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
          <Link href={`/hotels/${hotel.id}`} className="text-navy hover:underline">View listing</Link>
          {!edit && <button onClick={startEdit} className="text-navy hover:underline">Edit rooms</button>}
          <button disabled={busy} onClick={togglePublished} className="text-navy hover:underline">{hotel.published ? "Hide from guests" : "Publish"}</button>
          {asking ? (
            <span>
              Delete this hotel?{" "}
              <button disabled={busy} onClick={remove} className="text-bad hover:underline mx-1">Yes</button>
              <button onClick={() => setAsking(false)} className="text-mute hover:underline">No</button>
            </span>
          ) : (
            <button onClick={() => setAsking(true)} className="text-bad hover:underline">Delete</button>
          )}
        </div>
      </div>

      <div className="card divide-y divide-line">
        {(edit ? rooms : hotel.roomTypes).map((r, i) => (
          <div key={r.name} className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold">{r.name}</p>
              <p className="text-sm text-mute">{[r.beds, r.size].filter(Boolean).join(" · ") || (edit ? "" : `${r.count} rooms in total`)}</p>
            </div>
            {edit ? (
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-mute">Rooms
                  <input type="number" min={1} max={500} className="field !w-24 mt-1" value={r.count} onChange={(e) => setRoom(i, "count", e.target.value)} />
                </label>
                <label className="text-xs font-bold text-mute">Rs / night
                  <input type="number" min={500} className="field !w-32 mt-1" value={r.price} onChange={(e) => setRoom(i, "price", e.target.value)} />
                </label>
              </div>
            ) : (
              <>
                <p className="text-sm"><span className="font-bold">{r.left}</span> of {r.count} free today</p>
                <p className="font-extrabold">{formatPKR(r.price)} <span className="text-xs text-mute font-normal">/ night</span></p>
              </>
            )}
          </div>
        ))}
      </div>
      {edit && (
        <div className="mt-4 flex gap-3">
          <button disabled={!valid || busy} onClick={saveRooms} className="btn btn-amber !py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">{busy ? "Saving…" : "Save rooms"}</button>
          <button onClick={() => setEdit(false)} className="btn btn-ghost !py-2.5">Cancel</button>
        </div>
      )}
    </div>
  );
}

function Panel() {
  const [tab, setTab] = useState("overview");
  const [hotelId, setHotelId] = useState("");
  const toast = useToast();

  const mine = useApi("/api/hotels/mine");
  const scope = hotelId ? `?hotelId=${hotelId}` : "";
  const stats = useApi(`/api/owner/stats${scope}`);
  const bookings = useApi(`/api/bookings/owner${scope}`);

  const hotels = mine.data?.items || [];
  const selected = hotels.find((h) => h.id === hotelId) || hotels[0];

  const setStatus = async (id, status) => {
    try {
      await api(`/api/bookings/${id}/status`, { method: "PATCH", body: { status } });
      toast.success(status === "confirmed" ? "The guest has been notified." : "The booking was cancelled.", status === "confirmed" ? "Booking confirmed" : "Booking cancelled");
      bookings.reload();
      stats.reload();
      mine.reload();
    } catch (e) {
      toast.error(e.message, "Could not update booking");
    }
  };

  if (mine.loading && !mine.data) return <DashboardSkeleton />;

  if (!hotels.length) {
    return (
      <div className="mx-auto max-w-md px-5 py-28 text-center">
        <h1 className="font-display font-extrabold text-3xl">No properties yet</h1>
        <p className="text-mute mt-3">List your first hotel and its bookings will appear here.</p>
        <Link href="/list-hotel" className="btn btn-amber mt-8">List your property</Link>
      </div>
    );
  }

  const s = stats.data;
  const items = bookings.data?.items || [];
  const max = Math.max(1, ...(s?.weekly || []).map((w) => w.count));

  const cards = s
    ? [
        { l: "Total bookings", v: s.bookings, sub: s.pending ? `${s.pending} awaiting you` : "" },
        { l: "Confirmed revenue", v: formatPKR(s.revenue) },
        { l: "Rooms free today", v: `${s.roomsFree} / ${s.roomsTotal}` },
        { l: "Guest rating", v: s.rating || "–" },
      ]
    : [];

  const tabs = [
    { id: "overview", label: "Overview", Icon: IconGrid },
    { id: "bookings", label: "Bookings", Icon: IconCalendar },
    { id: "rooms", label: "Rooms", Icon: IconBed },
  ];

  const bookingsTable = (rows) =>
    rows.length === 0 ? (
      <div className="card p-8 text-center text-mute">No bookings yet.</div>
    ) : (
      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase tracking-wider text-mute border-b border-line">
            <tr>{["Code", "Guest", "Room", "Dates", "Total", "Status", ""].map((h) => <th key={h} className="px-5 py-3.5 font-bold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((b) => (
              <tr key={b.id}>
                <td className="px-5 py-3.5 text-mute">{b.code}</td>
                <td className="px-5 py-3.5"><span className="block font-bold">{b.user?.name || "Guest"}</span><span className="block text-xs text-mute">{b.user?.email}</span></td>
                <td className="px-5 py-3.5">{b.roomType}<span className="block text-xs text-mute">{b.hotel?.name}</span></td>
                <td className="px-5 py-3.5 whitespace-nowrap">{fmtDay(b.checkIn)} → {fmtDay(b.checkOut)}</td>
                <td className="px-5 py-3.5 font-semibold">{formatPKR(b.total)}</td>
                <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusStyle[b.displayStatus]}`}>{b.displayStatus}</span></td>
                <td className="px-5 py-3.5 whitespace-nowrap text-right">
                  {b.status === "pending" && (
                    <button onClick={() => setStatus(b.id, "confirmed")} className="text-xs font-bold text-good hover:underline mr-3">Confirm</button>
                  )}
                  {(b.status === "pending" || b.status === "confirmed") && b.displayStatus !== "completed" && (
                    <button onClick={() => setStatus(b.id, "cancelled")} className="text-xs font-bold text-bad hover:underline">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 py-10 grid gap-8 lg:grid-cols-[230px_1fr]">
      <aside className="card p-3 self-start flex lg:flex-col gap-1 overflow-x-auto">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-left ${tab === id ? "bg-navy text-white" : "text-mute hover:bg-bg"}`}
          >
            <Icon width={18} height={18} /> {label}
          </button>
        ))}
        <Link href="/list-hotel" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-navy hover:bg-amber/20 whitespace-nowrap">
          <IconPlus width={18} height={18} /> Add property
        </Link>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-mute">Owner dashboard</p>
            <h1 className="font-display font-extrabold text-3xl">{hotelId ? selected.name : "All properties"}</h1>
          </div>
          {hotels.length > 1 && (
            <Select
              className="w-60"
              align="right"
              value={hotelId}
              onChange={setHotelId}
              options={[{ value: "", label: "All properties" }, ...hotels.map((h) => ({ value: h.id, label: h.name }))]}
            />
          )}
        </div>

        {tab === "overview" && (
          <>
            <div className="mt-7 grid grid-cols-2 xl:grid-cols-4 gap-4">
              {cards.map((c) => (
                <div key={c.l} className="card p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-mute">{c.l}</p>
                  <p className="font-display font-extrabold text-2xl mt-2">{c.v}</p>
                  {c.sub && <p className="text-xs font-bold text-amber-dark mt-1">{c.sub}</p>}
                </div>
              ))}
            </div>

            <div className="card p-6 mt-5">
              <p className="font-bold">New bookings, last 7 days</p>
              <div className="mt-6 flex items-end gap-3 h-40">
                {(s?.weekly || []).map((w) => (
                  <div key={w.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-bold">{w.count}</span>
                    <div className="w-full rounded-t-md bg-navy min-h-[3px]" style={{ height: `${(w.count / max) * 100}%` }} />
                    <span className="text-xs text-mute">{w.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="font-display font-bold text-xl mt-8 mb-4">Recent bookings</h2>
            {bookingsTable(items.slice(0, 8))}
          </>
        )}

        {tab === "bookings" && <div className="mt-7">{bookingsTable(items)}</div>}

        {tab === "rooms" && (
          <div className="mt-7 space-y-8">
            {(hotelId ? [selected] : hotels).map((h) => (
              <HotelRooms key={h.id} hotel={h} onChanged={() => { mine.reload(); stats.reload(); }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <RequireAuth>
      <Panel />
    </RequireAuth>
  );
}
