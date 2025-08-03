"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

export default function Home() {
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());
	const [text, setText] = useState("");
	const messages = useQuery(trpc.message.getAll.queryOptions());
	const queryClient = useQueryClient();
	const invokeInngest = useMutation(
		trpc.message.create.mutationOptions({
			onSuccess: (data) => {
				console.log(data);
				toast.success("Inngest function successfully invoked");
				queryClient.invalidateQueries(trpc.message.getAll.queryOptions());
			},
			onError: (e) => {
				toast.error(e.message);
			},
		}),
	);
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
							invokeInngest.mutate({ content: text });
						}}
					>
						Invoke Inngest
					</button>
					<pre className="overflow-x-auto font-mono text-sm">{text}</pre>
				</section>
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">Messages</h2>
					<div className="flex flex-col gap-2">
						{messages.data?.map((message) => (
							<div key={message.id}>{message.content}</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
