import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

// some networks refuse SRV lookups (mongodb+srv://), so allow overriding the resolvers
if (env.dnsServers.length) {
  try {
    dns.setServers(env.dnsServers);
  } catch (err) {
    console.warn("Ignoring DNS_SERVERS:", err.message); // a typo here should not take the whole API down
  }
}

export async function connectDB(uri, { timeoutMs = 5000 } = {}) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: timeoutMs });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}
