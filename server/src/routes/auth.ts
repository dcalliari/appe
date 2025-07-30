import { zValidator } from "@hono/zod-validator";
import { db } from "@server/db";
import { usersInAppe } from "@server/db/schema";
import { env } from "@server/env";
import {
	authenticateToken,
	comparePassword,
	generateToken,
	hashPassword,
} from "@server/lib/auth";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

export const authRoutes = new Hono();

const loginSchema = z.object({
	apartment: z.string().min(1, "Apartamento é obrigatório"),
	password: z.string().min(1, "Senha é obrigatória"),
});

const updateProfileSchema = z.object({
	name: z.string().min(1).optional(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	password: z.string().min(6).optional(),
});

authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
	try {
		const { apartment, password } = c.req.valid("json");

		const [user] = await db
			.select()
			.from(usersInAppe)
			.where(eq(usersInAppe.apartment, apartment))
			.limit(1);

		if (!user) {
			return c.json({ error: "Apartamento ou senha inválidos" }, 401);
		}

		const isValidPassword = await comparePassword(password, user.passwordHash);

		if (!isValidPassword) {
			return c.json({ error: "Apartamento ou senha inválidos" }, 401);
		}

		const token = await generateToken(
			user.id,
			user.apartment,
			user.role || "resident",
			env.JWT_SECRET,
		);

		const { ...userWithoutPassword } = user;

		return c.json({
			token,
			user: userWithoutPassword,
		});
	} catch (error) {
		console.error("Erro no login:", error);
		return c.json({ error: "Erro interno do servidor" }, 500);
	}
});

authRoutes.get("/profile", authenticateToken, async (c) => {
	try {
		const { userId } = c.get("user");

		const [user] = await db
			.select({
				id: usersInAppe.id,
				apartment: usersInAppe.apartment,
				name: usersInAppe.name,
				email: usersInAppe.email,
				role: usersInAppe.role,
				phone: usersInAppe.phone,
				createdAt: usersInAppe.createdAt,
			})
			.from(usersInAppe)
			.where(eq(usersInAppe.id, userId))
			.limit(1);

		if (!user) {
			return c.json({ error: "Usuário não encontrado" }, 404);
		}

		return c.json({ user });
	} catch (error) {
		console.error("Erro ao buscar perfil:", error);
		return c.json({ error: "Erro interno do servidor" }, 500);
	}
});

authRoutes.put(
	"/profile",
	authenticateToken,
	zValidator("json", updateProfileSchema),
	async (c) => {
		try {
			const { userId } = c.get("user");
			const updates = c.req.valid("json");

			const dataToUpdate: {
				name?: string;
				email?: string;
				phone?: string;
				passwordHash?: string;
			} = {};

			if (updates.name) dataToUpdate.name = updates.name;
			if (updates.email) dataToUpdate.email = updates.email;
			if (updates.phone) dataToUpdate.phone = updates.phone;
			if (updates.password) {
				dataToUpdate.passwordHash = await hashPassword(updates.password);
			}

			const [user] = await db
				.update(usersInAppe)
				.set(dataToUpdate)
				.where(eq(usersInAppe.id, userId))
				.returning({
					id: usersInAppe.id,
					apartment: usersInAppe.apartment,
					name: usersInAppe.name,
					email: usersInAppe.email,
					role: usersInAppe.role,
					phone: usersInAppe.phone,
					createdAt: usersInAppe.createdAt,
				});

			return c.json({
				message: "Perfil atualizado com sucesso",
				user,
			});
		} catch (error) {
			console.error("Erro ao atualizar perfil:", error);
			return c.json({ error: "Erro interno do servidor" }, 500);
		}
	},
);

authRoutes.get("/verify", authenticateToken, async (c) => {
	return c.json({
		valid: true,
		user: c.get("user"),
	});
});
