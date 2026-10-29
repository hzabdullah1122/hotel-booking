import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    roomType: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1, max: 20 },
    nights: { type: Number, required: true },
    pricePerNight: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    code: { type: String, unique: true },
  },
  { timestamps: true }
);

bookingSchema.index({ hotel: 1, roomType: 1, checkIn: 1, checkOut: 1 });

bookingSchema.pre("validate", function (next) {
  if (!this.code) this.code = "BK-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  next();
});

// "completed" is derived: a confirmed stay whose check-out has passed
bookingSchema.virtual("displayStatus").get(function () {
  if (this.status === "confirmed" && this.checkOut < new Date()) return "completed";
  return this.status;
});

bookingSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Booking", bookingSchema);
