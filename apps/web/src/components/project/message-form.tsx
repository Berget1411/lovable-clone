"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/schema";
import { trpc } from "@/utils/trpc";
import Loader from "../loader";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "../ui/form";

const formSchema = z.object({
	content: z
		.string()
		.min(1, "Message is required")
		.max(10000, "Message is too long"),
});

interface MessageFormProps {
	projectId: number;
}

export function MessageForm({ projectId }: MessageFormProps) {
	const [isFocused, setIsFocused] = useState(false);
	const showUsage = false;
	const queryClient = useQueryClient();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: "",
		},
	});

	const { mutate: createMessage, isPending } = useMutation(
		trpc.message.create.mutationOptions({
			onSuccess: () => {
				form.reset();
				queryClient.invalidateQueries(
					trpc.message.getAll.queryOptions({ projectId }),
				);
				// TODO: invalidate usage status
			},
			onError: (error) => {
				// Redirect to prciing page if specific error code

				toast.error(error.message);
			},
		}),
	);

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		createMessage({
			projectId,
			content: data.content,
		});
	};

	const isButtonDisabled = isPending || !form.formState.isValid;

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn(
					"bg-background relative rounded-xl border p-4 pt-1 shadow-sm transition-all",
					isFocused && "ring-ring shadow-md ring-2 ring-offset-2",
					showUsage && "rounded-t-none",
				)}
			>
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<TextareaAutosize
									{...field}
									onFocus={() => setIsFocused(true)}
									onBlur={() => setIsFocused(false)}
									minRows={2}
									maxRows={8}
									disabled={isPending}
									className="min-h-0 w-full resize-none border-none bg-transparent pt-5 outline-none"
									placeholder="Send a message..."
									onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
										if (e.key === "Enter" && (!e.ctrlKey || !e.metaKey)) {
											e.preventDefault();
											form.handleSubmit(onSubmit)(e);
										}
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex items-end justify-between gap-x-2 pt-2">
					<div className="text-muted-foreground font-mono text-[10px]">
						<kbd className="bg-muted text-muted-foreground pointer-events-none ml-auto inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none">
							<span>&#8984;</span>Enter
						</kbd>
						&nbsp;to submit
					</div>
					<Button
						type="submit"
						disabled={isButtonDisabled}
						className={cn(
							"size-8 rounded-full",
							form.formState.isValid && "bg-primary text-primary-foreground",
							isButtonDisabled && "bg-muted-foreground border",
						)}
					>
						{isPending ? <Loader /> : <ArrowUpIcon className="size-4" />}
					</Button>
				</div>
			</form>
		</Form>
	);
}
