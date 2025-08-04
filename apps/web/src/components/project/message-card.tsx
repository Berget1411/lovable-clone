import { format } from "date-fns";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Fragment, MessageRole, MessageType } from "@/types/schema";
import { Card } from "../ui/card";

interface MessageCardProps {
	content: string;
	role: MessageRole;
	createdAt: Date | string;
	fragment: Fragment | null | undefined;
	isActiveFragment: boolean;
	onFragmentClick: () => void;
	type: MessageType;
}

interface UserMessageProps {
	content: string;
}

interface AssistantMessageProps {
	content: string;
	fragment: Fragment | null | undefined;
	createdAt: Date | string;
	isActiveFragment: boolean;
	onFragmentClick: () => void;
	type: MessageType;
}

interface FragmentCardProps {
	fragment: Fragment;
	isActiveFragment: boolean;
	onFragmentClick: () => void;
}

const FragmentCard = ({
	fragment,
	isActiveFragment,
	onFragmentClick,
}: FragmentCardProps) => {
	return (
		<button
			type="button"
			className={cn(
				"bg-muted hover:bg-secondary inline-flex max-w-md items-start gap-2 rounded-lg border p-3 transition-colors",
				isActiveFragment &&
					"bg-primary text-primary-foreground border-primary hover:bg-primary",
			)}
			onClick={onFragmentClick}
		>
			<Code2Icon className="mt-0.5 size-4 shrink-0" />
			<div className="flex flex-1 flex-col">
				<span className="line-clamp-1 text-sm font-medium">
					{fragment.title || "Fragment"}
				</span>
				<span className="text-sm">Preview</span>
			</div>
			<div className="flex items-center justify-center">
				<ChevronRightIcon className="size-4 shrink-0" />
			</div>
		</button>
	);
};

const UserMessage = ({ content }: UserMessageProps) => {
	return (
		<div className="flex justify-end">
			<Card className="bg-muted max-w-[80%] rounded-lg border-none p-3 break-words shadow-none">
				{content}
			</Card>
		</div>
	);
};

const AssistantMessage = ({
	content,
	fragment,
	createdAt,
	isActiveFragment,
	onFragmentClick,
	type,
}: AssistantMessageProps) => {
	return (
		<div
			className={cn(
				"group flex flex-col",
				type === "error" && "text-red-700 dark:text-red-500",
			)}
		>
			<div className="mb-2 flex items-center gap-2">
				{/* TODO: Add Logo */}
				<Image
					src="/favicon.ico"
					alt="Logo"
					width={18}
					height={18}
					className="shrink-0"
				/>
				<span className="text-sm font-medium">Lovable</span>
				<span className="text-muted-foreground text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
					{format(new Date(createdAt), "HH:mm 'on' MMM dd, yyyy")}
				</span>
			</div>
			<div className="flex max-w-xl flex-col gap-y-4 pl-7">
				<span>{content}</span>
				{fragment && type === "result" && (
					<div className="flex">
						<FragmentCard
							fragment={fragment}
							isActiveFragment={isActiveFragment}
							onFragmentClick={onFragmentClick}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export function MessageCard({
	content,
	role,
	createdAt,
	fragment,
	isActiveFragment,
	onFragmentClick,
	type,
}: MessageCardProps) {
	if (role === "assistant") {
		return (
			<AssistantMessage
				content={content}
				fragment={fragment}
				createdAt={createdAt}
				isActiveFragment={isActiveFragment}
				onFragmentClick={onFragmentClick}
				type={type}
			/>
		);
	}
	return <UserMessage content={content} />;
}
