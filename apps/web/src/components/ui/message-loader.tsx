import Image from "next/image";
import { useEffect, useState } from "react";

const ShimmerMessages = () => {
	const messages = [
		"Thinking...",
		"Analyzing your request...",
		"Building your project...",
		"Fetching data...",
		"Generating code...",
		"Preparing your project...",
		"Calculating...",
	];

	const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
		}, 2000);

		return () => clearInterval(interval);
	}, [messages.length]);

	return (
		<div className="flex items-center gap-x-2">
			<span className="text-muted-foreground animate-pulse text-base">
				{messages[currentMessageIndex]}
			</span>
		</div>
	);
};

export const MessageLoader = () => {
	return (
		<div className="group flex flex-col gap-x-2 px-2 pb-4">
			<div className="mb-2 flex items-center gap-2 pl-2">
				<Image
					src="/favicon.ico"
					alt="Logo"
					width={18}
					height={18}
					className="size-6"
				/>
				<span className="text-sm font-medium">Lovable</span>
			</div>
			<div className="flex flex-col gap-y-4 pl-8.5">
				<ShimmerMessages />
			</div>
		</div>
	);
};
