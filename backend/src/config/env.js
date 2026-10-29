const isProd = process.env.NODE_ENV === "production";

if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith("change-me"))) {
  throw new Error("JWT_SECRET must be set to a strong value in production");
}

export const env = {
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/stayfield",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrls: (process.env.CLIENT_URL || "http://localhost:3000").split(",").map((s) => s.trim()),
  dnsServers: (process.env.DNS_SERVERS || "").split(",").map((s) => s.trim()).filter(Boolean),
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    fromEmail: process.env.SENDER_EMAIL || "",
    fromName: process.env.SENDER_NAME || "Stayfield",
  },
};
