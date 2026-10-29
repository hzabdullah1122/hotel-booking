import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

// some networks refuse SRV lookups (mongodb+srv://), so allow overriding the resolvers
if (env.dnsServers.length) dns.setServers(env.dnsServers);

export async function connectDB(uri, { timeoutMs = 5000 } = {}) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: timeoutMs });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}
