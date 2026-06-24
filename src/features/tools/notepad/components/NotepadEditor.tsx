"use client";

import CopyButton from "@/features/tools/notepad/components/CopyButton";
import PasteButton from "@/features/tools/notepad/components/PasteButton";
import type { SaveState } from "@/features/tools/notepad/hooks/useNotepadEditor";
import { useNotepadEditor } from "@/features/tools/notepad/hooks/useNotepadEditor";
import {
	getSaveStatusClassName,
	getSaveStatusMessage,
} from "@/features/tools/notepad/utils/saveStatus";

const saveStatusDotClassName: Record<SaveState, string> = {
	saved: "bg-ctp-subtext1",
	saving: "bg-ctp-sapphire",
	pending: "bg-ctp-yellow",
	error: "bg-ctp-red",
};

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

	const lineCount = content.length === 0 ? 0 : content.split("\n").length;

	return (
		<section
			aria-label="メモ編集"
			className="flex flex-col gap-4 rounded-lg border border-ctp-surface1 bg-ctp-base p-4 sm:p-5"
		>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-ctp-subtext0">
						Editor
					</p>
					<div
						aria-live="polite"
						className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-ctp-surface1 bg-ctp-mantle px-3 py-2"
					>
						<span
							aria-hidden
							className={`h-2.5 w-2.5 rounded-full ${saveStatusDotClassName[saveState]}`}
						/>
						<p
							className={`text-sm font-semibold ${getSaveStatusClassName(saveState)}`}
						>
							{getSaveStatusMessage(saveState, lastSavedAt)}
						</p>
					</div>
				</div>
				<div className="flex flex-wrap gap-2 sm:justify-end">
					<CopyButton onClick={handleCopy} />
					<PasteButton onClick={handlePaste} />
				</div>
			</div>

			<div className="overflow-hidden rounded-lg border border-ctp-surface1 bg-ctp-mantle">
				<div className="flex items-center justify-between gap-3 border-b border-ctp-surface1 px-4 py-3">
					<label
						className="text-sm font-semibold text-ctp-text"
						htmlFor="notepad-textarea"
					>
						メモ本文
					</label>
					<p className="shrink-0 text-xs font-semibold text-ctp-subtext0">
						{content.length}文字 / {lineCount}行
					</p>
				</div>
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
					min-h-[26rem] w-full resize-y bg-transparent
					px-5 py-4 text-base leading-7 text-ctp-text
					transition placeholder:text-ctp-subtext0
					focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ctp-blue/35
					sm:min-h-[34rem]"
				/>
			</div>
		</section>
	);
}
