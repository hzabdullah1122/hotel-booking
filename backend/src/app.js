import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import Image from "./models/Image.js";
import { notFound, errorHandler } from "./middleware/error.js";
import authRoutes from "./routes/auth.js";
import hotelRoutes from "./routes/hotels.js";
import bookingRoutes from "./routes/bookings.js";
import ownerRoutes from "./routes/owner.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1); // behind Vercel / Render, so rate limiting sees the real client IP

  // images are loaded by the frontend from another origin
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  // in development any localhost port is fine (Next may start on 3001 if 3000 is busy)
  const localhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || env.clientUrls.includes(origin) || (!env.isProd && localhost.test(origin))),
    })
  );
  if (!env.isProd) app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));

  // photos are stored in MongoDB; ids never change, so they can be cached for good
  app.get("/uploads/:id", async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) return res.sendStatus(404);
      const img = await Image.findById(req.params.id);
      if (!img) return res.sendStatus(404);
      res.set({ "Content-Type": img.contentType, "Cache-Control": "public, max-age=31536000, immutable" });
      res.send(img.data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/health", (_req, res) =>
    res.json({ ok: true, db: mongoose.connection.readyState === 1 ? "connected" : "down" })
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/hotels", hotelRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/owner", ownerRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
