"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
import PasteConfirmModal from "@/features/tools/notepad/components/PasteConfirmModal";
import {
	drainSaveQueue,
	getStateAfterQueueDrained,
} from "@/features/tools/notepad/domain/saveQueue";
import { saveCurrentUserNotepad } from "@/features/tools/notepad/server/notepad";
import { useModal } from "@/shared/components/modal/ModalProvider";
import { useToast } from "@/shared/components/toast/ToastProvider";

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
	const isMountedRef = useRef(true);

	const clearDebounceTimer = useCallback(() => {
		if (debounceTimerRef.current !== null) {
			window.clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = null;
		}
	}, []);

	const showSaveError = useCallback(
		(message: string, saveState: Extract<SaveState, "error"> = "error") => {
			if (!isMountedRef.current) {
				return;
			}

			setSaveState(saveState);
			toast(message, {
				id: "notepad-save-error",
				type: "error",
				durationMs: 6000,
			});
		},
		[toast],
	);

	const flushQueuedSave = useCallback(async () => {
		if (inFlightRef.current || !isMountedRef.current) {
			return;
		}

		inFlightRef.current = true;
		let outcome: Awaited<ReturnType<typeof drainSaveQueue>>;

		try {
			outcome = await drainSaveQueue({
				getQueuedContent: () =>
					isMountedRef.current ? queuedContentRef.current : null,
				setQueuedContent: (nextContent) => {
					queuedContentRef.current = nextContent;
				},
				getCurrentContent: () => contentRef.current,
				getLastSavedContent: () => lastSavedContentRef.current,
				setLastSavedContent: (nextContent) => {
					lastSavedContentRef.current = nextContent;
				},
				save: saveCurrentUserNotepad,
				onSaveStart: () => {
					if (isMountedRef.current) {
						setSaveState("saving");
					}
				},
				onSaveSuccess: (result) => {
					if (isMountedRef.current) {
						setLastSavedAt(result.updatedAt);
					}
				},
			});
		} finally {
			inFlightRef.current = false;
		}

		if (!isMountedRef.current) {
			return;
		}

		if (outcome.type === "invalid") {
			showSaveError(outcome.error);
			return;
		}

		if (outcome.type === "failed") {
			showSaveError(
				"メモの保存に失敗しました。しばらくしてから再度お試しください。",
			);
			return;
		}

		setSaveState(
			getStateAfterQueueDrained(
				contentRef.current,
				lastSavedContentRef.current,
			),
		);
	}, [showSaveError]);

	useEffect(() => {
		contentRef.current = content;

		if (content === lastSavedContentRef.current) {
			clearDebounceTimer();

			if (inFlightRef.current) {
				queuedContentRef.current = content;
				setSaveState("saving");
				return;
			}

			queuedContentRef.current = null;
			setSaveState("saved");
			return;
		}

		clearDebounceTimer();

		if (inFlightRef.current) {
			queuedContentRef.current = content;
			setSaveState("saving");
			return;
		}

		setSaveState("pending");
		debounceTimerRef.current = window.setTimeout(() => {
			queuedContentRef.current = contentRef.current;
			void flushQueuedSave();
		}, 700);

		return clearDebounceTimer;
	}, [content, clearDebounceTimer, flushQueuedSave]);

	useEffect(() => {
		isMountedRef.current = true;
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (contentRef.current === lastSavedContentRef.current) {
				return;
			}

			event.preventDefault();
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			isMountedRef.current = false;
			clearDebounceTimer();
			queuedContentRef.current = null;
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [clearDebounceTimer]);

	const handleBlur = useCallback(() => {
		clearDebounceTimer();

		if (contentRef.current === lastSavedContentRef.current) {
			return;
		}

		queuedContentRef.current = contentRef.current;
		void flushQueuedSave();
	}, [clearDebounceTimer, flushQueuedSave]);

	const handleContentChange = useCallback((nextContent: string) => {
		contentRef.current = nextContent;

		if (inFlightRef.current) {
			queuedContentRef.current = nextContent;
		}

		setContent(nextContent);
	}, []);

	const retrySave = useCallback(() => {
		clearDebounceTimer();
		queuedContentRef.current = contentRef.current;
		void flushQueuedSave();
	}, [clearDebounceTimer, flushQueuedSave]);

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
			handleContentChange(text);
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

		openModal(
			createElement(PasteConfirmModal, { onConfirm: pasteFromClipboard }),
			{
				ariaLabel: "メモ内容の置き換え確認",
				closeOnBackdrop: true,
				paddingSize: 6,
			},
		);
	};

	return {
		content,
		saveState,
		lastSavedAt,
		textareaRef,
		handleBlur,
		handleContentChange,
		retrySave,
		handleCopy,
		handlePaste,
	};
}
