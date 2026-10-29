"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { IconStar } from "./Icons";
import { formatPKR } from "@/lib/data";
import { imgUrl } from "@/lib/api";
import { useApi } from "@/lib/useApi";

const WORDS = ["Hunza", "Murree", "Karachi", "Lahore", "Islamabad"];

const photos = {
  tall: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=70",
  pool: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=70",
  room: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=70",
};

function CountUp({ to, decimals = 0, suffix = "", delay = 500, duration = 1600 }) {
  const [v, setV] = useState(0);

  useEffect(() => {
    let raf;
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setV(to * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [to, delay, duration]);

  return <>{v.toFixed(decimals)}{suffix}</>;
}

const SLIDE_MS = 5500;

// Rotating showcase of the best-rated stays, fed by the API
function Showcase({ hotels, loading, stats, delay }) {
  const slides = (hotels || []).filter((h) => h.images?.length);
  const [a, setA] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const id = setTimeout(() => setA((n) => (n + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [a, paused, slides.length]);

  const cur = slides[a % Math.max(slides.length, 1)];
  const size = "h-[360px] sm:h-[430px] xl:h-[500px] 2xl:h-[560px]";

  return (
    <div className={`pop-in relative ${size}`} style={delay(250)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* offset outline behind the frame */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4 rounded-[1.75rem] border border-amber/40" />

      <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-navy-2 shadow-2xl shadow-black/40">
        {loading && !hotels && <div className="sk absolute inset-0" />}

        {slides.length === 0 && !loading && (
          <img src={photos.tall} alt="Heritage hotel courtyard" className="kenburns w-full h-full object-cover" />
        )}

        {slides.map((h, i) => (
          <img
            key={h.id}
            src={imgUrl(h.images[0])}
            alt={h.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === a ? "opacity-100 kenburns" : "opacity-0"}`}
          />
        ))}
        {slides.length > 0 && <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />}

        {cur && (
          <>
            <span className="absolute left-5 top-5 rounded-full bg-navy/60 backdrop-blur px-3 py-1 text-xs font-bold text-white tabular-nums">
              {String(a + 1).padStart(2, "0")} <span className="text-white/50">/ {String(slides.length).padStart(2, "0")}</span>
            </span>

            <div key={cur.id} className="rise absolute inset-x-0 bottom-0 p-5 sm:p-7 pb-12 sm:pb-14" style={{ animationDuration: "0.6s" }}>
              <div className="flex items-center gap-1 text-amber">
                {[...Array(cur.stars)].map((_, k) => <IconStar key={k} width={14} height={14} />)}
                <span className="ml-2 text-xs font-semibold text-white/70">{cur.type}</span>
              </div>
              <h3 className="font-display font-extrabold text-white text-2xl sm:text-3xl mt-1.5">{cur.name}</h3>
              <p className="text-sm text-white/70 mt-1">{cur.area || cur.city}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                {cur.reviewsCount > 0 && <span className="score">{cur.rating}</span>}
                <span className="text-white">
                  <span className="text-xs text-white/60">from </span>
                  <span className="font-extrabold text-lg">{formatPKR(cur.price)}</span>
                  <span className="text-xs text-white/60"> / night</span>
                </span>
                <Link href={`/hotels/${cur.id}`} className="btn btn-amber !py-2 !px-4 !text-sm ml-auto">View stay →</Link>
              </div>
            </div>

            {slides.length > 1 && (
              <div className="absolute inset-x-5 sm:inset-x-7 bottom-5 flex gap-2">
                {slides.map((h, i) => (
                  <button key={h.id} onClick={() => setA(i)} aria-label={`Show ${h.name}`} className="group flex-1 py-2">
                    <span className="block h-[3px] rounded-full bg-white/25 overflow-hidden">
                      {i < a && <span className="block h-full w-full bg-white/80" />}
                      {i === a && (
                        <span
                          key={`${a}-${paused}`}
                          className="bar-fill block h-full bg-amber"
                          style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {stats && stats.roomsFree > 0 && (
        <div className="pop-in absolute -right-2 sm:-right-4 -top-4" style={delay(1050)}>
          <div className="bg-amber text-navy rounded-2xl shadow-xl p-3.5 leading-tight">
            <span className="block text-[0.7rem] font-bold uppercase tracking-wider">Today</span>
            <span className="block font-display font-extrabold text-lg">
              {stats.roomsFree} {stats.roomsFree === 1 ? "room" : "rooms"} free
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Hero() {
  const [i, setI] = useState(0);
  // real numbers and real hotels from the database
  const { data: stats } = useApi("/api/hotels/stats");
  const top = useApi("/api/hotels?sort=rating&limit=5");

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2600);
    return () => clearInterval(id);
  }, []);

  const delay = (ms) => ({ animationDelay: `${ms}ms` });

  return (
    <>
      <section className="relative bg-navy overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="pointer-events-none absolute -top-32 -right-32 w-[640px] h-[640px] rounded-full bg-amber/15 blur-3xl drift" />
        <div className="pointer-events-none absolute bottom-0 -left-40 w-[480px] h-[480px] rounded-full bg-navy-2 blur-3xl drift" style={{ animationDelay: "-8s" }} />

        <div className="relative mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 pt-12 sm:pt-16 lg:pt-20 pb-32 sm:pb-36 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-20 items-center">
          <div>
            <span className="rise inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white/85" style={delay(50)}>
              <span className="w-2 h-2 rounded-full bg-amber ping-dot" /> Live room availability across Pakistan
            </span>

            <h1 className="font-display font-extrabold text-white text-[2.5rem] leading-[1.05] sm:text-6xl 2xl:text-7xl mt-6">
              <span className="rise block" style={delay(150)}>Find your room in</span>
              <span className="rise block overflow-hidden pb-1" style={delay(300)}>
                <span key={WORDS[i]} className="word-in text-amber">{WORDS[i]}.</span>
              </span>
            </h1>

            <p className="rise mt-5 text-white/70 text-base sm:text-lg 2xl:text-xl max-w-xl" style={delay(450)}>
              Hotels, lodges and resorts from Hunza to Karachi. See which rooms are actually free for your dates before you book.
            </p>

            <div className="rise mt-7 flex flex-wrap items-center gap-2.5" style={delay(600)}>
              <span className="text-sm text-white/50 mr-1">Popular:</span>
              {["Hunza", "Murree", "Karachi", "Lahore"].map((c) => (
                <Link
                  key={c}
                  href={`/hotels?city=${c}`}
                  className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold text-white/90 hover:bg-amber hover:border-amber hover:text-navy hover:-translate-y-0.5 transition-all"
                >
                  {c}
                </Link>
              ))}
            </div>

            <dl className="rise mt-10 grid grid-cols-3 max-w-lg gap-6" style={delay(750)}>
              <div className="border-l border-white/15 pl-4">
                <dt className="font-display font-extrabold text-2xl sm:text-3xl text-white tabular-nums">{stats ? <CountUp key={stats.properties} to={stats.properties} /> : "–"}</dt>
                <dd className="text-xs sm:text-sm text-white/55 mt-0.5">{stats?.properties === 1 ? "Property" : "Properties"}</dd>
              </div>
              <div className="border-l border-white/15 pl-4">
                <dt className="font-display font-extrabold text-2xl sm:text-3xl text-white tabular-nums">
                  {stats?.avgRating ? <CountUp key={stats.avgRating} to={stats.avgRating} decimals={1} /> : "–"}
                </dt>
                <dd className="text-xs sm:text-sm text-white/55 mt-0.5">Average rating</dd>
              </div>
              <div className="border-l border-white/15 pl-4">
                <dt className="font-display font-extrabold text-2xl sm:text-3xl text-white tabular-nums">{stats ? <CountUp key={stats.cities} to={stats.cities} /> : "–"}</dt>
                <dd className="text-xs sm:text-sm text-white/55 mt-0.5">{stats?.cities === 1 ? "City" : "Cities"}</dd>
              </div>
            </dl>
          </div>

          <Showcase hotels={top.data?.items} loading={top.loading} stats={stats} delay={delay} />
        </div>
      </section>

      <div className="rise relative z-20 mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 -mt-16 sm:-mt-20" style={delay(900)}>
        <SearchBar />
      </div>
    </>
  );
}
