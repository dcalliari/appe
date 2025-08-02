import { db } from "@server/db";
import { documentCategoryInAppe, documentsInAppe } from "@server/db/schema";
import { authenticateToken, requireRole } from "@server/lib/auth";
import { and, desc, eq, like, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";

export const documentsRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>()

	.get("/categories", authenticateToken, async (c) => {
		const categories = documentCategoryInAppe.enumValues.map((value) => {
			const labels = {
				meeting_minutes: "Atas de Reuniões",
				bills: "Boletos e Taxas",
				regulations: "Regulamentos",
				announcements: "Comunicados",
			};
			return { value, label: labels[value] };
		});
		return c.json({ categories });
	})

	.get("/", authenticateToken, async (c) => {
		try {
			const category = c.req.query("category") as
				| (typeof documentCategoryInAppe.enumValues)[number]
				| undefined;
			const search = c.req.query("search");

			const filters: SQL[] = [];

			if (category) filters.push(eq(documentsInAppe.category, category));
			if (search) filters.push(like(documentsInAppe.title, `%${search}%`));

			const documentsList = await db
				.select()
				.from(documentsInAppe)
				.where(and(...filters))
				.orderBy(desc(documentsInAppe.uploaded_at));

			return c.json({ success: true, data: documentsList }, 200);
		} catch (error) {
			console.error("Error fetching documents:", error);
			return c.json({ error: "Error fetching documents" }, 500);
		}
	})

	.get("/:id", authenticateToken, async (c) => {
		try {
			const { id } = c.req.param();
			const [document] = await db
				.select()
				.from(documentsInAppe)
				.where(eq(documentsInAppe.id, id))
				.limit(1);
			if (!document) {
				return c.json({ error: "Document not found" }, 404);
			}
			return c.json(document, 200);
		} catch (error) {
			console.error("Error fetching document:", error);
			return c.json({ error: "Error fetching document" }, 500);
		}
	})

	.post("/", authenticateToken, requireRole(["admin"]), async (c) => {
		try {
			const newDocument = await c.req.json();
			const [result] = await db
				.insert(documentsInAppe)
				.values(newDocument)
				.returning();
			return c.json(result, 201);
		} catch (error) {
			console.error("Error creating document:", error);
			return c.json({ error: "Error creating document" }, 500);
		}
	})

	.put("/:id", authenticateToken, requireRole(["admin"]), async (c) => {
		try {
			const { id } = c.req.param();
			const updatedDocument = await c.req.json();
			const [result] = await db
				.update(documentsInAppe)
				.set(updatedDocument)
				.where(eq(documentsInAppe.id, id))
				.returning();
			if (!result) {
				return c.json({ error: "Document not found" }, 404);
			}
			return c.json(result, 200);
		} catch (error) {
			console.error("Error updating document:", error);
			return c.json({ error: "Error updating document" }, 500);
		}
	})

	.delete("/:id", authenticateToken, requireRole(["admin"]), async (c) => {
		try {
			const { id } = c.req.param();
			const [result] = await db
				.delete(documentsInAppe)
				.where(eq(documentsInAppe.id, id))
				.returning();
			if (!result) {
				return c.json({ error: "Document not found" }, 404);
			}
			return c.json({ message: "Document deleted successfully" }, 200);
		} catch (error) {
			console.error("Error deleting document:", error);
			return c.json({ error: "Error deleting document" }, 500);
		}
	})

	.get("/:id/download", authenticateToken, async (c) => {
		try {
			const { id } = c.req.param();
			const [document] = await db
				.select()
				.from(documentsInAppe)
				.where(eq(documentsInAppe.id, id))
				.limit(1);

			if (!document) {
				return c.json({ error: "Document not found" }, 404);
			}

			const filePath = document.file_path;
			if (!filePath) {
				return c.json({ error: "File path not found" }, 404);
			}
			const fileBuffer = await Bun.file(filePath).arrayBuffer();
			return c.body(fileBuffer);
		} catch (error) {
			console.error("Error downloading document:", error);
			return c.json({ error: "Error downloading document" }, 500);
		}
	});
