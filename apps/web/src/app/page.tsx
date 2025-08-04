"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

export default function Home() {
	const router = useRouter();
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());
	const queryClient = useQueryClient();
	const [text, setText] = useState("");
	// Remove this - messages need a projectId which we don't have on the home page
	const createProject = useMutation(
		trpc.project.create.mutationOptions({
			onSuccess: (data: { project: { id: number } }) => {
				router.push(`/projects/${data.project.id}`);
				toast.success("Project created");
				queryClient.invalidateQueries(
					trpc.message.getAll.queryOptions({ projectId: data.project.id }),
				);
			},
			onError: (error: { message: string }) => {
				toast.error(error.message);
			},
		}),
	);
	// Removed unused variables and functions
	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<pre className="overflow-x-auto font-mono text-sm">Lovable Clone</pre>
			<div className="grid gap-6">
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">API Status</h2>
					<div className="flex items-center gap-2">
						<div
							className={`h-2 w-2 rounded-full ${
								healthCheck.data ? "bg-green-500" : "bg-red-500"
							}`}
						/>
						<span className="text-muted-foreground text-sm">
							{healthCheck.isLoading
								? "Checking..."
								: healthCheck.data
									? "Connected"
									: "Disconnected"}
						</span>
					</div>
					<input
						type="text"
						value={text}
						onChange={(e) => setText(e.target.value)}
					/>
					<button
						type="button"
						className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white"
						onClick={() => {
							createProject.mutate({ content: text });
						}}
					>
						Invoke Inngest
					</button>
					<pre className="overflow-x-auto font-mono text-sm">{text}</pre>
				</section>
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">Create Project</h2>
					<p className="text-muted-foreground text-sm">
						Enter a message to create a new project and get started.
					</p>
				</section>
			</div>
		</div>
	);
}
