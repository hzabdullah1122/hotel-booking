// Dev helper: runs the API against a throw-away in-memory MongoDB, seeded with demo data.
// Use it when MongoDB is not installed:  npm run dev:memory
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";
import { seedDatabase, DEMO } from "./seed/seed.js";

const mongod = await MongoMemoryServer.create();
await connectDB(mongod.getUri("stayfield"));
await seedDatabase();

createApp().listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port} (in-memory database, resets on restart)`);
  console.log(`Owner: ${DEMO.owner.email} / ${DEMO.owner.password}`);
  console.log(`Guest: ${DEMO.guest.email} / ${DEMO.guest.password}`);
});

process.on("SIGINT", async () => {
  await mongod.stop();
  process.exit(0);
});
