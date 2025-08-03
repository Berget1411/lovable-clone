import { z } from "zod";
import { inngest } from "../inngest";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { todoRouter } from "./todo";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	todo: todoRouter,
	invokeInngest: publicProcedure
		.input(z.object({ text: z.string() }))
		.mutation(({ input }) => {
			return inngest.send({
				name: "demo/event.sent",
				data: { message: input.text },
			});
		}),
});
export type AppRouter = typeof appRouter;
