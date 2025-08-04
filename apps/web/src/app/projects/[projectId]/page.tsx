import { ProjectPage } from "@/components/project/project-page";

export default async function Page({
	params,
}: {
	params: Promise<{ projectId: string }>;
}) {
	const { projectId } = await params;

	return <ProjectPage projectId={Number(projectId)} />;
}
