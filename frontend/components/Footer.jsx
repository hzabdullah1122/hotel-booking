import Link from "next/link";

const cols = [
  { title: "Destinations", links: [["Hunza", "/hotels?city=Hunza"], ["Murree", "/hotels?city=Murree"], ["Karachi", "/hotels?city=Karachi"], ["Lahore", "/hotels?city=Lahore"]] },
  { title: "Guests", links: [["Browse stays", "/hotels"], ["My trips", "/my-bookings"], ["Sign in", "/login"]] },
  { title: "Hosts", links: [["List your property", "/list-hotel"], ["Owner dashboard", "/dashboard"]] },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white mt-24">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 py-14 grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-extrabold">stay<span className="text-amber">field</span></p>
          <p className="mt-3 text-sm text-white/60 max-w-xs leading-relaxed">
            Search hotels, see real room availability and book directly with the property.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-bold mb-3">{c.title}</p>
            <ul className="space-y-2 text-sm text-white/60">
              {c.links.map(([t, h]) => (
                <li key={t}><Link href={h} className="hover:text-amber">{t}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Stayfield. All rights reserved.
      </div>
    </footer>
  );
}
