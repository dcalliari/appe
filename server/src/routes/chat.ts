import { zValidator } from "@hono/zod-validator";
import { db } from "@server/db";
import { chatMessagesInAppe, usersInAppe } from "@server/db/schema";
import { authenticateToken } from "@server/lib/auth";
import { sendMessageSchema } from "@server/schemas/chat";
import { and, desc, eq, ne, or } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";

export const chatRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>()

	.get("/users", authenticateToken, async (c) => {
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
	})

	.get("/conversations", authenticateToken, async (c) => {
		try {
			const { userId } = c.get("user");

			const userMessages = await db
				.select()
				.from(chatMessagesInAppe)
				.where(
					or(
						eq(chatMessagesInAppe.from_user_id, userId),
						eq(chatMessagesInAppe.to_user_id, userId),
					),
				)
				.orderBy(desc(chatMessagesInAppe.created_at));

			const conversations = new Map();

			userMessages.forEach((msg) => {
				const otherUserId =
					msg.from_user_id === userId ? msg.to_user_id : msg.from_user_id;

				if (!conversations.has(otherUserId)) {
					conversations.set(otherUserId, {
						user_id: otherUserId,
						last_message: msg,
						unread_count: 0,
					});
				} else {
					const conv = conversations.get(otherUserId);
					if (
						msg.created_at &&
						conv.last_message.createdAt &&
						msg.created_at > conv.last_message.createdAt
					) {
						conv.last_message = msg;
					}
				}

				if (msg.to_user_id === userId && !msg.is_read) {
					conversations.get(otherUserId).unread_count++;
				}
			});

			return c.json({ conversations: Array.from(conversations.values()) });
		} catch (error) {
			console.error("Erro ao buscar conversas:", error);
			return c.json({ error: "Erro interno do servidor" }, 500);
		}
	})

	.get("/messages/:userId", authenticateToken, async (c) => {
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
							eq(chatMessagesInAppe.from_user_id, userId),
							eq(chatMessagesInAppe.to_user_id, otherUserId),
						),
						and(
							eq(chatMessagesInAppe.from_user_id, otherUserId),
							eq(chatMessagesInAppe.to_user_id, userId),
						),
					),
				)
				.orderBy(chatMessagesInAppe.created_at);

			await db
				.update(chatMessagesInAppe)
				.set({ is_read: true })
				.where(
					and(
						eq(chatMessagesInAppe.to_user_id, userId),
						eq(chatMessagesInAppe.from_user_id, otherUserId),
						eq(chatMessagesInAppe.is_read, false),
					),
				);

			return c.json({ messages });
		} catch (error) {
			console.error("Erro ao buscar mensagens:", error);
			return c.json({ error: "Erro interno do servidor" }, 500);
		}
	})

	.post(
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
						from_user_id: userId,
						to_user_id: to_user_id,
						message,
						is_read: false,
						created_at: new Date().toISOString(),
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
