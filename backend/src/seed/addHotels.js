// Adds sample hotels WITHOUT deleting anything. Safe to run more than once (skips hotels that exist).
//   npm run add-hotels
import mongoose from "mongoose";
import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { todayUTC } from "../utils/dates.js";
import { hotels as base, u, P, reviewTexts, addDays, DEMO } from "./seed.js";

const more = [
  {
    name: "Margalla Ridge Hotel", city: "Islamabad", area: "Shakarparian Road, 3 km from Faisal Mosque", type: "Hotel", stars: 5,
    oldPrice: 34000, freeCancel: true, breakfast: true,
    amenities: ["Free Wi-Fi", "Pool", "Gym", "Breakfast included", "Airport pickup", "Restaurant", "Air conditioning"],
    images: [P.pool, P.room3, P.room4, P.room2].map(u),
    about: "A five-star hotel on the slopes of the Margalla hills. Large rooms, an outdoor pool and a restaurant with a view over the city.",
    roomTypes: [
      { name: "Superior Room", beds: "1 king bed", size: "32 m²", price: 28000, count: 8, perks: ["City view", "Breakfast included"] },
      { name: "Executive Suite", beds: "1 king bed", size: "58 m²", price: 46000, count: 3, perks: ["Lounge access", "Hill view"] },
    ],
  },
  {
    name: "Gulberg Garden Suites", city: "Lahore", area: "Gulberg III, 500 m from MM Alam Road", type: "Hotel", stars: 4,
    freeCancel: true, breakfast: true,
    amenities: ["Free Wi-Fi", "Breakfast included", "Gym", "Free parking", "Air conditioning", "Room service"],
    images: [P.room1, P.room4, P.pool, P.room3].map(u),
    about: "Apartment-style suites with a kitchenette, close to the restaurants and shops of Gulberg. Good for longer stays.",
    roomTypes: [
      { name: "Studio Suite", beds: "1 queen bed", size: "30 m²", price: 16500, count: 6, perks: ["Kitchenette"] },
      { name: "Two-Bedroom Suite", beds: "1 king + 2 single beds", size: "62 m²", price: 29000, count: 3, perks: ["Sleeps 5", "Kitchenette"] },
    ],
  },
  {
    name: "Sea Breeze Guest House", city: "Karachi", area: "Do Talwar, 600 m from Clifton Beach", type: "Inn", stars: 3,
    oldPrice: 9500, freeCancel: true, breakfast: false,
    amenities: ["Free Wi-Fi", "Air conditioning", "Free parking", "Roof terrace"],
    images: [P.inn, P.room2, P.beach, P.room1].map(u),
    about: "A small, friendly guest house a short walk from the beach. Simple rooms, a roof terrace and fair prices.",
    roomTypes: [
      { name: "Economy Room", beds: "1 double bed", size: "15 m²", price: 6800, count: 5, perks: ["Air conditioning"] },
      { name: "Terrace Room", beds: "1 king bed", size: "22 m²", price: 9800, count: 3, perks: ["Private terrace"] },
    ],
  },
  {
    name: "Pearl Continental View", city: "Murree", area: "Kashmir Point, 2 km from Mall Road", type: "Resort", stars: 4,
    oldPrice: 26000, freeCancel: false, breakfast: true,
    amenities: ["Free Wi-Fi", "Breakfast included", "Mountain view", "Restaurant", "Free parking", "Fireplace"],
    images: [P.resort, P.room4, P.mountains, P.room2].map(u),
    about: "A hillside resort with wide valley views, a heated lounge and a restaurant serving local and continental food.",
    roomTypes: [
      { name: "Valley Room", beds: "1 king bed", size: "30 m²", price: 21000, count: 6, perks: ["Valley view", "Breakfast included"] },
      { name: "Cottage Suite", beds: "1 king + sofa bed", size: "48 m²", price: 33000, count: 2, perks: ["Fireplace", "Private balcony"] },
    ],
  },
  {
    name: "Karimabad Fort Residency", city: "Hunza", area: "Karimabad, next to Baltit Fort", type: "Heritage", stars: 4,
    freeCancel: true, breakfast: true,
    amenities: ["Free Wi-Fi", "Breakfast included", "Mountain view", "Garden", "Restaurant"],
    images: [P.heritage, P.mountains, P.room2, P.resort2].map(u),
    about: "Stone-and-wood rooms beside the old fort, with a terrace that looks straight at Rakaposhi. Dinner is cooked with local apricot and walnut dishes.",
    roomTypes: [
      { name: "Stone Room", beds: "1 double bed", size: "24 m²", price: 15000, count: 5, perks: ["Valley view"] },
      { name: "Rakaposhi Suite", beds: "1 king bed", size: "40 m²", price: 24000, count: 2, perks: ["Mountain view", "Private terrace"] },
    ],
  },
  {
    name: "Blue Dunes Retreat", city: "Tharparkar", area: "Near Mithi, 6 km from the main road", type: "Camp", stars: 3,
    oldPrice: 11000, freeCancel: true, breakfast: true,
    amenities: ["Dinner included", "Breakfast included", "Bonfire", "Free parking"],
    images: [P.resort2, P.beach, P.lodge, P.resort].map(u),
    about: "Round mud huts in the Thar style, cool in the day and warm at night, with home-cooked meals and a bonfire every evening.",
    roomTypes: [
      { name: "Mud Hut", beds: "2 single beds", size: "20 m²", price: 7500, count: 8, perks: ["Dinner included"] },
      { name: "Family Hut", beds: "1 double + 2 single beds", size: "32 m²", price: 12500, count: 3, perks: ["Sleeps 4", "Dinner included"] },
    ],
  },
  {
    name: "F-10 Business Inn", city: "Islamabad", area: "F-10 Markaz, 1 km from Centaurus", type: "Inn", stars: 3,
    freeCancel: true, breakfast: true,
    amenities: ["Free Wi-Fi", "Breakfast included", "Work desk", "Air conditioning", "Free parking"],
    images: [P.room3, P.inn, P.room1, P.room4].map(u),
    about: "Quiet, practical rooms for people on work trips. Fast Wi-Fi, proper desks and breakfast from 6 am.",
    roomTypes: [
      { name: "Standard Room", beds: "1 queen bed", size: "18 m²", price: 10500, count: 7, perks: ["Work desk"] },
      { name: "Business Room", beds: "1 king bed", size: "24 m²", price: 14000, count: 4, perks: ["Work desk", "Breakfast included"] },
    ],
  },
  {
    name: "Anarkali Heritage Lodge", city: "Lahore", area: "Near Food Street, Fort Road", type: "Heritage", stars: 3,
    oldPrice: 14500, freeCancel: true, breakfast: true,
    amenities: ["Free Wi-Fi", "Breakfast included", "Rooftop dining", "Air conditioning"],
    images: [P.heritage, P.room2, P.room4, P.inn].map(u),
    about: "A restored 1920s building next to Food Street. Rooftop dinner with a view of the Badshahi Mosque lights.",
    roomTypes: [
      { name: "Classic Room", beds: "1 double bed", size: "22 m²", price: 11500, count: 4, perks: ["Air conditioning"] },
      { name: "Mosque View Room", beds: "1 king bed", size: "28 m²", price: 16500, count: 2, perks: ["Mosque view", "Breakfast included"] },
    ],
  },
  {
    name: "Seaview Palms Resort", city: "Karachi", area: "Hawke's Bay Road, direct beach access", type: "Resort", stars: 4,
    freeCancel: false, breakfast: true,
    amenities: ["Free Wi-Fi", "Pool", "Breakfast included", "Sea view", "Free parking", "Restaurant"],
    images: [P.beach, P.pool, P.resort, P.room3].map(u),
    about: "A beachfront resort with a private stretch of sand, a freshwater pool and rooms that open onto garden lawns.",
    roomTypes: [
      { name: "Garden Room", beds: "1 king bed", size: "30 m²", price: 18500, count: 8, perks: ["Garden view"] },
      { name: "Beach Villa", beds: "1 king + 1 double bed", size: "70 m²", price: 38000, count: 3, perks: ["Beach access", "Sleeps 4", "Breakfast included"] },
    ],
  },
];

