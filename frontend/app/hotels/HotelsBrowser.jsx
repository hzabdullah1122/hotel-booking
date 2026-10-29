"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import PeekOverlay from "@/components/PeekOverlay";
import { ResultsSkeleton } from "@/components/Skeleton";
import Select from "@/components/Select";
import { IconStar, IconPin, IconCheck } from "@/components/Icons";
import { types, formatPKR } from "@/lib/data";
import { imgUrl } from "@/lib/api";
import { useApi } from "@/lib/useApi";

function ResultCard({ hotel, nights }) {
  const soldOut = hotel.rooms === 0;
  return (
    <article className="card card-link group overflow-hidden grid sm:grid-cols-[280px_1fr]">
      <Link href={`/hotels/${hotel.id}`} className="block relative h-52 sm:h-full sk">
        {hotel.images?.[0] && <img src={imgUrl(hotel.images[0])} alt={hotel.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
        <PeekOverlay />
      </Link>
      <div className="p-5 grid md:grid-cols-[1fr_auto] gap-5">
        <div>
          <div className="flex items-center gap-1 text-amber">
            {[...Array(hotel.stars)].map((_, i) => <IconStar key={i} width={14} height={14} />)}
            <span className="ml-2 text-xs text-mute font-semibold">{hotel.type}</span>
          </div>
          <Link href={`/hotels/${hotel.id}`}>
            <h2 className="font-display font-bold text-xl mt-1 hover:underline">{hotel.name}</h2>
          </Link>
          <p className="flex items-center gap-1 text-sm text-mute mt-1"><IconPin width={15} height={15} /> {hotel.area || hotel.city}</p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-good font-semibold">
            {hotel.freeCancel && <li className="flex items-center gap-1"><IconCheck width={15} height={15} /> Free cancellation</li>}
            {hotel.breakfast && <li className="flex items-center gap-1"><IconCheck width={15} height={15} /> Breakfast included</li>}
          </ul>
          <p className={`mt-3 text-sm font-bold ${soldOut || hotel.rooms <= 3 ? "text-bad" : "text-mute"}`}>
            {soldOut ? "No rooms available for these dates" : hotel.rooms <= 3 ? `Only ${hotel.rooms} rooms left` : `${hotel.rooms} rooms available`}
          </p>
        </div>

        <div className="flex md:flex-col justify-between md:items-end md:text-right gap-3 md:min-w-[150px]">
          <div className="flex items-center gap-2 md:flex-row-reverse">
            {hotel.reviewsCount > 0 ? (
              <>
                <span className="score">{hotel.rating}</span>
                <span className="text-sm leading-tight">
                  <span className="block font-bold">{hotel.label}</span>
                  <span className="block text-xs text-mute">{hotel.reviewsCount} reviews</span>
                </span>
              </>
            ) : (
              <span className="text-xs font-bold text-good bg-good/10 rounded px-2 py-1">New on Stayfield</span>
            )}
          </div>
          <div>
            {hotel.oldPrice > hotel.price && <p className="text-xs text-mute line-through">{formatPKR(hotel.oldPrice)}</p>}
            <p className="font-extrabold text-2xl">{formatPKR(hotel.price)}</p>
            <p className="text-xs text-mute">per night{nights > 1 ? ` · ${formatPKR(hotel.price * nights)} for ${nights} nights` : ""}</p>
            <Link
              href={`/hotels/${hotel.id}${nights > 0 && hotel._q ? `?${hotel._q}` : ""}`}
              aria-disabled={soldOut}
              onClick={(e) => soldOut && e.preventDefault()}
              className={`btn mt-3 w-full ${soldOut ? "bg-line text-mute !cursor-not-allowed" : "btn-navy"}`}
            >
              {soldOut ? "Sold out" : "See availability"}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HotelsBrowser() {
  const params = useSearchParams();
  const city = params.get("city") || "";
  const checkIn = params.get("in") || "";
  const checkOut = params.get("out") || "";
  const guests = params.get("guests") || 2;

  const [selTypes, setSelTypes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(30000);
  const [price, setPrice] = useState(30000); // debounced copy that drives the request
  const [minRating, setMinRating] = useState(0);
  const [freeCancel, setFreeCancel] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [sort, setSort] = useState("recommended");

  useEffect(() => {
    const t = setTimeout(() => setPrice(maxPrice), 300);
    return () => clearTimeout(t);
  }, [maxPrice]);

  const q = new URLSearchParams();
  if (city) q.set("city", city);
  if (checkIn && checkOut) { q.set("in", checkIn); q.set("out", checkOut); }
  if (selTypes.length) q.set("type", selTypes.join(","));
  if (price < 30000) q.set("maxPrice", price);
  if (minRating) q.set("minRating", minRating);
  if (freeCancel) q.set("freeCancel", "true");
  if (onlyAvailable) q.set("available", "true");
  q.set("sort", sort);

  const { data, error, loading } = useApi(`/api/hotels?${q.toString()}`);
  const list = data?.items || [];

  const nights =
    checkIn && checkOut ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 1;
  const dateQuery = checkIn && checkOut ? `in=${checkIn}&out=${checkOut}` : "";

  const toggleType = (t) => setSelTypes((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  const head = "text-sm font-bold mb-3";

  return (
    <>
      <div className="bg-navy pb-8 pt-4">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8">
          <SearchBar compact initial={{ city, in: checkIn, out: checkOut, guests }} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 py-10 grid gap-8 lg:grid-cols-[270px_1fr]">
        <aside className="card p-5 space-y-7 self-start lg:sticky lg:top-24">
          <p className="font-display font-bold text-lg">Filters</p>

          <div>
            <p className={head}>Your budget (per night)</p>
            <input type="range" min={5000} max={30000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-[#0f1b2d]" />
            <p className="text-sm text-mute mt-1">Up to {formatPKR(maxPrice)}</p>
          </div>

          <div>
            <p className={head}>Popular filters</p>
            <label className="flex items-center gap-2.5 text-sm py-1 cursor-pointer">
              <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="w-4 h-4 accent-[#0f1b2d]" /> Rooms available
            </label>
            <label className="flex items-center gap-2.5 text-sm py-1 cursor-pointer">
              <input type="checkbox" checked={freeCancel} onChange={(e) => setFreeCancel(e.target.checked)} className="w-4 h-4 accent-[#0f1b2d]" /> Free cancellation
            </label>
          </div>

          <div>
            <p className={head}>Property type</p>
            {types.map((t) => (
              <label key={t} className="flex items-center gap-2.5 text-sm py-1 cursor-pointer">
                <input type="checkbox" checked={selTypes.includes(t)} onChange={() => toggleType(t)} className="w-4 h-4 accent-[#0f1b2d]" /> {t}
              </label>
            ))}
          </div>

          <div>
            <p className={head}>Guest rating</p>
            {[[0, "Any"], [8, "Very good 8+"], [9, "Superb 9+"]].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2.5 text-sm py-1 cursor-pointer">
                <input type="radio" name="rating" checked={minRating === v} onChange={() => setMinRating(v)} className="w-4 h-4 accent-[#0f1b2d]" /> {l}
              </label>
            ))}
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h1 className="font-display font-extrabold text-2xl">
              {city || "All destinations"}{data ? `: ${data.total} ${data.total === 1 ? "property" : "properties"} found` : ""}
            </h1>
            <Select
              className="w-56"
              align="right"
              value={sort}
              onChange={setSort}
              options={[
                { value: "recommended", label: "Sort: Recommended" },
                { value: "rating", label: "Sort: Top rated" },
                { value: "low", label: "Price (low to high)" },
                { value: "high", label: "Price (high to low)" },
              ]}
            />
          </div>

          {error ? (
            <div className="card p-8 text-center">
              <p className="font-display font-bold text-xl">Could not load stays</p>
              <p className="text-mute mt-2">{error}</p>
            </div>
          ) : loading && !data ? (
            <ResultsSkeleton />
          ) : list.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="font-display font-bold text-xl">No properties match your filters</p>
              <p className="text-mute mt-2">Try other dates, a higher budget or fewer filters.</p>
            </div>
          ) : (
            <div className={`space-y-5 transition-opacity ${loading ? "opacity-60" : ""}`}>
              {list.map((h) => <ResultCard key={h.id} hotel={{ ...h, _q: dateQuery }} nights={nights} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
