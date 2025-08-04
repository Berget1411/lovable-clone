import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export type MessageType = "result" | "error";
export type MessageRole = "user" | "assistant";

export const message = sqliteTable("message", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	content: text("content").notNull(),
	role: text("role", { enum: ["user", "assistant"] }).notNull(),
	type: text("type", { enum: ["result", "error"] }).notNull(),
	createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
	fragmentId: integer("fragment_id"),
	projectId: integer("project_id").references(() => Project.id),
});

export const fragment = sqliteTable("fragment", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	messageId: integer("message_id")
		.notNull()
		.references(() => message.id),

	sandboxUrl: text("sandbox_url"),
	title: text("title"),
	files: text("files", { mode: "json" }),

	createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const Project = sqliteTable("project", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});
