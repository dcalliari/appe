CREATE SCHEMA "appe";
--> statement-breakpoint
CREATE TYPE "appe"."booking_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "appe"."document_category" AS ENUM('meeting_minutes', 'bills', 'regulations', 'announcements');--> statement-breakpoint
CREATE TYPE "appe"."notice_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "appe"."notice_type" AS ENUM('maintenance', 'general', 'meeting');--> statement-breakpoint
CREATE TYPE "appe"."user_role" AS ENUM('resident', 'admin', 'doorman');--> statement-breakpoint
CREATE TYPE "appe"."visitor_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "appe"."chat_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"from_user_id" uuid,
	"to_user_id" uuid,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "appe"."documents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"category" "appe"."document_category",
	"uploaded_by" uuid,
	"uploaded_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "appe"."notices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"type" "appe"."notice_type" NOT NULL,
	"priority" "appe"."notice_priority" DEFAULT 'medium',
	"created_by" uuid,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "appe"."space_bookings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"space_name" varchar(255) NOT NULL,
	"booking_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"status" "appe"."booking_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "appe"."users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"apartment" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"password_hash" varchar(255) NOT NULL,
	"role" "appe"."user_role" DEFAULT 'resident',
	"phone" varchar(20),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_apartment_key" UNIQUE("apartment"),
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "appe"."visitor_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"requester_id" uuid,
	"visitor_name" varchar(255) NOT NULL,
	"visitor_document" varchar(50),
	"visit_date" date NOT NULL,
	"visit_time" time,
	"status" "appe"."visitor_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "appe"."chat_messages" ADD CONSTRAINT "chat_messages_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "appe"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appe"."chat_messages" ADD CONSTRAINT "chat_messages_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "appe"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appe"."documents" ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "appe"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appe"."notices" ADD CONSTRAINT "notices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "appe"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appe"."space_bookings" ADD CONSTRAINT "space_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "appe"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appe"."visitor_requests" ADD CONSTRAINT "visitor_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "appe"."users"("id") ON DELETE no action ON UPDATE no action;