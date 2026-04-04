"use client";

import { useEffect, useRef, useState } from "react";
import CopyButton from "@/features/tools/notepad/components/CopyButton";
import PasteButton from "@/features/tools/notepad/components/PasteButton";
import { saveCurrentUserNotepad } from "@/features/tools/notepad/server/notepad";
import { useToast } from "@/shared/components/toast/toastProvider";

type SaveState = "saved" | "saving" | "pending" | "error";

function formatSavedAt(value: string | null) {
	if (!value) {
		return "保存済み";
	}

	const date = new Date(value);

	return `保存済み ${new Intl.DateTimeFormat("ja-JP", {
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).format(date)}`;
}

function getStatusMessage(state: SaveState, lastSavedAt: string | null) {
	switch (state) {
		case "saving":
			return "保存中...";
		case "pending":
			return "未保存の変更があります";
		case "error":
			return "保存に失敗しました";
		default:
			return formatSavedAt(lastSavedAt);
	}
}

export default function NotepadEditor({
	initialContent,
	initialUpdatedAt,
}: {
	initialContent: string;
	initialUpdatedAt: string | null;
}) {
	const { toast } = useToast();
	const [content, setContent] = useState(initialContent);
	const [saveState, setSaveState] = useState<SaveState>("saved");
	const [lastSavedAt, setLastSavedAt] = useState<string | null>(
		initialUpdatedAt,
	);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const contentRef = useRef(initialContent);
	const lastSavedContentRef = useRef(initialContent);
	const queuedContentRef = useRef<string | null>(null);
	const inFlightRef = useRef(false);
	const debounceTimerRef = useRef<number | null>(null);

	const clearDebounceTimer = () => {
		if (debounceTimerRef.current !== null) {
			window.clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = null;
		}
	};

	const flushQueuedSave = async () => {
		if (inFlightRef.current) {
			return;
		}

		while (queuedContentRef.current !== null) {
			const nextContent = queuedContentRef.current;
			queuedContentRef.current = null;

			if (nextContent === lastSavedContentRef.current) {
				continue;
			}

			inFlightRef.current = true;
			setSaveState("saving");

			try {
				const result = await saveCurrentUserNotepad(nextContent);
				lastSavedContentRef.current = nextContent;
				setLastSavedAt(result.updatedAt);
			} catch {
				setSaveState("error");
				toast(
					"メモの保存に失敗しました。しばらくしてから再度お試しください。",
					{
						id: "notepad-save-error",
						type: "error",
						durationMs: 6000,
					},
				);
			} finally {
				inFlightRef.current = false;
			}
		}

		if (contentRef.current === lastSavedContentRef.current) {
			setSaveState("saved");
			return;
		}

		setSaveState("pending");
	};

	useEffect(() => {
		contentRef.current = content;

		if (content === lastSavedContentRef.current) {
			clearDebounceTimer();
			if (!inFlightRef.current) {
				setSaveState("saved");
			}
			return;
		}

		setSaveState(inFlightRef.current ? "saving" : "pending");
		clearDebounceTimer();
		debounceTimerRef.current = window.setTimeout(() => {
			queuedContentRef.current = contentRef.current;
			void flushQueuedSave();
		}, 700);

		return clearDebounceTimer;
	}, [content]);

	useEffect(() => {
		return () => {
			clearDebounceTimer();
		};
	}, []);

	const handleBlur = () => {
		clearDebounceTimer();

		if (contentRef.current === lastSavedContentRef.current) {
			return;
		}

		queuedContentRef.current = contentRef.current;
		void flushQueuedSave();
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(contentRef.current);
			toast("メモをクリップボードにコピーしました。", {
				type: "success",
				durationMs: 4000,
			});
		} catch {
			toast("コピーに失敗しました。ブラウザの権限設定をご確認ください。", {
				type: "error",
				durationMs: 5000,
			});
		}
	};

	const handlePaste = async () => {
		try {
			const text = await navigator.clipboard.readText();
			setContent(text);
			textareaRef.current?.focus();
			toast("クリップボードの内容を貼り付けました。", {
				type: "success",
				durationMs: 4000,
			});
		} catch {
			toast("貼り付けに失敗しました。ブラウザの権限設定をご確認ください。", {
				type: "error",
				durationMs: 5000,
			});
		}
	};

	return (
		<div className="flex flex-col gap-4 rounded-2xl border border-ctp-surface1 bg-ctp-base p-5 shadow-light dark:shadow-dark">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p
					className={`text-sm ${
						saveState === "error"
							? "text-ctp-red"
							: saveState === "pending"
								? "text-ctp-yellow"
								: saveState === "saving"
									? "text-ctp-sapphire"
									: "text-ctp-subtext1"
					}`}
				>
					{getStatusMessage(saveState, lastSavedAt)}
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
					setContent(event.target.value);
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
