import Booking from "../models/Booking.js";
import { eachNight } from "./dates.js";

const ACTIVE = ["pending", "confirmed"];

// Peak number of rooms of each type already taken on any night of [checkIn, checkOut)
async function peakBooked(hotelId, checkIn, checkOut) {
  const overlapping = await Booking.find({
    hotel: hotelId,
    status: { $in: ACTIVE },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  }).select("roomType checkIn checkOut");

  const nights = eachNight(checkIn, checkOut);
  const peak = {};
  for (const night of nights) {
    const perType = {};
    for (const b of overlapping) {
      if (b.checkIn.getTime() <= night && night < b.checkOut.getTime()) {
        perType[b.roomType] = (perType[b.roomType] || 0) + 1;
      }
    }
    for (const [type, n] of Object.entries(perType)) peak[type] = Math.max(peak[type] || 0, n);
  }
  return peak;
}

// -> { "Deluxe King": 3, ... } rooms still free for the whole stay
export async function roomsLeft(hotel, checkIn, checkOut) {
  const peak = await peakBooked(hotel._id, checkIn, checkOut);
  const out = {};
  for (const r of hotel.roomTypes) out[r.name] = Math.max(0, r.count - (peak[r.name] || 0));
  return out;
}

// Whether a given room type is over capacity (used to detect races after insert)
export async function isOverbooked(hotel, roomTypeName, checkIn, checkOut) {
  const room = hotel.roomTypes.find((r) => r.name === roomTypeName);
  if (!room) return true;
  const peak = await peakBooked(hotel._id, checkIn, checkOut);
  return (peak[roomTypeName] || 0) > room.count;
}
