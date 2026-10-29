import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

try {
  await connectDB(env.mongoUri, { timeoutMs: 3000 });
} catch (err) {
  if (env.isProd) throw err;

  // Development only: no MongoDB reachable, so use a temporary in-memory one with demo data.
  console.warn("\n⚠  Could not reach MongoDB at", env.mongoUri);
  console.warn("⚠  Using a temporary in-memory database. Data is lost when the server restarts.");
  console.warn("⚠  For permanent data, install MongoDB or put an Atlas URL in MONGODB_URI.\n");

  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const { seedDatabase, DEMO } = await import("./seed/seed.js");
  const mongod = await MongoMemoryServer.create();
  await connectDB(mongod.getUri("stayfield"));
  await seedDatabase();
  console.log(`Demo owner: ${DEMO.owner.email} / ${DEMO.owner.password}`);
  console.log(`Demo guest: ${DEMO.guest.email} / ${DEMO.guest.password}`);
  process.on("SIGINT", async () => {
    await mongod.stop();
    process.exit(0);
  });
}

createApp().listen(env.port, () => console.log(`API running on http://localhost:${env.port}`));
