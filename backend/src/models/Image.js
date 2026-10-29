import mongoose from "mongoose";

// Uploaded photos live in MongoDB so they survive redeploys and work on hosts with a read-only or temporary disk.
const imageSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);
