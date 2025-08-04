"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { Fragment } from "@/types/schema";
import { trpc } from "@/utils/trpc";
import { MessageLoader } from "../ui/message-loader";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";

// Types are inferred from tRPC

interface MessagesContainerProps {
	projectId: number;
	activeFragment: Fragment | null;
	setActiveFragment: (fragment: Fragment | null) => void;
}

export function MessagesContainer({
	projectId,
	activeFragment,
	setActiveFragment,
}: MessagesContainerProps) {
	const { data: messages } = useSuspenseQuery(
		trpc.message.getAll.queryOptions(
			{ projectId },
			{
				//temporary live updates
				refetchInterval: 5000,
			},
		),
	);
	const bottomRef = useRef<HTMLDivElement>(null);
	// TODO: fix this auto selecting the last fragment
	// useEffect(() => {
	//   const lastAssistantMessageWithFragment = messages.findLast(
	//     (message) => message.role === "assistant" && !!message.fragment,
	//   );
	//   if (lastAssistantMessageWithFragment) {
	//     // set active fragment.
	//     setActiveFragment(lastAssistantMessageWithFragment.fragment);
	//   }
	// }, [messages, setActiveFragment]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	const isLastMessageUser =
		messages.length > 0 && messages[messages.length - 1].role === "user";

	return (
		<div className="flex h-full flex-col">
			{/* Scrollable messages area */}
			<div className="flex-1 overflow-y-auto">
				<div className="space-y-2 p-4 pb-2">
					{messages.map((message) => (
						<MessageCard
							key={message.id}
							content={message.content}
							role={message.role}
							fragment={message.fragment || undefined}
							createdAt={message.createdAt || new Date().toISOString()}
							isActiveFragment={activeFragment?.id === message.fragment?.id}
							onFragmentClick={() => {
								setActiveFragment(message.fragment);
							}}
							type={message.type}
						/>
					))}
					{isLastMessageUser && <MessageLoader />}
					<div ref={bottomRef} />
				</div>
			</div>

			{/* Fixed message form at bottom */}
			<div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur">
				<div className="relative p-4">
					<div className="to-background/95 pointer-events-none absolute -top-6 right-0 left-0 h-6 bg-gradient-to-b from-transparent" />
					<MessageForm projectId={projectId} />
				</div>
			</div>
		</div>
	);
}
