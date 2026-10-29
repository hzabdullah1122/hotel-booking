import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true, min: 1, max: 10 },
    text: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true }
);

// one review per guest per hotel
reviewSchema.index({ hotel: 1, user: 1 }, { unique: true });

reviewSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Review", reviewSchema);
