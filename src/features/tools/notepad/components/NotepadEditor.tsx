"use client";

import CopyButton from "@/features/tools/notepad/components/CopyButton";
import PasteButton from "@/features/tools/notepad/components/PasteButton";
import { useNotepadEditor } from "@/features/tools/notepad/hooks/useNotepadEditor";
import {
	getSaveStatusClassName,
	getSaveStatusMessage,
} from "@/features/tools/notepad/utils/saveStatus";

export default function NotepadEditor({
	initialContent,
	initialUpdatedAt,
}: {
	initialContent: string;
	initialUpdatedAt: string | null;
}) {
	const {
		content,
		saveState,
		lastSavedAt,
		textareaRef,
		handleBlur,
		handleContentChange,
		handleCopy,
		handlePaste,
	} = useNotepadEditor({
		initialContent,
		initialUpdatedAt,
	});

	return (
		<div className="flex flex-col gap-4 rounded-2xl border border-ctp-surface1 bg-ctp-base p-5 shadow-light dark:shadow-dark">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className={`text-sm ${getSaveStatusClassName(saveState)}`}>
					{getSaveStatusMessage(saveState, lastSavedAt)}
				</p>
				<div className="flex flex-wrap gap-2">
					<CopyButton onClick={handleCopy} />
					<PasteButton onClick={handlePaste} />
				</div>
			</div>

			<label className="sr-only" htmlFor="notepad-textarea">
				メモ本文
			</label>
			<textarea
				id="notepad-textarea"
				ref={textareaRef}
				value={content}
				onChange={(event) => {
					handleContentChange(event.target.value);
				}}
				onBlur={handleBlur}
				placeholder="ここに自由にメモを書いてください。"
				className="
				min-h-[60vh] w-full resize-y rounded-2xl
				border border-ctp-surface1
				bg-ctp-mantle px-5 py-4
				text-base leading-7 text-ctp-text transition
				placeholder:text-ctp-subtext0
				focus:border-ctp-blue focus:ring-2 focus:ring-ctp-blue/30"
			/>
		</div>
	);
}
