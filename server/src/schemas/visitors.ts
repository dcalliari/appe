import { z } from "zod";

export const createVisitorSchema = z.object({
	visitorName: z.string().min(1),
	visitorDocument: z.string().min(11).max(14).optional(),
	visitDate: z.string().transform((str) => new Date(str)),
	visitTime: z
		.string()
		.optional()
		.transform((str) => str || "00:00:00"),
});

export const updateVisitorSchema = z.object({
	visitorName: z.string().min(1).optional(),
	visitorDocument: z.string().min(11).max(14).optional(),
	visitDate: z.string().optional(),
	visitTime: z
		.string()
		.optional()
		.transform((str) => str || "00:00:00"),
	status: z.enum(["pending", "approved", "rejected"]).optional(),
});
