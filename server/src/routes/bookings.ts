import { zValidator } from "@hono/zod-validator";
import { db } from "@server/db";
import { spaceBookingsInAppe, usersInAppe } from "@server/db/schema";
import { authenticateToken, requireRole } from "@server/lib/auth";
import {
	createBookingSchema,
	updateBookingSchema,
} from "@server/schemas/bookings";
import { and, desc, eq, not, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";

export const bookingsRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>()

	.get("/", authenticateToken, async (c) => {
		try {
			const userPayload = c.get("user");

			const whereClause =
				userPayload.role === "admin"
					? ""
					: sql`${spaceBookingsInAppe.user_id} = ${userPayload.userId}`;

			const bookings = await db
				.select()
				.from(spaceBookingsInAppe)
				.where(sql`${whereClause}`)
				.leftJoin(usersInAppe, eq(spaceBookingsInAppe.user_id, usersInAppe.id))
				.orderBy(desc(spaceBookingsInAppe.created_at));

			return c.json({ success: true, data: bookings }, 200);
		} catch (error) {
			console.error("Error fetching bookings:", error);
			return c.json({ error: "Error fetching bookings" }, 500);
		}
	})

	.get("/:id", authenticateToken, async (c) => {
		try {
			const id = c.req.param("id");
			const userPayload = c.get("user");

			const [booking] = await db
				.select()
				.from(spaceBookingsInAppe)
				.where(eq(spaceBookingsInAppe.id, id))
				.leftJoin(usersInAppe, eq(spaceBookingsInAppe.user_id, usersInAppe.id))
				.limit(1);

			if (!booking) {
				return c.json({ success: false, error: "Booking not found" }, 404);
			}

			if (
				userPayload.role !== "admin" &&
				booking.space_bookings.user_id !== userPayload.userId
			) {
				return c.json({ success: false, error: "Unauthorized access" }, 403);
			}

			return c.json({ success: true, data: booking }, 200);
		} catch (error) {
			console.error("Error fetching booking:", error);
			return c.json({ error: "Error fetching booking" }, 500);
		}
	})

	.get("/availability/:spaceName", authenticateToken, async (c) => {
		try {
			const spaceName = c.req.param("spaceName");
			const date = c.req.query("date");

			if (!date) {
				return c.json(
					{ success: false, error: "Date query parameter is required" },
					400,
				);
			}

			const targetDate = new Date(date as string).toISOString().split("T")[0];

			const existingBookings = await db
				.select()
				.from(spaceBookingsInAppe)
				.where(
					and(
						eq(spaceBookingsInAppe.space_name, spaceName),
						eq(spaceBookingsInAppe.booking_date, targetDate as string),
						not(eq(spaceBookingsInAppe.status, "rejected")),
					),
				)
				.leftJoin(usersInAppe, eq(spaceBookingsInAppe.user_id, usersInAppe.id));

			return c.json(
				{
					success: true,
					data: spaceName,
					date: targetDate,
					existingBookings,
					available: existingBookings.length === 0,
				},
				200,
			);
		} catch (error) {
			console.error("Error fetching availability:", error);
			return c.json({ error: "Error fetching availability" }, 500);
		}
	})

	.post(
		"/",
		authenticateToken,
		zValidator("json", createBookingSchema),
		async (c) => {
			try {
				const userPayload = c.get("user");
				const validatedData = c.req.valid("json");

				const existingBookings = await db
					.select()
					.from(spaceBookingsInAppe)
					.where(
						and(
							eq(spaceBookingsInAppe.space_name, validatedData.space_name),
							eq(
								spaceBookingsInAppe.booking_date,
								validatedData.booking_date as string,
							),
							not(eq(spaceBookingsInAppe.status, "rejected")),
						),
					);

				if (existingBookings) {
					return c.json(
						{ success: false, error: "Space already booked for this date" },
						409,
					);
				}

				if (validatedData.start_time >= validatedData.end_time) {
					return c.json(
						{ success: false, error: "Start time must be before end time" },
						400,
					);
				}

				const newBooking = await db.insert(spaceBookingsInAppe).values({
					id: crypto.randomUUID(),
					user_id: userPayload.userId,
					space_name: validatedData.space_name,
					booking_date: validatedData.booking_date as string,
					start_time: validatedData.start_time,
					end_time: validatedData.end_time,
				});

				return c.json(
					{
						success: true,
						message: "Booking created successfully",
						data: newBooking,
					},
					201,
				);
			} catch (error) {
				console.error("Error creating booking:", error);
				return c.json({ error: "Error creating booking" }, 500);
			}
		},
	)

	.put(
		"/:id",
		authenticateToken,
		zValidator("json", updateBookingSchema),
		async (c) => {
			try {
				const id = c.req.param("id");
				const userPayload = c.get("user");
				const validatedData = c.req.valid("json");

				const [existingBooking] = await db
					.select()
					.from(spaceBookingsInAppe)
					.where(eq(spaceBookingsInAppe.id, id))
					.leftJoin(
						usersInAppe,
						eq(spaceBookingsInAppe.user_id, usersInAppe.id),
					)
					.limit(1);

				if (!existingBooking) {
					return c.json({ success: false, error: "Booking not found" }, 404);
				}

				if (
					userPayload.role !== "admin" &&
					existingBooking.space_bookings.user_id !== userPayload.userId
				) {
					return c.json({ success: false, error: "Unauthorized access" }, 403);
				}

				if (validatedData.status && userPayload.role !== "admin") {
					return c.json({ success: false, error: "Unauthorized access" }, 403);
				}

				if (
					(validatedData.space_name || validatedData.booking_date) &&
					validatedData.status !== "rejected"
				) {
					const newSpaceName =
						validatedData.space_name ||
						existingBooking.space_bookings.space_name;
					const newBookingDate =
						validatedData.booking_date ||
						existingBooking.space_bookings.booking_date;

					const [conflictingBookings] = await db
						.select()
						.from(spaceBookingsInAppe)
						.where(
							and(
								not(eq(spaceBookingsInAppe.id, id)),
								eq(spaceBookingsInAppe.space_name, newSpaceName),
								eq(spaceBookingsInAppe.booking_date, newBookingDate.toString()),
								not(eq(spaceBookingsInAppe.status, "rejected")),
							),
						);

					if (conflictingBookings) {
						return c.json(
							{ success: false, error: "Space already booked for this date" },
							409,
						);
					}
				}

				if (
					validatedData.start_time &&
					validatedData.end_time &&
					validatedData.start_time >= validatedData.end_time
				) {
					return c.json(
						{ success: false, error: "Start time must be before end time" },
						400,
					);
				}

				const updatedBooking = await db
					.update(spaceBookingsInAppe)
					.set({
						...validatedData,
						booking_date: validatedData.booking_date
							? validatedData.booking_date
							: undefined,
						status: validatedData.status ? validatedData.status : undefined,
					})
					.where(eq(spaceBookingsInAppe.id, id));

				return c.json(
					{
						success: true,
						message: "Booking updated successfully",
						data: updatedBooking,
					},
					200,
				);
			} catch (error) {
				console.error("Error updating booking:", error);
				return c.json({ error: "Error updating booking" }, 500);
			}
		},
	)

	.delete("/:id", authenticateToken, async (c) => {
		try {
			const id = c.req.param("id");
			const userPayload = c.get("user");

			const [existingBooking] = await db
				.select()
				.from(spaceBookingsInAppe)
				.where(eq(spaceBookingsInAppe.id, id))
				.leftJoin(usersInAppe, eq(spaceBookingsInAppe.user_id, usersInAppe.id))
				.limit(1);

			if (!existingBooking) {
				return c.json({ success: false, error: "Booking not found" }, 404);
			}

			if (
				userPayload.role !== "admin" &&
				existingBooking.space_bookings.user_id !== userPayload.userId
			) {
				return c.json({ success: false, error: "Unauthorized access" }, 403);
			}

			await db
				.delete(spaceBookingsInAppe)
				.where(eq(spaceBookingsInAppe.id, id));

			return c.json(
				{ success: true, message: "Booking deleted successfully" },
				200,
			);
		} catch (error) {
			console.error("Error deleting booking:", error);
			return c.json({ error: "Error deleting booking" }, 500);
		}
	})

	.patch(
		"/:id/confirm",
		authenticateToken,
		requireRole(["admin"]),
		async (c) => {
			try {
				const id = c.req.param("id");

				const [existingBooking] = await db
					.select()
					.from(spaceBookingsInAppe)
					.where(eq(spaceBookingsInAppe.id, id))
					.limit(1);

				if (!existingBooking) {
					return c.json({ success: false, error: "Booking not found" }, 404);
				}

				const updatedBooking = await db
					.update(spaceBookingsInAppe)
					.set({ status: "approved" })
					.where(eq(spaceBookingsInAppe.id, id));

				return c.json(
					{
						success: true,
						message: "Booking approved successfully",
						data: updatedBooking,
					},
					200,
				);
			} catch (error) {
				console.error("Error approving booking:", error);
				return c.json({ error: "Error approving booking" }, 500);
			}
		},
	)

	.patch(":id/cancel", authenticateToken, async (c) => {
		try {
			const id = c.req.param("id");
			const userPayload = c.get("user");

			const [existingBooking] = await db
				.select()
				.from(spaceBookingsInAppe)
				.where(eq(spaceBookingsInAppe.id, id))
				.leftJoin(usersInAppe, eq(spaceBookingsInAppe.user_id, usersInAppe.id))
				.limit(1);

			if (!existingBooking) {
				return c.json({ success: false, error: "Booking not found" }, 404);
			}

			if (
				userPayload.role !== "admin" &&
				existingBooking.space_bookings.user_id !== userPayload.userId
			) {
				return c.json({ success: false, error: "Unauthorized access" }, 403);
			}

			const updatedBooking = await db
				.update(spaceBookingsInAppe)
				.set({ status: "rejected" })
				.where(eq(spaceBookingsInAppe.id, id));

			return c.json(
				{
					success: true,
					message: "Booking rejected successfully",
					data: updatedBooking,
				},
				200,
			);
		} catch (error) {
			console.error("Error rejecting booking:", error);
			return c.json({ error: "Error rejecting booking" }, 500);
		}
	});
