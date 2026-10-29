import { Router } from "express";
import { z } from "zod";
import Hotel, { CITIES, TYPES } from "../models/Hotel.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import { uploadImages, saveFiles, removeUploads } from "../middleware/upload.js";
import { ApiError, asyncHandler } from "../utils/http.js";
import { parseDay, todayUTC, stayRange } from "../utils/dates.js";
import { roomsLeft } from "../utils/availability.js";

const router = Router();

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const bool = z.enum(["true", "false"]).transform((v) => v === "true");

const listQuery = z.object({
  q: z.string().trim().max(80).optional(),
  city: z.enum(CITIES).optional(),
  type: z.string().optional(), // comma separated
  minRating: z.coerce.number().min(0).max(10).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  freeCancel: bool.optional(),
  available: bool.optional(),
  in: day.optional(),
  out: day.optional(),
  sort: z.enum(["recommended", "rating", "low", "high"]).default("recommended"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const roomTypeInput = z.object({
  name: z.string().trim().min(2).max(60),
  beds: z.string().trim().max(60).optional().default(""),
  size: z.string().trim().max(30).optional().default(""),
  price: z.coerce.number().min(500),
  count: z.coerce.number().int().min(1).max(500),
  perks: z.array(z.string().trim().max(40)).max(10).optional().default([]),
});

const hotelInput = z.object({
  name: z.string().trim().min(2).max(100),
  city: z.enum(CITIES),
  area: z.string().trim().max(120).optional().default(""),
  type: z.enum(TYPES),
  stars: z.coerce.number().int().min(1).max(5).optional().default(3),
  about: z.string().trim().max(3000).optional().default(""),
  amenities: z.array(z.string().trim().max(40)).max(30).optional().default([]),
  freeCancel: z.boolean().optional().default(true),
  breakfast: z.boolean().optional().default(false),
  oldPrice: z.coerce.number().min(0).optional(),
  roomTypes: z
    .array(roomTypeInput)
    .min(1)
    .refine((r) => new Set(r.map((x) => x.name.toLowerCase())).size === r.length, "Room type names must be unique"),
});

// multipart sends JSON in a `data` field; plain JSON bodies are accepted too
const payload = (req) => {
  if (typeof req.body?.data === "string") {
    try {
      return JSON.parse(req.body.data);
    } catch {
      throw new ApiError(400, "`data` must be valid JSON");
    }
  }
  return req.body;
};

const withRooms = async (hotel, checkIn, checkOut) => {
  const left = await roomsLeft(hotel, checkIn, checkOut);
  const json = hotel.toJSON();
  json.roomTypes = json.roomTypes.map((r) => ({ ...r, left: left[r.name] ?? 0 }));
  json.rooms = json.roomTypes.reduce((s, r) => s + r.left, 0);
  return json;
};

const rangeFrom = (inStr, outStr) => {
  if (inStr && outStr) return stayRange(inStr, outStr);
  const checkIn = todayUTC();
  return { checkIn, checkOut: new Date(checkIn.getTime() + 86400000) };
};

router.get("/meta", (_req, res) => res.json({ cities: CITIES, types: TYPES }));

// ----- live numbers for the home page hero -----
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const hotels = await Hotel.find({ published: true }).sort({ rating: -1, reviewsCount: -1 });
    const { checkIn, checkOut } = rangeFrom();
    const items = await Promise.all(hotels.map((h) => withRooms(h, checkIn, checkOut)));
    const rated = items.filter((h) => h.reviewsCount > 0);
    const top = rated[0];
    res.json({
      properties: items.length,
      cities: new Set(items.map((h) => h.city)).size,
      roomsFree: items.reduce((s, h) => s + h.rooms, 0),
      avgRating: rated.length ? Math.round((rated.reduce((s, h) => s + h.rating, 0) / rated.length) * 10) / 10 : 0,
      top: top ? { id: top.id, name: top.name, city: top.city, rating: top.rating, label: top.label } : null,
    });
  })
);

// ----- list / search -----
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = listQuery.parse(req.query);
    const filter = { published: true };
    if (q.city) filter.city = q.city;
    if (q.type) {
      const types = q.type.split(",").filter((t) => TYPES.includes(t));
      if (types.length) filter.type = { $in: types };
    }
    if (q.maxPrice != null) filter.price = { $lte: q.maxPrice };
    if (q.minRating) filter.rating = { $gte: q.minRating };
    if (q.freeCancel) filter.freeCancel = true;
    if (q.q) filter.$text = { $search: q.q };

    const sortMap = {
      recommended: { rating: -1, reviewsCount: -1 },
      rating: { rating: -1 },
      low: { price: 1 },
      high: { price: -1 },
    };

    const { checkIn, checkOut } = rangeFrom(q.in, q.out);
    const hotels = await Hotel.find(filter).sort(sortMap[q.sort]);
    let items = await Promise.all(hotels.map((h) => withRooms(h, checkIn, checkOut)));
    if (q.available) items = items.filter((h) => h.rooms > 0);

    const total = items.length;
    items = items.slice((q.page - 1) * q.limit, q.page * q.limit);
    res.json({ total, page: q.page, items });
  })
);

