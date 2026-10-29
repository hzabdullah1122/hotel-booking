import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { todayUTC } from "../utils/dates.js";

export const u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;
export const P = {
  lodge: "photo-1564501049412-61c2a3083791",
  room1: "photo-1578683010236-d716f9a3f461",
  room2: "photo-1590490360182-c33d57733427",
  room3: "photo-1582719478250-c89cae4dc85b",
  room4: "photo-1551882547-ff40c63fe5fa",
  pool: "photo-1566073771259-6a8506099945",
  heritage: "photo-1542314831-068cd1dbfeeb",
  resort: "photo-1520250497591-112f2f40a3f4",
  resort2: "photo-1445019980597-93fa8acb246c",
  inn: "photo-1571896349842-33c89424de2d",
  mountains: "photo-1506905925346-21bda4d32df4",
  beach: "photo-1507525428034-b723cf961d3e",
};

export const hotels = [
  {
    name: "Salt & Pine Lodge", city: "Murree", area: "Mall Road, 1.2 km from centre", type: "Lodge", stars: 4,
    oldPrice: 18000, freeCancel: true, breakfast: true,
    amenities: ["Free Wi-Fi", "Breakfast included", "Fireplace", "Free parking", "Mountain view", "Room service"],
    images: [P.lodge, P.room1, P.room2, P.room3].map(u),
    about: "A nine-room lodge set inside the pine forest above Murree. Wake up to mountain views, have breakfast on the wooden balcony and finish the day by the fireplace.",
    roomTypes: [
      { name: "Standard Double", beds: "1 double bed", size: "24 m²", price: 14500, count: 3, perks: ["Mountain view", "Free Wi-Fi"] },
      { name: "Deluxe King", beds: "1 king bed", size: "32 m²", price: 19500, count: 4, perks: ["Balcony", "Breakfast included"] },
      { name: "Family Suite", beds: "2 queen beds", size: "46 m²", price: 27000, count: 2, perks: ["Fireplace", "Sleeps 4"] },
    ],
  },
  {
    name: "Harbour House", city: "Karachi", area: "Clifton, 300 m from the beach", type: "Hotel", stars: 5,
    freeCancel: false, breakfast: true,
    amenities: ["Free Wi-Fi", "Rooftop pool", "Gym", "Airport pickup", "Sea view", "Restaurant"],
    images: [P.pool, P.room4, P.room3, P.room1].map(u),
    about: "A five-star hotel near Clifton with sea-facing rooms, a rooftop pool and a restaurant that stays open late.",
    roomTypes: [
      { name: "City Room", beds: "1 king bed", size: "28 m²", price: 22000, count: 6, perks: ["City view"] },
      { name: "Sea View Room", beds: "1 king bed", size: "34 m²", price: 29500, count: 4, perks: ["Sea view", "Breakfast included"] },
    ],
  },
  {
    name: "Old City Haveli", city: "Lahore", area: "Walled City, 400 m from Badshahi Mosque", type: "Heritage", stars: 4,
    freeCancel: true, breakfast: true,
    amenities: ["Free Wi-Fi", "Breakfast included", "Courtyard", "Rooftop dining", "Air conditioning"],
    images: [P.heritage, P.room2, P.room1, P.room4].map(u),
    about: "A restored haveli in the Walled City with carved balconies and a quiet courtyard. Only four rooms, so it fills up quickly.",
    roomTypes: [
      { name: "Courtyard Room", beds: "1 queen bed", size: "26 m²", price: 17800, count: 2, perks: ["Courtyard access"] },
      { name: "Jharokha Suite", beds: "1 king bed", size: "40 m²", price: 26500, count: 2, perks: ["Private balcony", "Breakfast included"] },
    ],
  },
  {
    name: "Lakeside Nine", city: "Hunza", area: "Attabad Lake, 2 km from Karimabad", type: "Resort", stars: 3,
    freeCancel: true, breakfast: false,
    amenities: ["Free Wi-Fi", "Free parking", "Garden", "Mountain view", "Restaurant"],
    images: [P.resort, P.resort2, P.room4, P.mountains].map(u),
    about: "Six cottages on the edge of the lake, surrounded by apricot orchards and facing the peaks.",
    roomTypes: [
      { name: "Garden Cottage", beds: "1 double bed", size: "22 m²", price: 12000, count: 4, perks: ["Garden view"] },
      { name: "Lake Cottage", beds: "1 king bed", size: "30 m²", price: 16500, count: 2, perks: ["Lake view", "Terrace"] },
    ],
  },
  {
    name: "Marigold Inn", city: "Islamabad", area: "F-7 Markaz, 800 m from Jinnah Super", type: "Inn", stars: 3,
    oldPrice: 11500, freeCancel: true, breakfast: true,
    amenities: ["Free Wi-Fi", "Breakfast included", "Free parking", "Work desk", "Air conditioning"],
    images: [P.inn, P.room3, P.pool, P.room1].map(u),
    about: "A clean, simple inn close to F-7. Good for business trips and short stays.",
    roomTypes: [
      { name: "Single Room", beds: "1 single bed", size: "16 m²", price: 9500, count: 6, perks: ["Work desk"] },
      { name: "Double Room", beds: "1 double bed", size: "20 m²", price: 12500, count: 8, perks: ["Breakfast included"] },
    ],
  },
  {
    name: "Dune Camp Thar", city: "Tharparkar", area: "Near Nagarparkar, desert edge", type: "Camp", stars: 3,
    freeCancel: true, breakfast: true,
    amenities: ["Dinner included", "Bonfire", "Camel ride", "Breakfast included"],
    images: [P.resort2, P.resort, P.lodge, P.beach].map(u),
    about: "Tents in the middle of the desert, a bonfire at night and folk music after dinner.",
    roomTypes: [
      { name: "Desert Tent", beds: "2 single beds", size: "18 m²", price: 8200, count: 7, perks: ["Dinner included"] },
      { name: "Luxury Tent", beds: "1 king bed", size: "28 m²", price: 13500, count: 4, perks: ["Private bathroom", "Dinner included"] },
    ],
  },
];

