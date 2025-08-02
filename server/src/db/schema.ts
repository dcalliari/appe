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
		password_hash: varchar({ length: 255 }).notNull(),
		role: userRoleInAppe().default("resident"),
		phone: varchar({ length: 20 }),
		created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
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
		created_by: uuid(),
		created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
		expires_at: timestamp({ mode: "string" }),
	},
	(table) => [
		foreignKey({
			columns: [table.created_by],
			foreignColumns: [usersInAppe.id],
			name: "notices_created_by_fkey",
		}),
	],
);

export const chatMessagesInAppe = appe.table(
	"chat_messages",
	{
		id: uuid().primaryKey().notNull(),
		from_user_id: uuid(),
		to_user_id: uuid(),
		message: text().notNull(),
		is_read: boolean().default(false),
		created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		foreignKey({
			columns: [table.from_user_id],
			foreignColumns: [usersInAppe.id],
			name: "chat_messages_from_user_id_fkey",
		}),
		foreignKey({
			columns: [table.to_user_id],
			foreignColumns: [usersInAppe.id],
			name: "chat_messages_to_user_id_fkey",
		}),
	],
);

export const visitorRequestsInAppe = appe.table(
	"visitor_requests",
	{
		id: uuid().primaryKey().notNull(),
		requester_id: uuid(),
		visitor_name: varchar({ length: 255 }).notNull(),
		visitor_document: varchar({ length: 50 }),
		visit_date: date().notNull(),
		visit_time: time(),
		status: visitorStatusInAppe().default("pending"),
		created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		foreignKey({
			columns: [table.requester_id],
			foreignColumns: [usersInAppe.id],
			name: "visitor_requests_requester_id_fkey",
		}),
	],
);

export const spaceBookingsInAppe = appe.table(
	"space_bookings",
	{
		id: uuid().primaryKey().notNull(),
		user_id: uuid(),
		space_name: varchar({ length: 255 }).notNull(),
		booking_date: date().notNull(),
		start_time: time().notNull(),
		end_time: time().notNull(),
		status: bookingStatusInAppe().default("pending"),
		created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		foreignKey({
			columns: [table.user_id],
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
		file_path: varchar({ length: 500 }).notNull(),
		category: documentCategoryInAppe(),
		uploaded_by: uuid(),
		uploaded_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		foreignKey({
			columns: [table.uploaded_by],
			foreignColumns: [usersInAppe.id],
			name: "documents_uploaded_by_fkey",
		}),
	],
);

export const logsInAppe = appe.table(
	"logs",
	{
		id: uuid().primaryKey().notNull(),
		type: text().notNull(),
		userId: uuid("user_id"),
		ip: varchar("ip", { length: 45 }),
		content: text(),
		createdAt: timestamp("created_at", { mode: "string" }).default(
			sql`CURRENT_TIMESTAMP`,
		),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAppe.id],
			name: "logs_user_id_fkey",
		}),
	],
);
