import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "../db";
import { fragment, message } from "../db/schema/agent";
import { inngest } from "../inngest";
import { publicProcedure, router } from "../lib/trpc";

export const messageRouter = router({
	getAll: publicProcedure
		.input(
			z.object({
				projectId: z.number().min(1, "Project is required"),
			}),
		)
		.query(async ({ input }) => {
			return await db
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
				.where(eq(message.projectId, input.projectId))
				.orderBy(message.createdAt);
		}),
	create: publicProcedure
		.input(
			z.object({
				content: z
					.string()
					.min(1, "Prompt is required")
					.max(10000, "Prompt is too long"),
				projectId: z.number().min(1, "Project is required"),
			}),
		)
		.mutation(async ({ input }) => {
			const createMessage = await db
				.insert(message)
				.values({
					content: input.content,
					role: "user",
					type: "result",
					projectId: input.projectId,
				})
				.returning();

			inngest.send({
				name: "code-agent/run",
				data: {
					message: input.content,
					projectId: input.projectId,
				},
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
