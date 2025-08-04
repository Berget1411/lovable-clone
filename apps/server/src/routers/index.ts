import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { messageRouter } from "./message.router";
import { projectRouter } from "./project-router";
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
	message: messageRouter,
	project: projectRouter,
});
export type AppRouter = typeof appRouter;
