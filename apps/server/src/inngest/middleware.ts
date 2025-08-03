import { InngestMiddleware } from "inngest";

export const bindingsMiddleware = new InngestMiddleware({
	name: "Cloudflare Workers bindings",
	init({ client, fn }) {
		return {
			onFunctionRun({ ctx, fn, steps, reqArgs }) {
				return {
					transformInput({ ctx, fn, steps }) {
						// reqArgs is the array of arguments passed to the Worker's fetch event handler
						// ex. fetch(request, env, ctx)
						// We cast the argument to the global Env var that Wrangler generates:
						const env = reqArgs[1] as Cloudflare.Env;
						return {
							ctx: {
								// Return the env object to the function handler's input args
								env,
							},
						};
					},
				};
			},
		};
	},
});
