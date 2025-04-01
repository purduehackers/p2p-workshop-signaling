CREATE TABLE `answers` (
	`room_id` text PRIMARY KEY NOT NULL,
	`answer` text
);
--> statement-breakpoint
CREATE TABLE `candidates` (
	`id` integer PRIMARY KEY NOT NULL,
	`room_id` text,
	`candidate` text,
	`is_offerer` integer
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`room_id` text PRIMARY KEY NOT NULL,
	`offer` text
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer
);
