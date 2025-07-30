import { zValidator } from "@hono/zod-validator";
import { db } from "@server/db";
import { chatMessagesInAppe, usersInAppe } from "@server/db/schema";
import { authenticateToken } from "@server/lib/auth";
import { and, desc, eq, ne, or } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";
import { z } from "zod";

export const chatRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>();

const sendMessageSchema = z.object({
	to_user_id: z.string().min(1, "Destinatário é obrigatório"),
	message: z.string().min(1, "Mensagem é obrigatória"),
});

chatRoutes.get("/users", authenticateToken, async (c) => {
	try {
		const { userId } = c.get("user");

		const users = await db
			.select({
				id: usersInAppe.id,
				name: usersInAppe.name,
				role: usersInAppe.role,
				apartment: usersInAppe.apartment,
			})
			.from(usersInAppe)
			.where(
				and(
					or(eq(usersInAppe.role, "admin"), eq(usersInAppe.role, "doorman")),
					ne(usersInAppe.id, userId),
				),
			);

		return c.json({ users });
	} catch (error) {
		console.error("Erro ao buscar usuários:", error);
		return c.json({ error: "Erro interno do servidor" }, 500);
	}
});

chatRoutes.get("/conversations", authenticateToken, async (c) => {
	try {
		const { userId } = c.get("user");

		const userMessages = await db
			.select()
			.from(chatMessagesInAppe)
			.where(
				or(
					eq(chatMessagesInAppe.fromUserId, userId),
					eq(chatMessagesInAppe.toUserId, userId),
				),
			)
			.orderBy(desc(chatMessagesInAppe.createdAt));

		const conversations = new Map();

		userMessages.forEach((msg) => {
			const otherUserId =
				msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;

			if (!conversations.has(otherUserId)) {
				conversations.set(otherUserId, {
					user_id: otherUserId,
					last_message: msg,
					unread_count: 0,
				});
			} else {
				const conv = conversations.get(otherUserId);
				if (
					msg.createdAt &&
					conv.last_message.createdAt &&
					msg.createdAt > conv.last_message.createdAt
				) {
					conv.last_message = msg;
				}
			}

			if (msg.toUserId === userId && !msg.isRead) {
				conversations.get(otherUserId).unread_count++;
			}
		});

		return c.json({ conversations: Array.from(conversations.values()) });
	} catch (error) {
		console.error("Erro ao buscar conversas:", error);
		return c.json({ error: "Erro interno do servidor" }, 500);
	}
});

chatRoutes.get("/messages/:userId", authenticateToken, async (c) => {
	try {
		const { userId } = c.get("user");
		const otherUserId = c.req.param("userId");

		if (!otherUserId) {
			return c.json({ error: "Usuário destinatário é obrigatório" }, 400);
		}

		const messages = await db
			.select()
			.from(chatMessagesInAppe)
			.where(
				or(
					and(
						eq(chatMessagesInAppe.fromUserId, userId),
						eq(chatMessagesInAppe.toUserId, otherUserId),
					),
					and(
						eq(chatMessagesInAppe.fromUserId, otherUserId),
						eq(chatMessagesInAppe.toUserId, userId),
					),
				),
			)
			.orderBy(chatMessagesInAppe.createdAt);

		await db
			.update(chatMessagesInAppe)
			.set({ isRead: true })
			.where(
				and(
					eq(chatMessagesInAppe.toUserId, userId),
					eq(chatMessagesInAppe.fromUserId, otherUserId),
					eq(chatMessagesInAppe.isRead, false),
				),
			);

		return c.json({ messages });
	} catch (error) {
		console.error("Erro ao buscar mensagens:", error);
		return c.json({ error: "Erro interno do servidor" }, 500);
	}
});

chatRoutes.post(
	"/send",
	authenticateToken,
	zValidator("json", sendMessageSchema),
	async (c) => {
		try {
			const { userId } = c.get("user");
			const { to_user_id, message } = c.req.valid("json");

			if (to_user_id === userId) {
				return c.json(
					{ error: "Você não pode enviar mensagens para si mesmo" },
					400,
				);
			}

			const newMessage = await db
				.insert(chatMessagesInAppe)
				.values({
					id: crypto.randomUUID(),
					fromUserId: userId,
					toUserId: to_user_id,
					message,
					isRead: false,
					createdAt: new Date().toISOString(),
				})
				.returning();

			return c.json(
				{
					message: "Mensagem enviada com sucesso",
					chat_message: newMessage,
					success: true,
				},
				201,
			);
		} catch (error) {
			console.error("Erro ao enviar mensagem:", error);
			return c.json({ error: "Erro interno do servidor" }, 500);
		}
	},
);
