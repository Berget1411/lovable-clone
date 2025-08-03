import { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "inngest/hono";
import type { Bindings } from "./bindings";
import { functions, inngest } from "./inngest";
import { auth } from "./lib/auth";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";

const app = new Hono<{ Bindings: Bindings }>();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN || "",
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

app.on(["GET", "PUT", "POST"], "/api/inngest", (c) => {
	const handler = serve({
		client: inngest,
		functions,
	});
	return handler(c);
});

export default app;
