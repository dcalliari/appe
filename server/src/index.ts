import { env } from "@server/env";
import { authRoutes } from "@server/routes/auth";
import { chatRoutes } from "@server/routes/chat";
import { visitorsRoutes } from "@server/routes/visitors";
import { getIp } from "@server/utils/ip";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { routePath } from "hono/route";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "hono-rate-limiter";

export const app = new Hono()

	.use(
		cors({
			origin: (origin) => {
				if (env.NODE_ENV === "development") {
					return origin || "*";
				}

				const allowedOrigins = env.FRONTEND_URL || "http://localhost:5173";
				return origin === allowedOrigins ? origin : allowedOrigins;
			},
			credentials: true,
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
		}),
		logger(),
		secureHeaders(),
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
			environment: env.NODE_ENV || "development",
		});
	})

	.route("/api/auth", authRoutes)
	.route("/api/chat", chatRoutes)
	.route("/api/visitors", visitorsRoutes)

	.onError((err, c) => {
		console.error("API Error:", err);
		const data = {
			error: "Internal Server Error",
			message:
				env.NODE_ENV === "development" ? err.message : "Something went wrong",
			success: false,
		};
		return c.json(data, { status: 500 });
	})

	.notFound((c) => {
		return c.json(
			{
				error: "Not Found",
				message: "The requested resource could not be found.",
				success: false,
			},
			{ status: 404 },
		);
	});

export default app;
