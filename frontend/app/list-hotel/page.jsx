"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Select from "@/components/Select";
import { cities, types } from "@/lib/data";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { IconPlus } from "@/components/Icons";
import { shrinkImage } from "@/lib/image";

const allAmenities = ["Free Wi-Fi", "Breakfast included", "Free parking", "Pool", "Gym", "Air conditioning", "Airport pickup", "Restaurant", "Room service"];
const starOptions = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? "star" : "stars"}` }));

function Form() {
  const { refresh } = useAuth();
  const [f, setF] = useState({ name: "", area: "", about: "", city: "", type: "", stars: "3", freeCancel: true, breakfast: false });
  const [amenities, setAmenities] = useState([]);
  const [roomTypes, setRoomTypes] = useState([{ name: "", price: "", count: "" }]);
  const [files, setFiles] = useState([]);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [done, setDone] = useState(null);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const text = (k) => (e) => set(k)(e.target.value);
  const toggle = (a) => setAmenities((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));
  const setRoom = (i, k, v) => setRoomTypes((p) => p.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const removeRoom = (i) => setRoomTypes((p) => p.filter((_, j) => j !== i));

  const addFiles = async (e) => {
    // read the FileList before clearing the input, otherwise it is emptied too
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    const bad = picked.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 15 * 1024 * 1024);
    if (bad) {
      toast.error(`"${bad.name}" is not allowed. Use JPG, PNG or WebP under 15 MB.`, "Photo not added");
      return;
    }
    setPhotoBusy(true);
    const small = await Promise.all(picked.map((file) => shrinkImage(file)));
    setPhotoBusy(false);
    setFiles((p) => [...p, ...small].slice(0, 8));
  };

  const roomOk = (r) => r.name.trim().length >= 2 && Number(r.price) >= 500 && Number(r.count) >= 1;
  const missing = [
    f.name.trim().length < 2 && "property name",
    !f.city && "city",
    !f.type && "property type",
    !f.area.trim() && "address",
    !f.about.trim() && "description",
    !roomTypes.every(roomOk) && "room details (name, price from Rs 500, rooms)",
    files.length === 0 && "at least one photo",
  ].filter(Boolean);
  const canSubmit = missing.length === 0 && !busy && !photoBusy;

  const submit = async (e) => {
    e.preventDefault();
    if (missing.length) return;
    setBusy(true);
    try {
      const data = {
        name: f.name,
        city: f.city,
        type: f.type,
        area: f.area,
        about: f.about,
        stars: Number(f.stars),
        freeCancel: f.freeCancel,
        breakfast: f.breakfast,
        amenities,
        roomTypes: roomTypes.map((r) => ({ name: r.name, price: Number(r.price), count: Number(r.count), perks: [] })),
      };
      const form = new FormData();
      form.append("data", JSON.stringify(data));
      files.forEach((file) => form.append("images", file));
      const { hotel } = await api("/api/hotels", { method: "POST", form });
      await refresh(); // account is now an owner
      setDone(hotel);
      toast.success("Your property is now live.", "Property listed");
    } catch (err) {
      toast.error(err.message, "Could not list property");
    } finally {
      setBusy(false);
    }
  };

  const lab = "block text-xs font-bold text-mute mb-1.5";
  const sec = "card p-6 space-y-5";

  if (done) {
    return (
      <div className="card p-10 text-center">
        <p className="font-display font-extrabold text-2xl text-good">{done.name} is live</p>
        <p className="text-mute mt-2">Guests can find and book it now. Manage rooms and bookings from your dashboard.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard" className="btn btn-navy">Go to dashboard</Link>
          <Link href={`/hotels/${done.id}`} className="btn btn-ghost">View listing</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className={sec}>
        <h2 className="font-display font-bold text-xl">Property details</h2>
        <div>
          <label className={lab}>Property name</label>
          <input required minLength={2} className="field" value={f.name} onChange={text("name")} />
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          <div>
            <label className={lab}>City</label>
            <Select required value={f.city} onChange={set("city")} options={cities} placeholder="Select city" />
          </div>
          <div>
            <label className={lab}>Property type</label>
            <Select required value={f.type} onChange={set("type")} options={types} placeholder="Select type" />
          </div>
          <div>
            <label className={lab}>Star rating</label>
            <Select value={f.stars} onChange={set("stars")} options={starOptions} />
          </div>
        </div>
        <div>
          <label className={lab}>Address / area</label>
          <input required className="field" placeholder="e.g. Clifton, 300 m from the beach" value={f.area} onChange={text("area")} />
        </div>
        <div>
          <label className={lab}>Description</label>
          <textarea required rows={4} maxLength={3000} className="field" value={f.about} onChange={text("about")} />
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
            <input type="checkbox" checked={f.freeCancel} onChange={(e) => set("freeCancel")(e.target.checked)} className="w-4 h-4 accent-[#0f1b2d]" /> Free cancellation
          </label>
          <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
            <input type="checkbox" checked={f.breakfast} onChange={(e) => set("breakfast")(e.target.checked)} className="w-4 h-4 accent-[#0f1b2d]" /> Breakfast included
          </label>
        </div>
      </div>

      <div className={sec}>
        <h2 className="font-display font-bold text-xl">Rooms and pricing</h2>
        {roomTypes.map((r, i) => (
          <div key={i} className="grid sm:grid-cols-[1.5fr_1fr_0.7fr_auto] gap-3 items-end">
            <div>
              <label className={lab}>Room type</label>
              <input required minLength={2} placeholder="e.g. Deluxe King" className="field" value={r.name} onChange={(e) => setRoom(i, "name", e.target.value)} />
            </div>
            <div>
              <label className={lab}>Price per night (Rs)</label>
              <input required type="number" min={500} className="field" value={r.price} onChange={(e) => setRoom(i, "price", e.target.value)} />
            </div>
            <div>
              <label className={lab}>No. of rooms</label>
              <input required type="number" min={1} max={500} className="field" value={r.count} onChange={(e) => setRoom(i, "count", e.target.value)} />
            </div>
            {roomTypes.length > 1 && (
              <button type="button" onClick={() => removeRoom(i)} className="text-sm font-bold text-bad px-2 py-3">Remove</button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRoomTypes([...roomTypes, { name: "", price: "", count: "" }])}
          className="flex items-center gap-2 text-sm font-bold text-navy hover:text-amber-dark"
        >
          <IconPlus width={18} height={18} /> Add another room type
        </button>
      </div>

      <div className={sec}>
        <h2 className="font-display font-bold text-xl">Facilities</h2>
        <div className="flex flex-wrap gap-2">
          {allAmenities.map((a) => (
            <button
              type="button" key={a} onClick={() => toggle(a)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                amenities.includes(a) ? "bg-navy text-white border-navy" : "border-line bg-white hover:border-navy"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className={sec}>
        <h2 className="font-display font-bold text-xl">Photos <span className="text-bad">*</span> <span className="text-sm text-mute font-normal">(up to 8, JPG / PNG / WebP, resized automatically)</span></h2>
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {previews.map((src, i) => (
              <div key={src} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-line">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-navy/80 text-white text-sm font-bold">×</button>
              </div>
            ))}
          </div>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addFiles} className="field" />
        {photoBusy && <p className="text-sm text-mute">Preparing photos…</p>}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button disabled={!canSubmit} className="btn btn-amber !py-3.5 !px-8 disabled:opacity-40 disabled:cursor-not-allowed">
          {busy ? "Submitting…" : "Submit property"}
        </button>
        {missing.length > 0 && <p className="text-sm text-mute">Still needed: {missing.join(", ")}</p>}
      </div>
    </form>
  );
}

export default function ListHotel() {
  return (
    <RequireAuth>
      <div className="bg-navy text-white">
        <div className="mx-auto max-w-3xl px-5 py-12">
          <h1 className="font-display font-extrabold text-4xl">List your property</h1>
          <p className="mt-2 text-white/70">Add your details and room types. Guests can book as soon as it is live.</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Form />
      </div>
    </RequireAuth>
  );
}
