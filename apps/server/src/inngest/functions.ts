import { Sandbox } from "@e2b/code-interpreter";
import {
	createAgent,
	createNetwork,
	createTool,
	openai,
} from "@inngest/agent-kit";
import { z } from "zod";
import { inngest } from "./client";
import { PROMPT } from "./prompt";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";

export const helloWorld = inngest.createFunction(
	{ id: "hello-world" },
	{ event: "demo/event.sent" },
	async ({ event, step }) => {
		const sandboxId = await step.run("get-sandbox-id", async () => {
			const sandbox = await Sandbox.create("test-nextjs3");
			return sandbox.sandboxId;
		});

		// Create a new agent with a system prompt (you can add optional tools, too)
		const codeAgent = createAgent({
			name: "code-agent",
			description: "An expert coding agent",
			system: PROMPT,
			model: openai({
				model: "gpt-4.1",
				defaultParameters: {
					temperature: 0.1,
				},
				apiKey: process.env.OPENAI_API_KEY,
			}),
			tools: [
				// terminal use
				createTool({
					name: "terminal",
					description: "Use the terminal to run commands",
					parameters: z.object({
						command: z.string(),
					}),
					handler: async ({ command }, { network }) => {
						console.log("terminal < ", command);
						const buffers = { stdout: "", stderr: "" };

						try {
							const sandbox = await getSandbox(
								network.state.kv.get("sandboxId") as string,
							);
							const result = await sandbox.commands.run(command, {
								onStdout: (data: string) => {
									// console.log("terminal stdout >", data);
									buffers.stdout += data;
								},
								onStderr: (data: string) => {
									// console.log("terminal stderr >", data);
									buffers.stderr += data;
								},
							});
							console.log("terminal result >", result.stdout);
							return result.stdout;
						} catch (e) {
							console.error(
								`Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`,
							);
							return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
						}
					},
				}),
				createTool({
					name: "createOrUpdateFiles",
					description: "Create or update a file in the sandbox",
					parameters: z.object({
						files: z.array(
							z.object({
								path: z.string(),
								content: z.string(),
							}),
						),
					}),
					handler: async ({ files }, { step, network }) => {
						const newFiles = await step?.run(
							"createOrUpdateFiles",
							async () => {
								try {
									const updatedFiles = network.state.data.fiels || {};
									const sandbox = await getSandbox(sandboxId);
									for (const file of files) {
										await sandbox.files.write(file.path, file.content);
										updatedFiles[file.path] = file.content;
									}
									return updatedFiles;
								} catch (e) {
									console.error(`Error creating or updating files: ${e}`);
									return "Error: " + e;
								}
							},
						);
						if (typeof newFiles === "object") {
							network.state.data.files = newFiles;
						}
					},
				}),
				createTool({
					name: "readFiles",
					description: "Read the files in the sandbox",
					parameters: z.object({
						files: z.array(z.string()),
					}),
					handler: async ({ files }, { step, network }) => {
						return await step?.run("readFiles", async () => {
							try {
								const sandbox = await getSandbox(sandboxId);
								const contents = [];
								for (const file of files) {
									const content = await sandbox.files.read(file);
									contents.push({ path: file, content });
								}
								return JSON.stringify(contents);
							} catch (e) {
								console.error(`Error reading files: ${e}`);
								return "Error: " + e;
							}
						});
					},
				}),
			],
			lifecycle: {
				onResponse: async ({ result, network }) => {
					const lastAssistantMessageText =
						lastAssistantTextMessageContent(result);

					if (lastAssistantMessageText && network) {
						if (lastAssistantMessageText.includes("<task_summary>")) {
							network.state.data.summary = lastAssistantMessageText;
						}
					}
					return result;
				},
			},
		});

		const network = createNetwork({
			name: "coding-agent-network",
			agents: [codeAgent],
			maxIter: 15,
			router: async ({ network }) => {
				const summary = network.state.data.summary;
				if (summary) {
					return;
				}
				return codeAgent;
			},
		});

		const result = await network.run(event.data.message);

		const sandboxUrl = await step.run("get-sandbox-url", async () => {
			const sandbox = await getSandbox(sandboxId);
			const host = sandbox.getHost(3000);
			return `http://${host}`;
		});

		return {
			url: sandboxUrl,
			title: "Fragment",
			files: result.state.data.files,
			summary: result.state.data.summary,
		};
	},
);
