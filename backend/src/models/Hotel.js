import mongoose from "mongoose";

export const CITIES = ["Karachi", "Lahore", "Islamabad", "Murree", "Hunza", "Tharparkar"];
export const TYPES = ["Hotel", "Lodge", "Heritage", "Resort", "Inn", "Camp"];

const roomTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  beds: { type: String, trim: true, default: "" },
  size: { type: String, trim: true, default: "" },
  price: { type: Number, required: true, min: 500 },
  count: { type: Number, required: true, min: 1, max: 500 }, // total rooms of this type
  perks: [{ type: String, trim: true }],
});

const hotelSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    city: { type: String, required: true, enum: CITIES, index: true },
    area: { type: String, trim: true, default: "" },
    type: { type: String, required: true, enum: TYPES },
    stars: { type: Number, min: 1, max: 5, default: 3 },
    about: { type: String, trim: true, maxlength: 3000, default: "" },
    amenities: [{ type: String, trim: true }],
    images: [{ type: String }],
    freeCancel: { type: Boolean, default: true },
    breakfast: { type: Boolean, default: false },
    roomTypes: {
      type: [roomTypeSchema],
      validate: (v) => v.length > 0,
      message: "At least one room type is required",
    },

    // derived
    price: { type: Number, index: true }, // lowest room price
    oldPrice: { type: Number },
    rating: { type: Number, default: 0 }, // 0-10
    reviewsCount: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

hotelSchema.index({ name: "text", city: "text", area: "text" });

hotelSchema.pre("save", function (next) {
  if (this.roomTypes.length) this.price = Math.min(...this.roomTypes.map((r) => r.price));
  next();
});

hotelSchema.virtual("totalRooms").get(function () {
  return (this.roomTypes || []).reduce((s, r) => s + r.count, 0);
});

hotelSchema.virtual("label").get(function () {
  const r = this.rating;
  if (!this.reviewsCount) return "New";
  if (r >= 9.3) return "Exceptional";
  if (r >= 9) return "Superb";
  if (r >= 8.5) return "Fabulous";
  if (r >= 8) return "Very good";
  if (r >= 7) return "Good";
  return "Pleasant";
});

hotelSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Hotel", hotelSchema);
