import { EventSchemas } from "inngest";

type CodeAgentRun = {
	name: "code-agent/run";
	data: {
		message: string;
	};
};

export const schemas = new EventSchemas().fromUnion<CodeAgentRun>();
