import ToolsPageFrame from "@/features/tools/components/ToolsPageFrame";
import NotepadEditor from "@/features/tools/notepad/components/NotepadEditor";
import { getToolDefinitionBySlug } from "@/features/tools/toolDefinitions";

export default function NotepadScreen({
	initialContent,
	initialUpdatedAt,
}: {
	initialContent: string;
	initialUpdatedAt: string | null;
}) {
	const tool = getToolDefinitionBySlug("notepad");

	if (!tool) {
		throw new Error("Tool definition not found: notepad");
	}

	return (
		<ToolsPageFrame
			title={tool.title}
			englishTitle={tool.englishTitle}
			description={tool.description}
			badges={tool.badges}
		>
			<NotepadEditor
				initialContent={initialContent}
				initialUpdatedAt={initialUpdatedAt}
			/>
		</ToolsPageFrame>
	);
}
