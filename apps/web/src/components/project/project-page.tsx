"use client";
import { Suspense, useState } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { Fragment } from "@/types/schema";
import { MessagesContainer } from "./messages-container";
import { ProjectHeader } from "./project-header";

interface ProjectPageProps {
	projectId: number;
}

export function ProjectPage({ projectId }: ProjectPageProps) {
	const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
	return (
		<div className="flex h-screen w-screen flex-col">
			{/* Fixed Project Header */}
			<div className="relative z-50 shrink-0">
				<Suspense fallback={<div>Loading project header...</div>}>
					<ProjectHeader projectId={projectId} />
				</Suspense>
			</div>

			{/* Main Content Area */}
			<div className="flex flex-1 overflow-hidden">
				<ResizablePanelGroup direction="horizontal">
					<ResizablePanel className="flex-1">
						<Suspense fallback={<div>Loading project...</div>}>
							<MessagesContainer
								projectId={projectId}
								activeFragment={activeFragment}
								setActiveFragment={setActiveFragment}
							/>
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
