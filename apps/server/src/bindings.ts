export type Bindings = {
	// Database binding
	DB: D1Database;

	// Environment variables
	OPENAI_API_KEY?: string;
	NODE_ENV?: string;
	INNGEST_ENV?: string;
	INNGEST_SIGNING_KEY?: string;
	INNGEST_EVENT_KEY?: string;

	// Add other Cloudflare resources or environment variables here
} & CloudflareBindings;
