import type { Request, RequestHandler } from "express";
import rateLimit from "express-rate-limit";

export const loginLimiter: RequestHandler = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req: Request) => `${req.ip}`,
	message: "Too many login attempts. Please try again later.",
});
