import { zValidator } from "@hono/zod-validator";
import { db } from "@server/db";
import { usersInAppe, visitorRequestsInAppe } from "@server/db/schema";
import { authenticateToken, requireRole } from "@server/lib/auth";
import {
	createVisitorSchema,
	updateVisitorSchema,
} from "@server/schemas/visitors";
import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";

export const visitorsRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>()

	.get("/", authenticateToken, async (c) => {
		try {
			const userPayload = c.get("user");

			const whereClause =
				userPayload.role === "admin"
					? ""
					: sql`${visitorRequestsInAppe.requester_id} = ${userPayload.userId}`;

			const visitors = await db
				.select()
				.from(visitorRequestsInAppe)
				.innerJoin(
					usersInAppe,
					eq(visitorRequestsInAppe.requester_id, usersInAppe.id),
				)
				.where(sql`${whereClause}`)
				.orderBy(visitorRequestsInAppe.created_at);

			return c.json(
				{
					success: true,
					data: visitors,
				},
				200,
			);
		} catch (error) {
			console.error("Error fetching visitors:", error);
			return c.json({ success: false, error: "Failed to fetch visitors" }, 500);
		}
	})

	.get("/:id", authenticateToken, async (c) => {
		try {
			const id = c.req.param("id");
			const userPayload = c.get("user");

			const [visitor] = await db
				.select()
				.from(visitorRequestsInAppe)
				.innerJoin(
					usersInAppe,
					eq(visitorRequestsInAppe.requester_id, usersInAppe.id),
				)
				.where(eq(visitorRequestsInAppe.id, id))
				.limit(1);

			if (!visitor) {
				return c.json({ success: false, error: "Visitor not found" }, 404);
			}

			if (
				userPayload.role !== "admin" &&
				visitor.visitor_requests.requester_id !== userPayload.userId
			) {
				return c.json({ success: false, error: "Unauthorized access" }, 403);
			}

			return c.json({ success: true, data: visitor }, 200);
		} catch (error) {
			console.error("Error fetching visitor:", error);
			return c.json({ success: false, error: "Failed to fetch visitor" }, 500);
		}
	})

	.post(
		"/",
		authenticateToken,
		zValidator("json", createVisitorSchema),
		async (c) => {
			try {
				const userPayload = c.get("user");
				const validatedData = c.req.valid("json");

				const [newVisitor] = await db
					.insert(visitorRequestsInAppe)
					.values({
						id: crypto.randomUUID(),
						requester_id: userPayload.userId,
						visitor_name: validatedData.visitor_name,
						visitor_document: validatedData.visitor_document,
						visit_date: validatedData.visit_date as string,
						visit_time: validatedData.visit_time,
						status: "pending",
					})
					.returning();

				return c.json(
					{
						success: true,
						message: "Visitor created successfully",
						data: newVisitor,
					},
					201,
				);
			} catch (error) {
				console.error("Error creating visitor:", error);
				return c.json(
					{ success: false, error: "Failed to create visitor" },
					500,
				);
			}
		},
	)

	.put(
		"/:id",
		authenticateToken,
		zValidator("json", updateVisitorSchema),
		async (c) => {
			try {
				const id = c.req.param("id");
				const userPayload = c.get("user");
				const validatedData = c.req.valid("json");

				const [existingVisitor] = await db
					.select()
					.from(visitorRequestsInAppe)
					.where(eq(visitorRequestsInAppe.id, id))
					.limit(1);

				if (!existingVisitor) {
					return c.json({ success: false, error: "Visitor not found" }, 404);
				}

				if (
					userPayload.role !== "admin" &&
					existingVisitor.requester_id !== userPayload.userId
				) {
					return c.json({ success: false, error: "Unauthorized access" }, 403);
				}

				if (validatedData.status && userPayload.role !== "admin") {
					return c.json(
						{ success: false, error: "Only admins can update the status" },
						403,
					);
				}

				const [updatedVisitor] = await db
					.update(visitorRequestsInAppe)
					.set(validatedData)
					.where(eq(visitorRequestsInAppe.id, id))
					.returning();

				return c.json({
					success: true,
					message: "Solicitação atualizada com sucesso",
					data: updatedVisitor,
				});
			} catch (error) {
				console.error("Error updating visitor:", error);
				return c.json(
					{ success: false, error: "Failed to update visitor" },
					500,
				);
			}
		},
	)

	.delete("/:id", authenticateToken, async (c) => {
		try {
			const id = c.req.param("id");
			const userPayload = c.get("user");

			const [existingVisitor] = await db
				.select()
				.from(visitorRequestsInAppe)
				.where(eq(visitorRequestsInAppe.id, id))
				.limit(1);

			if (!existingVisitor) {
				return c.json({ success: false, error: "Visitor not found" }, 404);
			}

			if (
				userPayload.role !== "admin" &&
				existingVisitor.requester_id !== userPayload.userId
			) {
				return c.json({ success: false, error: "Unauthorized access" }, 403);
			}

			await db
				.delete(visitorRequestsInAppe)
				.where(eq(visitorRequestsInAppe.id, id));

			return c.json({
				success: true,
				message: "Solicitação excluída com sucesso",
			});
		} catch (error) {
			console.error("Error deleting visitor:", error);
			return c.json({ success: false, error: "Failed to delete visitor" }, 500);
		}
	})

	.patch(
		"/:id/approve",
		authenticateToken,
		requireRole(["admin"]),
		async (c) => {
			try {
				const id = c.req.param("id");

				const [existingVisitor] = await db
					.select()
					.from(visitorRequestsInAppe)
					.where(eq(visitorRequestsInAppe.id, id))
					.limit(1);

				if (!existingVisitor) {
					return c.json(
						{ success: false, message: "Solicitação não encontrada" },
						404,
					);
				}

				const updatedVisitor = await db
					.update(visitorRequestsInAppe)
					.set({ status: "approved" })
					.where(eq(visitorRequestsInAppe.id, id))
					.returning();

				return c.json({
					success: true,
					message: "Solicitação aprovada com sucesso",
					data: updatedVisitor,
				});
			} catch (error) {
				console.error("Erro ao aprovar solicitação:", error);
				return c.json(
					{ success: false, message: "Erro interno do servidor" },
					500,
				);
			}
		},
	)

	.patch("/:id/reject", authenticateToken, async (c) => {
		try {
			const id = c.req.param("id");
			const userPayload = c.get("user");

			const [existingVisitor] = await db
				.select()
				.from(visitorRequestsInAppe)
				.where(eq(visitorRequestsInAppe.id, id))
				.limit(1);

			if (!existingVisitor) {
				return c.json(
					{ success: false, message: "Solicitação não encontrada" },
					404,
				);
			}

			if (
				userPayload.role !== "admin" &&
				existingVisitor.requester_id !== userPayload.userId
			) {
				return c.json(
					{ success: false, message: "Acesso não autorizado" },
					403,
				);
			}

			const updatedVisitor = await db
				.update(visitorRequestsInAppe)
				.set({ status: "rejected" })
				.where(eq(visitorRequestsInAppe.id, id))
				.returning();

			return c.json({
				success: true,
				message: "Solicitação rejeitada com sucesso",
				data: updatedVisitor,
			});
		} catch (error) {
			console.error("Erro ao rejeitar solicitação:", error);
			return c.json(
				{ success: false, message: "Erro interno do servidor" },
				500,
			);
		}
	});
