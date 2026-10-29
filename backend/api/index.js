// Vercel serverless entry: the same Express app, with the MongoDB connection reused between invocations.
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { connectDB } from "../src/config/db.js";
import { createApp } from "../src/app.js";

const app = createApp();
let connecting;

export default async function handler(req, res) {
  if (mongoose.connection.readyState !== 1) {
    connecting ??= connectDB(env.mongoUri, { timeoutMs: 8000 }).catch((err) => {
      connecting = undefined; // allow a retry on the next request
      throw err;
    });
    try {
      await connecting;
    } catch {
      return res.status(503).json({ message: "Database is unavailable, please try again" });
    }
  }
  return app(req, res);
}
