import multer from "multer";
import mongoose from "mongoose";
import Image from "../models/Image.js";
import { ApiError } from "../utils/http.js";

const TYPES = ["image/jpeg", "image/png", "image/webp"];

// files are kept in memory, then written to MongoDB by saveFiles()
const memory = multer.memoryStorage();
const fileFilter = (_req, file, cb) =>
  TYPES.includes(file.mimetype) ? cb(null, true) : cb(new ApiError(400, "Only JPG, PNG or WebP images are allowed"));

export const uploadImages = multer({ storage: memory, limits: { fileSize: 5 * 1024 * 1024, files: 8 }, fileFilter }).array("images", 8);
export const uploadAvatar = multer({ storage: memory, limits: { fileSize: 2 * 1024 * 1024, files: 1 }, fileFilter }).single("avatar");

// stores uploaded files and returns their public paths, e.g. "/uploads/66f1..."
export async function saveFiles(files = []) {
  const docs = await Image.insertMany(files.map((f) => ({ data: f.buffer, contentType: f.mimetype })));
  return docs.map((d) => `/uploads/${d._id}`);
}

export async function removeUploads(urls = []) {
  const ids = urls
    .filter((u) => typeof u === "string" && u.startsWith("/uploads/"))
    .map((u) => u.slice("/uploads/".length))
    .filter((id) => mongoose.isValidObjectId(id));
  if (ids.length) await Image.deleteMany({ _id: { $in: ids } }).catch(() => {});
}
