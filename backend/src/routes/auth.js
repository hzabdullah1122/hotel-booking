import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import User from "../models/User.js";
import { protect, signToken } from "../middleware/auth.js";
import { uploadAvatar, saveFiles, removeUploads } from "../middleware/upload.js";
import { ApiError, asyncHandler } from "../utils/http.js";

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, try again in a few minutes" },
});

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const session = (user) => ({ token: signToken(user), user });

router.post(
  "/register",
  limiter,
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    if (await User.exists({ email: body.email })) throw new ApiError(409, "An account with this email already exists");
    const user = await User.create(body);
    res.status(201).json(session(user));
  })
);

router.post(
  "/login",
  limiter,
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({ email: body.email }).select("+password");
    if (!user || !(await user.matchPassword(body.password))) throw new ApiError(401, "Incorrect email or password");
    res.json(session(user));
  })
);

router.get("/me", protect, (req, res) => res.json({ user: req.user }));

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  removeAvatar: z.enum(["true", "false"]).optional(),
});

// multipart: name, optional avatar file, optional removeAvatar=true
router.patch(
  "/me",
  protect,
  uploadAvatar,
  asyncHandler(async (req, res) => {
    const body = profileSchema.parse(req.body);
    const old = req.user.avatar;
    req.user.name = body.name;
    if (req.file) [req.user.avatar] = await saveFiles([req.file]);
    else if (body.removeAvatar === "true") req.user.avatar = "";
    await req.user.save();
    if (old && old !== req.user.avatar) await removeUploads([old]);
    res.json({ user: req.user });
  })
);

const passwordSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(6).max(100),
});

router.put(
  "/password",
  protect,
  limiter,
  asyncHandler(async (req, res) => {
    const body = passwordSchema.parse(req.body);
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(body.current))) throw new ApiError(400, "Current password is incorrect");
    user.password = body.next;
    await user.save();
    res.json({ ok: true });
  })
);

export default router;
