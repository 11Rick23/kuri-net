import type { Metadata } from "next";
import AuthRequired from "@/features/auth/components/AuthRequired";
import { getAuthenticatedSession } from "@/features/auth/server/session";
import NotepadScreen from "@/features/tools/notepad/NotepadScreen";
import { getCurrentUserNotepad } from "@/features/tools/notepad/server/notepad";
import { getToolDefinitionBySlug } from "@/features/tools/toolDefinitions";

const app = getToolDefinitionBySlug("notepad");

export const metadata: Metadata = {
	title: app?.title ?? "notepad",
};

export default async function NotepadPage() {
	const session = await getAuthenticatedSession();

	if (!session) {
		return <AuthRequired fullscreen={false} />;
	}

	const initialNotepad = await getCurrentUserNotepad();

	return (
		<NotepadScreen
			initialContent={initialNotepad.content}
			initialUpdatedAt={initialNotepad.updatedAt}
		/>
	);
}
