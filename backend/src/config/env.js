// reads a variable, ignoring spaces and quotes that get pasted in by accident (KEY="value")
const get = (name) => (process.env[name] ?? "").trim().replace(/^["']+|["']+$/g, "").trim();

const isProd = get("NODE_ENV") === "production";

if (isProd && (!get("JWT_SECRET") || get("JWT_SECRET").startsWith("change-me"))) {
  throw new Error("JWT_SECRET must be set to a strong value in production");
}

export const env = {
  isProd,
  port: Number(get("PORT")) || 5000,
  mongoUri: get("MONGODB_URI") || "mongodb://127.0.0.1:27017/stayfield",
  jwtSecret: get("JWT_SECRET") || "dev-only-secret",
  jwtExpiresIn: get("JWT_EXPIRES_IN") || "7d",
  clientUrls: (get("CLIENT_URL") || "http://localhost:3000").split(",").map((s) => s.trim()),
  dnsServers: (get("DNS_SERVERS") || "").split(",").map((s) => s.trim()).filter(Boolean),
  smtp: {
    host: get("SMTP_HOST") || "",
    port: Number(get("SMTP_PORT")) || 587,
    user: get("SMTP_USER") || "",
    pass: get("SMTP_PASS") || "",
    fromEmail: get("SENDER_EMAIL") || "",
    fromName: get("SENDER_NAME") || "Stayfield",
  },
};
