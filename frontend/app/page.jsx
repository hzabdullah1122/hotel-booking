import PeekOverlay from "@/components/PeekOverlay";
import Link from "next/link";
import Hero from "@/components/Hero";
import FeaturedHotels from "@/components/FeaturedHotels";
import { IconShield, IconTag, IconClock, IconStar } from "@/components/Icons";
import { destinations, propertyTypes, testimonials } from "@/lib/data";

const perks = [
  { Icon: IconClock, t: "Live availability", d: "You only see rooms that can actually be booked for your dates." },
  { Icon: IconTag, t: "Best direct price", d: "No middleman fee. The price you see is what you pay." },
  { Icon: IconShield, t: "Free cancellation", d: "Most stays let you cancel up to 48 hours before check-in." },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Perks */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 mt-14 sm:mt-16">
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {perks.map(({ Icon, t, d }) => (
            <div key={t} className="flex gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-navy text-amber shrink-0"><Icon /></span>
              <div>
                <p className="font-display font-bold text-lg">{t}</p>
                <p className="text-sm text-mute mt-1 leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 mt-20">
        <h2 className="font-display font-extrabold text-3xl">Popular destinations</h2>
        <p className="text-mute mt-1">Where travellers are heading this season</p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:grid-rows-2">
          {destinations.map((d, i) => (
            <Link
              key={d.city}
              href={`/hotels?city=${d.city}`}
              className={`group relative overflow-hidden rounded-2xl bg-navy min-h-[180px] ${
                i === 0 ? "col-span-2 md:row-span-2" : ""
              }`}
            >
              <img src={d.image} alt={d.city} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
              <PeekOverlay />
              <div className="absolute bottom-4 left-5 text-white">
                <p className="font-display font-bold text-2xl">{d.city}</p>
                
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Deals */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 mt-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-extrabold text-3xl">Deals and top-rated stays</h2>
            <p className="text-mute mt-1">Handpicked rooms with the best value right now</p>
          </div>
          <Link href="/hotels" className="hidden sm:block text-sm font-bold underline underline-offset-4 hover:text-amber-dark">See all stays</Link>
        </div>
        <FeaturedHotels />
      </section>

      {/* Property types */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 mt-20">
        <h2 className="font-display font-extrabold text-3xl">Browse by property type</h2>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {propertyTypes.map((p) => (
            <Link key={p.name} href="/hotels" className="group">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-line">
                <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                <PeekOverlay />
              </div>
              <p className="font-bold mt-3">{p.name}s</p>
              
            </Link>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 mt-20">
        <h2 className="font-display font-extrabold text-3xl">What guests and hosts say</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <figure key={t.name} className="card p-6">
              <div className="flex gap-0.5 text-amber">
                {[...Array(5)].map((_, i) => <IconStar key={i} width={16} height={16} />)}
              </div>
              <blockquote className="mt-4 leading-relaxed">{t.text}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid place-items-center w-10 h-10 rounded-full bg-navy text-white font-bold">{t.name[0]}</span>
                <span>
                  <span className="block font-bold text-sm">{t.name}</span>
                  <span className="block text-xs text-mute">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Host CTA */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-navy text-white p-8 md:p-14 grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div className="relative z-10">
            <p className="text-amber font-bold text-sm uppercase tracking-wider">For property owners</p>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl mt-2">List your hotel on Stayfield</h2>
            <p className="mt-4 text-white/75 max-w-md">
              Add your rooms, set your prices and track every booking from one dashboard. Listing takes about ten minutes.
            </p>
            <Link href="/list-hotel" className="btn btn-amber mt-7">Start listing</Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=70"
            alt=""
            className="rounded-2xl w-full h-56 md:h-72 object-cover"
          />
        </div>
      </section>
    </>
  );
}
