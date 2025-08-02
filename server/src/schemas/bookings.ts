import { z } from "zod";

export const createBookingSchema = z.object({
	space_name: z.string().min(1),
	booking_date: z.string().transform((str) => {
		const date = new Date(str);
		return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
	}),
	start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
	end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

export const updateBookingSchema = z.object({
	space_name: z.string().min(1).optional(),
	booking_date: z
		.string()
		.transform((str) => {
			const date = new Date(str);
			return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
		})
		.optional(),
	start_time: z
		.string()
		.regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
		.optional(),
	end_time: z
		.string()
		.regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
		.optional(),
	status: z.enum(["pending", "approved", "rejected"]).optional(),
});
