"use client";
import { Suspense } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from "./messages-container";

interface ProjectPageProps {
	projectId: number;
}

export function ProjectPage({ projectId }: ProjectPageProps) {
	return (
		<div className="flex h-screen w-screen flex-col">
			<div className="flex h-16 w-full items-center justify-between border-b">
				<h1 className="text-2xl font-bold">Project {projectId}</h1>
			</div>
			<div className="flex flex-1">
				<ResizablePanelGroup direction="horizontal">
					<ResizablePanel className="flex-1">
						<Suspense fallback={<div>Loading project...</div>}>
							<MessagesContainer projectId={projectId} />
						</Suspense>
					</ResizablePanel>
					<ResizableHandle />
					<ResizablePanel className="flex-1">
						{/* TODO: Preview the messages */}
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	);
}
