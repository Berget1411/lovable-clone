"use client";
import { ExternalLinkIcon, RefreshCcw } from "lucide-react";
import { useState } from "react";
import type { Fragment } from "@/types/schema";
import { Hint } from "../hint";
import { Button } from "../ui/button";

export function FragmentWeb({ data }: { data: Fragment }) {
	const [fragmentKey, setFragmentKey] = useState(data.id);
	const [copied, setCopied] = useState(false);
	const onRefresh = () => {
		setFragmentKey((prev) => prev + 1);
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(data.sandboxUrl || "");
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};
	return (
		<div className="flex h-full w-full flex-col">
			<div className="bg-sidebar flex items-center gap-x-2 border-b p-2">
				<Hint text="Refresh" side="bottom" align="start">
					<Button size="sm" variant="outline" onClick={onRefresh}>
						<RefreshCcw className="size-4" />
						Refresh
					</Button>
				</Hint>
				<Hint text="Click to copy URL" side="bottom" align="center">
					<Button
						size="sm"
						variant="outline"
						className="flex-1 justify-start text-start font-normal"
						onClick={handleCopy}
						disabled={!data.sandboxUrl || copied}
					>
						<span className="truncate">{data.sandboxUrl}</span>
					</Button>
				</Hint>
				<Hint text="Open in new tab" side="bottom" align="start">
					<Button
						size="sm"
						variant="outline"
						disabled={!data.sandboxUrl}
						onClick={() => {
							if (data.sandboxUrl) {
								window.open(data.sandboxUrl, "_blank");
							}
						}}
					>
						<ExternalLinkIcon className="size-4" />
						Open in new tab
					</Button>
				</Hint>
			</div>
			<iframe
				key={fragmentKey}
				title="Fragment Web"
				className="h-full w-full"
				sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
				loading="lazy"
				src={data.sandboxUrl || ""}
			/>
		</div>
	);
}
