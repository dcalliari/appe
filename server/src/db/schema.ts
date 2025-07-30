import { sql } from "drizzle-orm";
import {
	boolean,
	date,
	foreignKey,
	pgSchema,
	text,
	time,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const appe = pgSchema("appe");
export const bookingStatusInAppe = appe.enum("booking_status", [
	"pending",
	"approved",
	"rejected",
]);
export const documentCategoryInAppe = appe.enum("document_category", [
	"meeting_minutes",
	"bills",
	"regulations",
	"announcements",
]);
export const noticePriorityInAppe = appe.enum("notice_priority", [
	"low",
	"medium",
	"high",
]);
export const noticeTypeInAppe = appe.enum("notice_type", [
	"maintenance",
	"general",
	"meeting",
]);
export const userRoleInAppe = appe.enum("user_role", [
	"resident",
	"admin",
	"doorman",
]);
export const visitorStatusInAppe = appe.enum("visitor_status", [
	"pending",
	"approved",
	"rejected",
]);

export const usersInAppe = appe.table(
	"users",
	{
		id: uuid().primaryKey().notNull(),
		apartment: varchar({ length: 10 }).notNull(),
		name: varchar({ length: 255 }).notNull(),
		email: varchar({ length: 255 }),
		passwordHash: varchar("password_hash", { length: 255 }).notNull(),
		role: userRoleInAppe().default("resident"),
		phone: varchar({ length: 20 }),
		createdAt: timestamp("created_at", { mode: "string" }).default(
			sql`CURRENT_TIMESTAMP`,
		),
	},
	(table) => [
		unique("users_apartment_key").on(table.apartment),
		unique("users_email_key").on(table.email),
	],
);

export const noticesInAppe = appe.table(
	"notices",
	{
		id: uuid().primaryKey().notNull(),
		title: varchar({ length: 255 }).notNull(),
		content: text().notNull(),
		type: noticeTypeInAppe().notNull(),
		priority: noticePriorityInAppe().default("medium"),
		createdBy: uuid("created_by"),
		createdAt: timestamp("created_at", { mode: "string" }).default(
			sql`CURRENT_TIMESTAMP`,
		),
		expiresAt: timestamp("expires_at", { mode: "string" }),
	},
	(table) => [
		foreignKey({
			columns: [table.createdBy],
			foreignColumns: [usersInAppe.id],
			name: "notices_created_by_fkey",
		}),
	],
);

export const chatMessagesInAppe = appe.table(
	"chat_messages",
	{
		id: uuid().primaryKey().notNull(),
		fromUserId: uuid("from_user_id"),
		toUserId: uuid("to_user_id"),
		message: text().notNull(),
		isRead: boolean("is_read").default(false),
		createdAt: timestamp("created_at", { mode: "string" }).default(
			sql`CURRENT_TIMESTAMP`,
		),
	},
	(table) => [
		foreignKey({
			columns: [table.fromUserId],
			foreignColumns: [usersInAppe.id],
			name: "chat_messages_from_user_id_fkey",
		}),
		foreignKey({
			columns: [table.toUserId],
			foreignColumns: [usersInAppe.id],
			name: "chat_messages_to_user_id_fkey",
		}),
	],
);

export const visitorRequestsInAppe = appe.table(
	"visitor_requests",
	{
		id: uuid().primaryKey().notNull(),
		requesterId: uuid("requester_id"),
		visitorName: varchar("visitor_name", { length: 255 }).notNull(),
		visitorDocument: varchar("visitor_document", { length: 50 }),
		visitDate: date("visit_date").notNull(),
		visitTime: time("visit_time"),
		status: visitorStatusInAppe().default("pending"),
		createdAt: timestamp("created_at", { mode: "string" }).default(
			sql`CURRENT_TIMESTAMP`,
		),
	},
	(table) => [
		foreignKey({
			columns: [table.requesterId],
			foreignColumns: [usersInAppe.id],
			name: "visitor_requests_requester_id_fkey",
		}),
	],
);

export const spaceBookingsInAppe = appe.table(
	"space_bookings",
	{
		id: uuid().primaryKey().notNull(),
		userId: uuid("user_id"),
		spaceName: varchar("space_name", { length: 255 }).notNull(),
		bookingDate: date("booking_date").notNull(),
		startTime: time("start_time").notNull(),
		endTime: time("end_time").notNull(),
		status: bookingStatusInAppe().default("pending"),
		createdAt: timestamp("created_at", { mode: "string" }).default(
			sql`CURRENT_TIMESTAMP`,
		),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAppe.id],
			name: "space_bookings_user_id_fkey",
		}),
	],
);

export const documentsInAppe = appe.table(
	"documents",
	{
		id: uuid().primaryKey().notNull(),
		title: varchar({ length: 255 }).notNull(),
		filePath: varchar("file_path", { length: 500 }).notNull(),
		category: documentCategoryInAppe(),
		uploadedBy: uuid("uploaded_by"),
		uploadedAt: timestamp("uploaded_at", { mode: "string" }).default(
			sql`CURRENT_TIMESTAMP`,
		),
	},
	(table) => [
		foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [usersInAppe.id],
			name: "documents_uploaded_by_fkey",
		}),
	],
);
