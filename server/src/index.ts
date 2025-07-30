import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared/dist";
import { authRoutes } from "./routes/auth";

export const app = new Hono()

	.use(cors())

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
