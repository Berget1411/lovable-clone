import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema",
	out: "./src/db/migrations",
	dialect: "sqlite",
	dbCredentials: {
		url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/f26dd3b4af2b86035a68fbb491403d4b54d63dee4c1e42d18d4ad58dc6978866.sqlite",
	},
});
