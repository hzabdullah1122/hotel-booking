"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { api, imgUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { formatPKR } from "@/lib/data";
import { IconStar, IconPin, IconCheck, IconBed } from "@/components/Icons";
import RoomPicker from "./RoomPicker";
import { HotelDetailSkeleton, ReviewsSkeleton } from "@/components/Skeleton";

function Reviews({ hotelId, onChanged }) {
  const { user } = useAuth();
  const { data, loading, reload } = useApi(`/api/hotels/${hotelId}/reviews`);
  const [score, setScore] = useState(9);
  const [text, setText] = useState("");
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api(`/api/hotels/${hotelId}/reviews`, { method: "POST", body: { score, text } });
      setText("");
      toast.success("Thanks, your review is posted.", "Review posted");
      reload();
      onChanged?.();
    } catch (err) {
      toast.error(err.message, "Could not post review");
    }
  };

  const items = data?.items || [];

  return (
    <section id="reviews">
      <h2 className="font-display font-bold text-2xl">Guest reviews</h2>
      {loading && !data ? (
        <ReviewsSkeleton />
      ) : items.length === 0 ? (
        <p className="text-mute mt-3">No reviews yet. Be the first after your stay.</p>
      ) : (
        <div className="mt-5 grid md:grid-cols-3 gap-4">
          {items.slice(0, 6).map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">{r.user?.name || "Guest"}</p>
                <span className="score">{r.score}</span>
              </div>
              {r.text && <p className="text-sm mt-3 leading-relaxed">{r.text}</p>}
            </div>
          ))}
        </div>
      )}

      {user && (
        <form onSubmit={submit} className="card p-5 mt-5 grid gap-3">
          <p className="font-bold text-sm">Stayed here? Rate your visit</p>
          <div className="flex flex-wrap gap-1.5">
            {[...Array(10)].map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setScore(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-bold ${score === i + 1 ? "bg-navy text-white" : "bg-bg hover:bg-line"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <textarea rows={2} maxLength={1000} className="field" placeholder="What did you like?" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex items-center gap-4">
            <button className="btn btn-navy !py-2">Post review</button>
          </div>
        </form>
      )}
    </section>
  );
}

export default function HotelDetail({ params }) {
  const { id } = use(params);
  const search = useSearchParams();
  const initialIn = search.get("in") || "";
  const initialOut = search.get("out") || "";

  const { data, error, loading, reload } = useApi(`/api/hotels/${id}`);
  const hotel = data?.hotel;

  useEffect(() => {
    if (hotel) document.title = `${hotel.name} — Stayfield`;
  }, [hotel]);

  if (loading && !hotel) {
    return <HotelDetailSkeleton />;
  }
  if (error || !hotel) {
    return (
      <div className="mx-auto max-w-md px-5 py-28 text-center">
        <h1 className="font-display font-extrabold text-3xl">Hotel not found</h1>
        <p className="text-mute mt-3">{error || "This property is no longer available."}</p>
        <Link href="/hotels" className="btn btn-navy mt-8">Browse stays</Link>
      </div>
    );
  }

  const imgs = hotel.images?.length ? hotel.images : [];
  const pick = (i) => imgUrl(imgs[i % imgs.length]);

  return (
    <div className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 py-8">
      <p className="text-sm text-mute">
        <Link href="/hotels" className="hover:underline">Stays</Link> / <Link href={`/hotels?city=${hotel.city}`} className="hover:underline">{hotel.city}</Link> / {hotel.name}
      </p>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-amber">
            {[...Array(hotel.stars)].map((_, i) => <IconStar key={i} width={16} height={16} />)}
          </div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl mt-1">{hotel.name}</h1>
          <p className="flex items-center gap-1.5 text-mute mt-2"><IconPin width={16} height={16} /> {hotel.area ? `${hotel.area}, ` : ""}{hotel.city}</p>
        </div>
        {hotel.reviewsCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-right text-sm leading-tight">
              <span className="block font-bold">{hotel.label}</span>
              <span className="block text-mute">{hotel.reviewsCount} reviews</span>
            </span>
            <span className="score !text-lg !px-3 !py-2">{hotel.rating}</span>
          </div>
        )}
      </div>

      {imgs.length > 0 && (
        <div className="mt-6 grid gap-2 md:grid-cols-4 md:grid-rows-2 md:h-[430px] rounded-2xl overflow-hidden">
          <img src={pick(0)} alt={hotel.name} className="w-full h-64 md:h-full object-cover md:col-span-2 md:row-span-2" />
          {[1, 2, 3].map((i) => (
            <img key={i} src={pick(i)} alt="" className={`hidden md:block w-full h-full object-cover ${i === 3 ? "md:col-span-2" : ""}`} />
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-12">
          <section>
            <h2 className="font-display font-bold text-2xl">About this property</h2>
            <p className="mt-3 leading-relaxed text-ink/80">{hotel.about || "No description yet."}</p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-y-3 gap-x-6">
              {hotel.amenities.map((a) => (
                <li key={a} className="flex items-center gap-2.5 text-sm font-semibold">
                  <IconCheck width={18} height={18} className="text-good" /> {a}
                </li>
              ))}
            </ul>
          </section>

          <section id="rooms">
            <h2 className="font-display font-bold text-2xl">Availability</h2>
            <RoomPicker hotel={hotel} initialIn={initialIn} initialOut={initialOut} onBooked={reload} />
          </section>

          <Reviews hotelId={hotel.id} onChanged={reload} />
        </div>

        <aside className="card p-6 self-start lg:sticky lg:top-24">
          <p className="text-sm text-mute">Starting from</p>
          <p className="font-display font-extrabold text-3xl mt-1">{formatPKR(hotel.price)}</p>
          <p className="text-sm text-mute">per night</p>
          <ul className="mt-5 space-y-2 text-sm font-semibold text-good">
            {hotel.freeCancel && <li className="flex items-center gap-2"><IconCheck width={16} height={16} /> Free cancellation</li>}
            {hotel.breakfast && <li className="flex items-center gap-2"><IconCheck width={16} height={16} /> Breakfast included</li>}
            <li className="flex items-center gap-2"><IconBed width={16} height={16} /> {hotel.rooms} rooms left today</li>
          </ul>
          <a href="#rooms" className="btn btn-amber w-full mt-6">Choose your room</a>
        </aside>
      </div>
    </div>
  );
}
