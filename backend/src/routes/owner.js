import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";
import { protect } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/http.js";
import { todayUTC } from "../utils/dates.js";
import { roomsLeft } from "../utils/availability.js";

const router = Router();

// Dashboard numbers for the owner (all hotels, or one with ?hotelId=)
router.get(
  "/stats",
  protect,
  asyncHandler(async (req, res) => {
    const { hotelId } = z.object({ hotelId: z.string().length(24).optional() }).parse(req.query);

    const hotels = await Hotel.find({ owner: req.user._id });
    const scoped = hotelId ? hotels.filter((h) => String(h._id) === hotelId) : hotels;
    if (hotelId && !scoped.length) throw new ApiError(403, "This is not your hotel");
    const ids = scoped.map((h) => h._id);

    const [totals] = await Booking.aggregate([
      { $match: { hotel: { $in: ids } } },
      {
        $group: {
          _id: null,
          bookings: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          revenue: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, "$total", 0] } },
        },
      },
    ]);

    // bookings created per weekday over the last 7 days
    const since = new Date(todayUTC().getTime() - 6 * 86400000);
    const recent = await Booking.aggregate([
      { $match: { hotel: { $in: ids }, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, n: { $sum: 1 } } },
    ]);
    const byDay = Object.fromEntries(recent.map((r) => [r._id, r.n]));
    const weekly = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(since.getTime() + i * 86400000);
      const key = d.toISOString().slice(0, 10);
      return { date: key, day: d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }), count: byDay[key] || 0 };
    });

    const today = todayUTC();
    const tomorrow = new Date(today.getTime() + 86400000);
    let roomsFree = 0;
    let roomsTotal = 0;
    for (const h of scoped) {
      const left = await roomsLeft(h, today, tomorrow);
      roomsFree += Object.values(left).reduce((s, n) => s + n, 0);
      roomsTotal += h.totalRooms;
    }

    const rated = scoped.filter((h) => h.reviewsCount > 0);
    const rating = rated.length ? Math.round((rated.reduce((s, h) => s + h.rating, 0) / rated.length) * 10) / 10 : 0;

    res.json({
      hotels: hotels.map((h) => ({ id: h.id, name: h.name })),
      bookings: totals?.bookings || 0,
      pending: totals?.pending || 0,
      revenue: totals?.revenue || 0,
      roomsFree,
      roomsTotal,
      rating,
      weekly,
    });
  })
);

export default router;
