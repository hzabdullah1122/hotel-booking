"use client";

import { useApi } from "@/lib/useApi";
import HotelCard, { HotelCardSkeleton } from "./HotelCard";

export default function FeaturedHotels() {
  const { data, error, loading } = useApi("/api/hotels?sort=rating&limit=4");

  if (error) {
    return <p className="card p-6 text-mute">Could not load hotels: {error}</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {loading
        ? [...Array(4)].map((_, i) => <HotelCardSkeleton key={i} />)
        : data.items.map((h) => <HotelCard key={h.id} hotel={h} />)}
    </div>
  );
}
