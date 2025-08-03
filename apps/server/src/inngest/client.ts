import { Inngest } from "inngest";
import { bindingsMiddleware } from "./middleware";
import { schemas } from "./types";

export const inngest = new Inngest({
	id: "shopflow",
	schemas,
	middleware: [bindingsMiddleware],
	// Configure for development - remove signing key requirement in dev
	isDev: process.env.NODE_ENV !== "production",
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	E2B_API_KEY: process.env.E2B_API_KEY,
});
