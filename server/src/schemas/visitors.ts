import { z } from "zod";

export const createVisitorSchema = z.object({
	visitor_name: z.string().min(1),
	visitor_document: z.string().min(11).max(14).optional(),
	visit_date: z.string().transform((str) => new Date(str)),
	visit_time: z
		.string()
		.optional()
		.transform((str) => str || "00:00:00"),
});

export const updateVisitorSchema = z.object({
	visitor_name: z.string().min(1).optional(),
	visitor_document: z.string().min(11).max(14).optional(),
	visit_date: z.string().optional(),
	visit_time: z
		.string()
		.optional()
		.transform((str) => str || "00:00:00"),
	status: z.enum(["pending", "approved", "rejected"]).optional(),
});
