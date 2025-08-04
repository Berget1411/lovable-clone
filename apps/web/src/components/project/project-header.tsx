"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	MoonIcon,
	SunIcon,
	SunMoonIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { trpc } from "@/utils/trpc";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function ProjectHeader({ projectId }: { projectId: number }) {
	const { setTheme } = useTheme();
	const { data: project } = useSuspenseQuery(
		trpc.project.getOne.queryOptions(
			{ id: projectId },
			{
				enabled: !!projectId,
			},
		),
	);

	return (
		<header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border/40 sticky top-0 z-50 flex h-16 items-center justify-between border-b px-6 backdrop-blur">
			{/* Left side - Project info */}
			<div className="flex items-center gap-4">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="hover:bg-accent/50 flex h-10 items-center gap-3 rounded-lg px-3 transition-colors"
						>
							<div className="bg-primary/10 flex size-8 items-center justify-center rounded-md">
								<Image
									src="/favicon.ico"
									alt="Logo"
									width={16}
									height={16}
									className="size-4"
								/>
							</div>
							<div className="flex flex-col items-start">
								<span className="text-foreground text-sm font-semibold">
									{project.name}
								</span>
								<span className="text-muted-foreground text-xs">
									Active Project
								</span>
							</div>
							<ChevronDownIcon className="text-muted-foreground size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="bottom" align="start" className="w-56">
						<DropdownMenuLabel>Project Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href="/" className="flex items-center gap-2">
								<ChevronLeftIcon className="size-4" />
								<span>Back to Dashboard</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<SunMoonIcon className="mr-2 size-4" />
								<span>Change theme</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent>
									<DropdownMenuItem onClick={() => setTheme("light")}>
										<SunIcon className="size-4" />
										<span>Light</span>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme("dark")}>
										<MoonIcon className="size-4" />
										<span>Dark</span>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setTheme("system")}>
										<SunMoonIcon
											className="size-4"
											onClick={() => setTheme("system")}
										/>
										<span>System</span>
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
