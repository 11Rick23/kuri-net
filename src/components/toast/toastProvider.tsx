"use client";

import { nanoid } from "nanoid";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import type {
	TimerInfo,
	ToastContextValue,
	ToastItem,
	ToastOptions,
} from "@/utils/types";
import ToastCard from "./toastCard";

// トースト操作を共有するためのコンテキスト
const ToastContext = createContext<ToastContextValue | null>(null);

// コンテキストを利用するためのフック
export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx)
		throw new Error("useToast は ToastProvider の内部でのみ使用できます。");
	return ctx;
}

// トースト表示を行うプロバイダー
export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<ToastItem[]>([]);
	const timers = useRef(new Map<string, TimerInfo>());

	const clearTimer = useCallback((id: string) => {
		const timer = timers.current.get(id);
		if (timer) window.clearTimeout(timer.timeoutId);
		timers.current.delete(id);
	}, []);

	// 指定したIDのトーストを閉じ、タイマーをクリアする
	const dismiss = useCallback(
		(id: string) => {
			setItems((prev) => prev.filter((t) => t.id !== id));
			clearTimer(id);
		},
		[clearTimer],
	);

	const pause = useCallback((id: string) => {
		const info = timers.current.get(id);
		if (!info) return;

		window.clearTimeout(info.timeoutId);

		const elapsed = Date.now() - info.startAt;
		info.remainingMs = Math.max(info.remainingMs - elapsed, 0);
	}, []);

	const resume = useCallback(
		(id: string) => {
			const info = timers.current.get(id);
			if (!info || info.remainingMs <= 0) return;

			window.clearTimeout(info.timeoutId); // 念のため既存のタイマーをクリア
			info.startAt = Date.now();
			info.timeoutId = window.setTimeout(() => dismiss(id), info.remainingMs);
		},
		[dismiss],
	);

	// トーストを作成
	const toast = useCallback(
		(message: React.ReactNode, options?: ToastOptions) => {
			const id = options?.id ?? nanoid();
			const type = options?.type ?? "info";
			const durationMs = options?.durationMs ?? 5000;

			// トーストを追加、同じIDがある場合は上書き
			setItems((prev) => {
				const prevItem = prev.find((t) => t.id === id);

				const item: ToastItem = {
					id,
					type,
					message,
					durationMs,
					count: prevItem ? prevItem.count + 1 : 1,
				};

				return [...prev.filter((t) => t.id !== id), item];
			});

			// 既存のタイマーがあればクリア
			clearTimer(id);

			// 負の値を指定された場合はタイマーをセットしない
			if (durationMs <= 0) return;

			const startAt = Date.now();
			const timeoutId = window.setTimeout(() => dismiss(id), durationMs);

			// タイマーをセット
			timers.current.set(id, {
				startAt,
				remainingMs: durationMs,
				timeoutId,
			});
		},
		[dismiss, clearTimer],
	);

	const value = useMemo(
		() => ({ toast, dismiss, pause, resume }),
		[toast, dismiss, pause, resume],
	);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div
				className="fixed bottom-4 right-4 z-60 w-[min(92vw,420px)] space-y-2"
				aria-live="polite"
				aria-relevant="additions"
			>
				{items.map((t) => (
					<ToastCard
						key={t.id + String(t.count)}
						item={t}
						onClose={() => dismiss(t.id)}
					/>
				))}
			</div>
		</ToastContext.Provider>
	);
}
