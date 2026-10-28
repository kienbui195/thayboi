CREATE TABLE `birth_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`birth_date` text NOT NULL,
	`birth_time` text,
	`gender` text NOT NULL,
	`place_name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`timezone` text NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_primary_per_user` ON `birth_profiles` (`user_id`) WHERE "birth_profiles"."is_primary" = 1;--> statement-breakpoint
CREATE INDEX `birth_profiles_user` ON `birth_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `charts` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`kind` text NOT NULL,
	`status` text NOT NULL,
	`data` text,
	`house_system` text,
	`calc_version` integer NOT NULL,
	`computed_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `birth_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `charts_profile_kind` ON `charts` (`profile_id`,`kind`);--> statement-breakpoint
CREATE TABLE `login_failures` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `login_failures_email_at` ON `login_failures` (`email`,`at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);