// Vercel serverless entry: the same Express app, with the MongoDB connection reused between invocations.
import mongoose from "mongoose";

let app;
let connecting;

async function init() {
  const { env } = await import("../src/config/env.js");
  const { connectDB } = await import("../src/config/db.js");
  const { createApp } = await import("../src/app.js");
  app = createApp();
  return { env, connectDB };
}

let ready;

// plain Node response, so it works before Express has wrapped `res`
const send = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
};

export default async function handler(req, res) {
  try {
    ready ??= init();
    const { env, connectDB } = await ready;

    if (mongoose.connection.readyState !== 1) {
      connecting ??= connectDB(env.mongoUri, { timeoutMs: 8000 }).catch((err) => {
        connecting = undefined; // allow a retry on the next request
        throw err;
      });
      try {
        await connecting;
      } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        return send(res, 503, { message: "Database is unavailable", reason: err.message });
      }
    }
    return app(req, res);
  } catch (err) {
    ready = undefined; // retry the start-up on the next request
    console.error("API failed to start:", err);
    return send(res, 500, { message: "API failed to start", reason: err.message });
  }
}
