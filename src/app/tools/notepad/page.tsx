import type { Metadata } from "next";
import AuthRequired from "@/features/auth/components/authRequired";
import { verifySession } from "@/features/auth/server/verifySession";
import NotepadScreen from "@/features/tools/notepad/NotepadScreen";
import { getCurrentUserNotepad } from "@/features/tools/notepad/server/notepad";

export const metadata: Metadata = {
	title: "Notepad",
};

export default async function NotepadPage() {
	const session = await verifySession();

	if (!session?.userID) {
		return <AuthRequired fullscreen={false} />;
	}

	const initialNotepad = await getCurrentUserNotepad(session.userID);

	return (
		<NotepadScreen
			initialContent={initialNotepad.content}
			initialUpdatedAt={initialNotepad.updatedAt}
		/>
	);
}