export const reviewTexts = [
  [10, "Rooms were spotless and the staff sorted our late check-in without any fuss. Would stay again."],
  [9, "Exactly as shown in the photos. Breakfast on the balcony was the best part of the trip."],
  [9, "Booked in two minutes and the confirmation came instantly. Easy to find and good value."],
];

export const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

export const DEMO = {
  owner: { email: "owner@stayfield.test", password: "password123" },
  guest: { email: "guest@stayfield.test", password: "password123" },
};

export async function seedDatabase() {
  await Promise.all([User, Hotel, Booking, Review].map((m) => m.deleteMany({})));

  const owner = await User.create({ name: "Noor Fatima", ...DEMO.owner, role: "owner" });
  const guests = await Promise.all(
    [
      { name: "Ayesha Khan", ...DEMO.guest },
      { name: "Hamza Ali", email: "hamza@stayfield.test", password: "password123" },
      { name: "Sara Malik", email: "sara@stayfield.test", password: "password123" },
    ].map((g) => User.create(g))
  );

  const created = [];
  for (const h of hotels) created.push(await Hotel.create({ ...h, owner: owner._id }));

  const today = todayUTC();
  const bookings = [];
  // past, confirmed stays (these guests can leave reviews) + a few upcoming ones
  created.forEach((hotel, i) => {
    const room = hotel.roomTypes[0];
    guests.forEach((g, j) => {
      const checkIn = addDays(today, -20 - i * 3 - j * 4);
      bookings.push({ user: g._id, hotel: hotel._id, roomType: room.name, checkIn, checkOut: addDays(checkIn, 2), guests: 2, nights: 2, pricePerNight: room.price, total: room.price * 2, status: "confirmed" });
    });
  });
  const lodge = created[0];
  const up = (user, roomType, from, nights, status) => {
    const room = lodge.roomTypes.find((r) => r.name === roomType);
    const checkIn = addDays(today, from);
    bookings.push({ user: user._id, hotel: lodge._id, roomType, checkIn, checkOut: addDays(checkIn, nights), guests: 2, nights, pricePerNight: room.price, total: room.price * nights, status });
  };
  up(guests[0], "Deluxe King", 10, 3, "confirmed");
  up(guests[1], "Standard Double", 14, 2, "pending");
  up(guests[2], "Family Suite", 5, 3, "confirmed");
  up(guests[1], "Deluxe King", 8, 2, "cancelled");
  await Booking.create(bookings);

  // ratings come from real review documents
  for (const hotel of created) {
    const docs = guests.map((g, i) => ({ hotel: hotel._id, user: g._id, score: reviewTexts[i][0], text: reviewTexts[i][1] }));
    await Review.create(docs);
    hotel.rating = Math.round((docs.reduce((s, d) => s + d.score, 0) / docs.length) * 10) / 10;
    hotel.reviewsCount = docs.length;
    await hotel.save();
  }

  return { owner, guests, hotels: created };
}

// `npm run seed`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { env } = await import("../config/env.js");
  await mongoose.connect(env.mongoUri);
  const r = await seedDatabase();
  console.log(`Seeded ${r.hotels.length} hotels, ${r.guests.length + 1} users.`);
  console.log(`Owner login: ${DEMO.owner.email} / ${DEMO.owner.password}`);
  console.log(`Guest login: ${DEMO.guest.email} / ${DEMO.guest.password}`);
  await mongoose.disconnect();
}
