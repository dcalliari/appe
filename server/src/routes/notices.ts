import { zValidator } from "@hono/zod-validator";
import { db } from "@server/db";
import { noticesInAppe } from "@server/db/schema";
import { authenticateToken, requireRole } from "@server/lib/auth";
import { createNoticeSchema } from "@server/schemas/notices";
import { desc, eq, gte, isNull, or } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";

export const noticesRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>()

	.get("/", authenticateToken, async (c) => {
		try {
			const notices = await db
				.select()
				.from(noticesInAppe)
				.where(
					or(
						isNull(noticesInAppe.expires_at),
						gte(noticesInAppe.expires_at, new Date().toDateString()),
					),
				)
				.orderBy(desc(noticesInAppe.created_at));

			return c.json(
				{
					success: true,
					data: notices,
				},
				200,
			);
		} catch (error) {
			console.error("Error fetching notices:", error);
			return c.json({ success: false, error: "Failed to fetch notices" }, 500);
		}
	})

	.post(
		"/",
		authenticateToken,
		requireRole(["admin"]),
		zValidator("json", createNoticeSchema),
		async (c) => {
			try {
				const { userId, role } = c.get("user");

				if (role !== "admin") {
					return c.json({ error: "Acesso negado" }, 403);
				}

				const data = c.req.valid("json");

				const [newNotice] = await db
					.insert(noticesInAppe)
					.values({
						id: crypto.randomUUID(),
						title: data.title,
						content: data.content,
						type: data.type,
						priority: data.priority,
						created_by: userId,
						expires_at: data.expires_at,
					})
					.returning();

				return c.json(
					{
						success: true,
						message: "Notice created successfully",
						data: newNotice,
					},
					201,
				);
			} catch (error) {
				console.error("Error creating notice:", error);
				return c.json(
					{ success: false, error: "Failed to create notice" },
					500,
				);
			}
		},
	)

	.delete("/:id", authenticateToken, requireRole(["admin"]), async (c) => {
		try {
			const { role } = c.get("user");
			const { id } = c.req.param();

			if (role !== "admin") {
				return c.json({ error: "Acesso negado" }, 403);
			}

			const [existingNotice] = await db
				.select()
				.from(noticesInAppe)
				.where(eq(noticesInAppe.id, id))
				.limit(1)
				.execute();

			if (!existingNotice) {
				return c.json({ success: false, error: "Notice not found" }, 404);
			}

			const [deleted] = await db
				.delete(noticesInAppe)
				.where(eq(noticesInAppe.id, id))
				.returning();

			if (!deleted) {
				return c.json({ success: false, error: "Notice not found" }, 404);
			}

			return c.json(
				{ success: true, message: "Notice deleted successfully" },
				200,
			);
		} catch (error) {
			console.error("Error deleting notice:", error);
			return c.json({ success: false, error: "Failed to delete notice" }, 500);
		}
	});