// ----- owner's own hotels -----
router.get(
  "/mine",
  protect,
  asyncHandler(async (req, res) => {
    const hotels = await Hotel.find({ owner: req.user._id }).sort("-createdAt");
    const { checkIn, checkOut } = rangeFrom();
    res.json({ items: await Promise.all(hotels.map((h) => withRooms(h, checkIn, checkOut))) });
  })
);

// ----- single hotel (+ availability for the dates asked) -----
router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const dates = z.object({ in: day.optional(), out: day.optional() }).parse(req.query);
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel || (!hotel.published && String(hotel.owner) !== String(req.user?._id))) {
      throw new ApiError(404, "Hotel not found");
    }
    const { checkIn, checkOut } = rangeFrom(dates.in, dates.out);
    res.json({ hotel: await withRooms(hotel, checkIn, checkOut) });
  })
);

// ----- create -----
router.post(
  "/",
  protect,
  uploadImages,
  asyncHandler(async (req, res) => {
    let uploaded = [];
    try {
      const data = hotelInput.parse(payload(req));
      uploaded = await saveFiles(req.files);
      const hotel = await Hotel.create({ ...data, owner: req.user._id, images: uploaded });
      if (req.user.role === "guest") await User.findByIdAndUpdate(req.user._id, { role: "owner" });
      res.status(201).json({ hotel });
    } catch (err) {
      await removeUploads(uploaded); // don't keep files for a rejected listing
      throw err;
    }
  })
);

// ----- update -----
router.put(
  "/:id",
  protect,
  uploadImages,
  asyncHandler(async (req, res) => {
    let uploaded = [];
    try {
      const hotel = await Hotel.findById(req.params.id);
      if (!hotel) throw new ApiError(404, "Hotel not found");
      if (String(hotel.owner) !== String(req.user._id)) throw new ApiError(403, "This is not your hotel");

      const raw = payload(req);
      const data = hotelInput.partial().extend({ published: z.boolean().optional(), removeImages: z.array(z.string()).optional() }).parse(raw);
      const { removeImages = [], ...fields } = data;
      uploaded = await saveFiles(req.files);

      Object.assign(hotel, fields);
      const removed = hotel.images.filter((u) => removeImages.includes(u));
      hotel.images = [...hotel.images.filter((u) => !removeImages.includes(u)), ...uploaded];
      await hotel.save();
      await removeUploads(removed);
      res.json({ hotel });
    } catch (err) {
      await removeUploads(uploaded);
      throw err;
    }
  })
);

// ----- delete -----
router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) throw new ApiError(404, "Hotel not found");
    if (String(hotel.owner) !== String(req.user._id)) throw new ApiError(403, "This is not your hotel");

    const upcoming = await Booking.exists({
      hotel: hotel._id,
      status: { $in: ["pending", "confirmed"] },
      checkOut: { $gt: new Date() },
    });
    if (upcoming) throw new ApiError(409, "Cancel upcoming bookings before deleting this hotel");

    await hotel.deleteOne();
    await Review.deleteMany({ hotel: hotel._id });
    await removeUploads(hotel.images);
    res.json({ message: "Hotel deleted" });
  })
);

// ----- reviews -----
router.get(
  "/:id/reviews",
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ hotel: req.params.id }).populate("user", "name").sort("-createdAt").limit(50);
    res.json({ items: reviews });
  })
);

const reviewInput = z.object({ score: z.coerce.number().int().min(1).max(10), text: z.string().trim().max(1000).optional().default("") });

router.post(
  "/:id/reviews",
  protect,
  asyncHandler(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) throw new ApiError(404, "Hotel not found");

    // only guests who have actually stayed can review
    const stayed = await Booking.exists({
      hotel: hotel._id,
      user: req.user._id,
      status: "confirmed",
      checkOut: { $lte: new Date() },
    });
    if (!stayed) throw new ApiError(403, "You can review a hotel after your stay");

    const body = reviewInput.parse(req.body);
    const review = await Review.findOneAndUpdate(
      { hotel: hotel._id, user: req.user._id },
      body,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const [agg] = await Review.aggregate([
      { $match: { hotel: hotel._id } },
      { $group: { _id: null, avg: { $avg: "$score" }, n: { $sum: 1 } } },
    ]);
    hotel.rating = Math.round(agg.avg * 10) / 10;
    hotel.reviewsCount = agg.n;
    await hotel.save();

    res.status(201).json({ review, rating: hotel.rating, reviewsCount: hotel.reviewsCount });
  })
);

export default router;
