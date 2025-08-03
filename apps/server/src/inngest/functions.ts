import { Sandbox } from "@e2b/code-interpreter";
import {
	createAgent,
	createNetwork,
	createTool,
	openai,
	type Tool,
} from "@inngest/agent-kit";
import { z } from "zod";
import { db } from "../db";
import { fragment, message } from "../db/schema/agent";
import { inngest } from "./client";
import { PROMPT } from "./prompt";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";

interface AgentState {
	summary: string;
	files: {
		[path: string]: string;
	};
}

export const codeAgentFunction = inngest.createFunction(
	{ id: "code-agent" },
	{ event: "code-agent/run" },
	async ({ event, step }) => {
		const sandboxId = await step.run("get-sandbox-id", async () => {
			const sandbox = await Sandbox.create("test-nextjs3");
			return sandbox.sandboxId;
		});

		// Create a new agent with a system prompt (you can add optional tools, too)
		const codeAgent = createAgent<AgentState>({
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
									const updatedFiles = network.state.data.files || {};
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

		const network = createNetwork<AgentState>({
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

		const isError =
			!result.state.data.summary ||
			Object.keys(result.state.data.files || {}).length === 0;

		const sandboxUrl = await step.run("get-sandbox-url", async () => {
			const sandbox = await getSandbox(sandboxId);
			const host = sandbox.getHost(3000);
			return `http://${host}`;
		});

		await step.run("save-result", async () => {
			if (isError) {
				return await db.insert(message).values({
					content: "Something went wrong. Please try again.",
					role: "assistant",
					type: "error" as const,
				});
			}
			const createMessage = await db
				.insert(message)
				.values({
					content: result.state.data.summary,
					role: "assistant",
					type: "result" as const,
				})
				.returning();
			await db.insert(fragment).values({
				messageId: createMessage[0].id,
				title: "Fragment",
				sandboxUrl,
				files: result.state.data.files,
			});
			return createMessage;
		});

		return {
			url: sandboxUrl,
			title: "Fragment",
			files: result.state.data.files,
			summary: result.state.data.summary,
		};
	},
);
