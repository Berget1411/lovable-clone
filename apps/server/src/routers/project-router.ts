import { desc, eq } from "drizzle-orm";
import { generateSlug } from "random-word-slugs";
import z from "zod";
import { db } from "../db";
import { fragment, message, Project } from "../db/schema/agent";
import { inngest } from "../inngest";
import { publicProcedure, router } from "../lib/trpc";

export const projectRouter = router({
	getAll: publicProcedure.query(async () => {
		return await db
			.select({
				id: Project.id,
				name: Project.name,
				createdAt: Project.createdAt,
				updatedAt: Project.updatedAt,
				messages: message.id,
			})
			.from(Project)
			.leftJoin(message, eq(message.projectId, Project.id))
			.orderBy(desc(Project.createdAt));
	}),
	create: publicProcedure
		.input(
			z.object({
				content: z
					.string()
					.min(1, "Prompt is required")
					.max(10000, "Prompt is too long"),
			}),
		)
		.mutation(async ({ input }) => {
			const createdProject = await db
				.insert(Project)
				.values({
					name: generateSlug(2, { format: "kebab" }),
				})
				.returning();

			const createMessage = await db
				.insert(message)
				.values({
					content: input.content,
					role: "user",
					type: "result",
					projectId: createdProject[0].id,
				})
				.returning();

			inngest.send({
				name: "code-agent/run",
				data: { message: input.content, projectId: createdProject[0].id },
			});

			// Return the created message with potential fragment
			const messageWithFragment = await db
				.select({
					id: message.id,
					content: message.content,
					role: message.role,
					type: message.type,
					createdAt: message.createdAt,
					updatedAt: message.updatedAt,
					fragmentId: message.fragmentId,
					fragment: {
						id: fragment.id,
						messageId: fragment.messageId,
						sandboxUrl: fragment.sandboxUrl,
						title: fragment.title,
						files: fragment.files,
						createdAt: fragment.createdAt,
						updatedAt: fragment.updatedAt,
					},
				})
				.from(message)
				.leftJoin(fragment, eq(fragment.messageId, message.id))
				.where(eq(message.id, createMessage[0].id));

			return messageWithFragment[0];
		}),
});
