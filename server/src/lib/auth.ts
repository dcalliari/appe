import { env } from "@server/env";
import type { JWTPayload } from "@server/types";
import { createMiddleware } from "hono/factory";
import { sign, verify } from "hono/jwt";

type Env = {
	Bindings: {
		JWT_SECRET: string;
	};
	Variables: {
		user: JWTPayload;
	};
};

export const generateToken = async (
	userId: string,
	apartment: string,
	role: string,
	secret: string,
): Promise<string> => {
	const payload = {
		userId,
		apartment,
		role,
		exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
	};

	return await sign(payload, secret);
};

export const hashPassword = async (password: string): Promise<string> => {
	const encoder = new TextEncoder();
	const data = encoder.encode(`${password}salt`);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const comparePassword = async (
	password: string,
	hash: string,
): Promise<boolean> => {
	const hashedInput = await hashPassword(password);
	return hashedInput === hash;
};

export const authenticateToken = createMiddleware<Env>(async (c, next) => {
	const authHeader = c.req.header("authorization");
	const token = authHeader?.split(" ")[1];

	if (!token) {
		if (env.NODE_ENV === "development") {
			return await next();
		}
		return c.json({ error: "Token de acesso requerido" }, 401);
	}

	try {
		const payload = (await verify(
			token,
			env.JWT_SECRET,
		)) as unknown as JWTPayload;
		c.set("user", payload);
		await next();
	} catch {
		return c.json({ error: "Token inválido" }, 403);
	}
});

export const requireRole = (roles: string[]) => {
	return createMiddleware<Env>(async (c, next) => {
		const user = c.get("user");

		if (!user || !roles.includes(user.role)) {
			return c.json({ error: "Acesso negado" }, 403);
		}

		await next();
	});
};
