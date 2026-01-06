"use client";

import { nanoid } from "nanoid";
import type React from "react";
import ToastCard from "./toastCard";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";

import type {
	ToastContextValue,
	ToastItem,
	ToastOptions,
	ToastType,
} from "@/utils/types";

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
	const timers = useRef(new Map<string, number>());

	// 指定したIDのトーストを閉じ、タイマーをクリアする
	const dismiss = useCallback((id: string) => {
		setItems((prev) => prev.filter((t) => t.id !== id));
		const timer = timers.current.get(id);
		if (timer) window.clearTimeout(timer);
		timers.current.delete(id);
	}, []);

	// トーストを作成
	const toast = useCallback(
		(message: string, options?: ToastOptions) => {
			const id = options?.id ?? nanoid();
			const type = options?.type ?? "info";
			const durationMs = options?.durationMs ?? 5000;

			const item: ToastItem = { id, type, message, durationMs };

			// トーストを追加、同じIDがある場合は上書き
			setItems((prev) => [...prev.filter((t) => t.id !== id), item]);

			// 負の値を指定された場合はタイマーをセットしない
			if (durationMs <= 0) return;

			// 既存のタイマーがあればクリア
			const prevTimer = timers.current.get(id);
			if (prevTimer) window.clearTimeout(prevTimer);

			// タイマーをセット
			const timer = window.setTimeout(() => dismiss(id), durationMs);
			timers.current.set(id, timer);
		},
		[dismiss],
	);

	const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div
				className="fixed bottom-4 right-4 z-100 w-[min(92vw,420px)] space-y-2"
				aria-live="polite"
				aria-relevant="additions"
			>
				{items.map((t) => (
					<ToastCard key={t.id} item={t} onClose={() => dismiss(t.id)} />
				))}
			</div>
		</ToastContext.Provider>
	);
}