const { env } = await import("../config/env.js");
const { connectDB } = await import("../config/db.js");
await connectDB(env.mongoUri, { timeoutMs: 10000 });

// reviews need real guests with completed stays, so create a few demo accounts if missing
const upsertUser = async (data) => (await User.findOne({ email: data.email })) || User.create(data);
const owner = await upsertUser({ name: "Noor Fatima", ...DEMO.owner, role: "owner" });
const guests = await Promise.all(
  [
    { name: "Ayesha Khan", ...DEMO.guest },
    { name: "Hamza Ali", email: "hamza@stayfield.test", password: "password123" },
    { name: "Sara Malik", email: "sara@stayfield.test", password: "password123" },
  ].map(upsertUser)
);

const today = todayUTC();
let added = 0;
for (const [i, h] of [...base, ...more].entries()) {
  if (await Hotel.exists({ name: h.name, city: h.city })) continue;
  const hotel = await Hotel.create({ ...h, owner: owner._id });

  const room = hotel.roomTypes[0];
  const bookings = guests.map((g, j) => {
    const checkIn = addDays(today, -25 - i * 2 - j * 5);
    return { user: g._id, hotel: hotel._id, roomType: room.name, checkIn, checkOut: addDays(checkIn, 2), guests: 2, nights: 2, pricePerNight: room.price, total: room.price * 2, status: "confirmed" };
  });
  await Booking.create(bookings);

  // a little variety in scores so ratings are not all identical
  const docs = guests.map((g, j) => ({ hotel: hotel._id, user: g._id, score: Math.max(7, reviewTexts[j][0] - ((i + j) % 3 === 0 ? 1 : 0)), text: reviewTexts[j][1] }));
  await Review.create(docs);
  hotel.rating = Math.round((docs.reduce((s, d) => s + d.score, 0) / docs.length) * 10) / 10;
  hotel.reviewsCount = docs.length;
  await hotel.save();
  added++;
  console.log("added", hotel.name);
}

console.log(`Done. ${added} hotels added, existing data untouched.`);
console.log(`Demo owner login: ${DEMO.owner.email} / ${DEMO.owner.password}`);
await mongoose.disconnect();
