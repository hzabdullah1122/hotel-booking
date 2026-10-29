import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import { ApiError, asyncHandler } from "../utils/http.js";

export const signToken = (user) =>
  jwt.sign({ sub: String(user._id) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

async function loadUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    return await User.findById(payload.sub);
  } catch {
    return null;
  }
}

export const protect = asyncHandler(async (req, _res, next) => {
  const user = await loadUser(req);
  if (!user) throw new ApiError(401, "Please sign in to continue");
  req.user = user;
  next();
});

// attaches req.user when a valid token is present, never fails
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  req.user = await loadUser(req);
  next();
});
