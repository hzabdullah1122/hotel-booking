import { Router } from "express";
import { z } from "zod";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import { sendBookingEmails, sendStatusEmail } from "../utils/mailer.js";
import { protect } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/http.js";
import { stayRange } from "../utils/dates.js";
import { roomsLeft, isOverbooked } from "../utils/availability.js";

const router = Router();

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const createInput = z.object({
  hotelId: z.string().length(24),
  roomType: z.string().trim().min(1),
  checkIn: day,
  checkOut: day,
  guests: z.coerce.number().int().min(1).max(20),
});

// ----- create a booking -----
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const body = createInput.parse(req.body);
    const { checkIn, checkOut, nights } = stayRange(body.checkIn, body.checkOut);

    const hotel = await Hotel.findById(body.hotelId);
    if (!hotel || !hotel.published) throw new ApiError(404, "Hotel not found");
    if (String(hotel.owner) === String(req.user._id)) throw new ApiError(403, "You cannot book your own hotel");

    const room = hotel.roomTypes.find((r) => r.name === body.roomType);
    if (!room) throw new ApiError(400, "Unknown room type");

    const left = await roomsLeft(hotel, checkIn, checkOut);
    if ((left[room.name] ?? 0) < 1) throw new ApiError(409, "No rooms of this type are available for those dates");

    const booking = await Booking.create({
      user: req.user._id,
      hotel: hotel._id,
      roomType: room.name,
      checkIn,
      checkOut,
      guests: body.guests,
      nights,
      pricePerNight: room.price,
      total: room.price * nights,
    });

    // two guests can pass the check above at the same moment; re-check and back out if we went over
    if (await isOverbooked(hotel, room.name, checkIn, checkOut)) {
      await booking.deleteOne();
      throw new ApiError(409, "Someone just booked the last room. Please pick other dates or room.");
    }

    // sent before responding: serverless hosts freeze the function once the response is out
    try {
      const owner = await User.findById(hotel.owner);
      await sendBookingEmails({ booking, hotel, guest: req.user, owner });
    } catch (err) {
      console.error("Booking email failed:", err.message);
    }

    res.status(201).json({ booking });
  })
);

// ----- guest: my trips -----
router.get(
  "/mine",
  protect,
  asyncHandler(async (req, res) => {
    const items = await Booking.find({ user: req.user._id })
      .populate("hotel", "name city area images")
      .sort("-createdAt");
    res.json({ items });
  })
);

// ----- owner: bookings across my hotels -----
router.get(
  "/owner",
  protect,
  asyncHandler(async (req, res) => {
    const q = z
      .object({ hotelId: z.string().length(24).optional(), status: z.enum(["pending", "confirmed", "cancelled"]).optional() })
      .parse(req.query);

    const mine = await Hotel.find({ owner: req.user._id }).select("_id");
    const ids = mine.map((h) => h._id);
    const filter = { hotel: { $in: ids } };
    if (q.hotelId) {
      if (!ids.some((id) => String(id) === q.hotelId)) throw new ApiError(403, "This is not your hotel");
      filter.hotel = q.hotelId;
    }
    if (q.status) filter.status = q.status;

    const items = await Booking.find(filter)
      .populate("hotel", "name city")
      .populate("user", "name email")
      .sort("-createdAt");
    res.json({ items });
  })
);

// ----- change status -----
// owner: pending -> confirmed | cancelled, confirmed -> cancelled
// guest: cancel their own upcoming booking
router.patch(
  "/:id/status",
  protect,
  asyncHandler(async (req, res) => {
    const { status } = z.object({ status: z.enum(["confirmed", "cancelled"]) }).parse(req.body);
    const booking = await Booking.findById(req.params.id).populate("hotel", "owner");
    if (!booking) throw new ApiError(404, "Booking not found");

    const isOwner = String(booking.hotel.owner) === String(req.user._id);
    const isGuest = String(booking.user) === String(req.user._id);
    if (!isOwner && !isGuest) throw new ApiError(403, "Not allowed");

    if (booking.status === "cancelled") throw new ApiError(409, "This booking is already cancelled");

    if (status === "confirmed") {
      if (!isOwner) throw new ApiError(403, "Only the hotel owner can confirm a booking");
      if (booking.status !== "pending") throw new ApiError(409, "Only pending bookings can be confirmed");
    }
    if (status === "cancelled" && !isOwner && booking.checkIn <= new Date()) {
      throw new ApiError(409, "This stay has already started");
    }

    booking.status = status;
    await booking.save();

    // tell the guest, unless they made the change themselves
    if (!isGuest) {
      try {
        const [hotel, guest] = await Promise.all([Hotel.findById(booking.hotel._id), User.findById(booking.user)]);
        if (hotel && guest) await sendStatusEmail({ booking, hotel, guest });
      } catch (err) {
        console.error("Status email failed:", err.message);
      }
    }
    res.json({ booking });
  })
);

export default router;
