import Link from "next/link";
import { formatPKR } from "@/lib/data";
import { imgUrl } from "@/lib/api";
import { IconPin } from "./Icons";
import PeekOverlay from "./PeekOverlay";

// Vertical card for grids (home page)
export default function HotelCard({ hotel }) {
  const soldOut = hotel.rooms === 0;
  return (
    <Link href={`/hotels/${hotel.id}`} className="card card-link overflow-hidden group block">
      <div className="relative aspect-[16/11] overflow-hidden sk">
        {hotel.images?.[0] && (
          <img src={imgUrl(hotel.images[0])} alt={hotel.name} loading="lazy" className="h-full w-full object-cover" />
        )}
        <PeekOverlay />
        {hotel.oldPrice > hotel.price && (
          <span className="absolute left-3 top-3 bg-amber text-navy text-xs font-extrabold px-2.5 py-1 rounded-md">
            {Math.round((1 - hotel.price / hotel.oldPrice) * 100)}% OFF
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-bold text-lg leading-tight">{hotel.name}</h3>
          {hotel.reviewsCount > 0 ? (
            <span className="score shrink-0">{hotel.rating}</span>
          ) : (
            <span className="text-xs font-bold text-good bg-good/10 rounded px-2 py-1">New</span>
          )}
        </div>
        <p className="flex items-center gap-1 text-sm text-mute mt-1.5"><IconPin width={15} height={15} /> {hotel.city}</p>
        <div className="flex items-end justify-between mt-4">
          <p className={`text-xs font-bold ${soldOut ? "text-bad" : "text-good"}`}>
            {soldOut ? "Sold out for now" : `${hotel.rooms} rooms left`}
          </p>
          <p className="text-right">
            {hotel.oldPrice > hotel.price && <span className="block text-xs text-mute line-through">{formatPKR(hotel.oldPrice)}</span>}
            <span className="font-extrabold text-lg">{formatPKR(hotel.price)}</span>
            <span className="text-xs text-mute"> / night</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

export { HotelCardSkeleton } from "./Skeleton";
