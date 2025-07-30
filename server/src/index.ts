import "dotenv/config";
import { getIp } from "@server/utils/ip";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { routePath } from "hono/route";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "hono-rate-limiter";
import { authRoutes } from "./routes/auth";

export const app = new Hono()

	.use(
		cors({
			origin: (origin, c) => {
				const allowedOrigins = c.env.FRONTEND_URL || "http://localhost:5173";
				return origin === allowedOrigins ? origin : allowedOrigins;
			},
			credentials: true,
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
		}),
	)
	.use(logger())
	.use(secureHeaders())
	.use(
		rateLimiter({
			windowMs: 15 * 60 * 1000,
			limit: 100,
			standardHeaders: "draft-6",
			keyGenerator: (c) => `${getIp(c)}:${c.req.method}:${routePath(c)}`,
		}),
	)

	.get("/", (c) => {
		return c.json({
			message: "🚀 APPÊ API is running!",
			version: "1.0.0",
			timestamp: new Date().toISOString(),
			environment: process.env.NODE_ENV || "development",
		});
	})

	.route("/api/auth", authRoutes)

	.get("/hello", async (c) => {
		const data: ApiResponse = {
			message: "Hello BHVR!",
			success: true,
		};

		return c.json(data, { status: 200 });
	});

export default app;
