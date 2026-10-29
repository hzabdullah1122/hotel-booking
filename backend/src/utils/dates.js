import { ApiError } from "./http.js";

const DAY = 86400000;
export const MAX_NIGHTS = 30;

// "2026-11-08" -> Date at UTC midnight (no timezone drift)
export const parseDay = (s) => new Date(`${s}T00:00:00.000Z`);

export const todayUTC = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
};

export const nightsBetween = (a, b) => Math.round((b - a) / DAY);

export const eachNight = (from, to) => {
  const out = [];
  for (let t = from.getTime(); t < to.getTime(); t += DAY) out.push(t);
  return out;
};

// Validates and returns { checkIn, checkOut, nights } as Dates
export function stayRange(inStr, outStr) {
  const checkIn = parseDay(inStr);
  const checkOut = parseDay(outStr);
  if (Number.isNaN(+checkIn) || Number.isNaN(+checkOut)) throw new ApiError(400, "Invalid dates");
  if (checkIn < todayUTC()) throw new ApiError(400, "Check-in cannot be in the past");
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) throw new ApiError(400, "Check-out must be after check-in");
  if (nights > MAX_NIGHTS) throw new ApiError(400, `Maximum stay is ${MAX_NIGHTS} nights`);
  return { checkIn, checkOut, nights };
}
