import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z
		.string()
		.transform(Number)
		.pipe(z.number().int().positive())
		.default(3000),
	DATABASE_URL: z.url("Invalid database URL"),
	FRONTEND_URL: z.url("Invalid frontend URL"),
	JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(Bun.env);

export { envSchema };
