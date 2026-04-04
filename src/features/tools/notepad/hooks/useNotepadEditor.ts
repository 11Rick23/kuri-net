"use client";

import { createElement, useEffect, useRef, useState } from "react";
import PasteConfirmModal from "@/features/tools/notepad/components/PasteConfirmModal";
import { saveCurrentUserNotepad } from "@/features/tools/notepad/server/notepad";
import { useModal } from "@/shared/components/modal/modalProvider";
import { useToast } from "@/shared/components/toast/toastProvider";

export type SaveState = "saved" | "saving" | "pending" | "error";

export function useNotepadEditor({
	initialContent,
	initialUpdatedAt,
}: {
	initialContent: string;
	initialUpdatedAt: string | null;
}) {
	const { toast } = useToast();
	const { openModal } = useModal();
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

	const handleContentChange = (nextContent: string) => {
		setContent(nextContent);
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

	const pasteFromClipboard = async () => {
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

	const handlePaste = async () => {
		if (contentRef.current.length === 0) {
			await pasteFromClipboard();
			return;
		}

		openModal(createElement(PasteConfirmModal, { onConfirm: pasteFromClipboard }), {
			closeOnBackdrop: true,
			paddingSize: 6,
		});
	};

	return {
		content,
		saveState,
		lastSavedAt,
		textareaRef,
		handleBlur,
		handleContentChange,
		handleCopy,
		handlePaste,
	};
}
