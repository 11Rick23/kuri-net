"use client";

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
	ToastContextValue,
	ToastItem,
	ToastOptions,
	ToastType,
} from "@/utils/types";

// Toast操作を共有するためのコンテキスト
const ToastContext = createContext<ToastContextValue | null>(null);

// コンテキストを利用するためのフック
export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx)
		throw new Error("useToast は ToastProvider の内部でのみ使用できます。");
	return ctx;
}

// 一意なIDを生成（十分なユニーク性を持つ簡易実装）
function uid() {
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<ToastItem[]>([]);
	const timers = useRef(new Map<string, number>());

	// 指定IDのトーストを閉じ、タイマーも片付ける
	const dismiss = useCallback((id: string) => {
		setItems((prev) => prev.filter((t) => t.id !== id));
		const timer = timers.current.get(id);
		if (timer) window.clearTimeout(timer);
		timers.current.delete(id);
	}, []);

	// 新しいトーストをキューに追加し、指定時間後に自動で閉じる
	const toast = useCallback(
		(message: string, options?: ToastOptions) => {
			const id = uid();
			const type = options?.type ?? "info";
			const durationMs = options?.durationMs ?? 5000;

			const item: ToastItem = { id, type, message, durationMs };
			setItems((prev) => [...prev, item]);

			const timer = window.setTimeout(() => dismiss(id), durationMs);
			timers.current.set(id, timer);
		},
		[dismiss],
	);

	const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

	return (
		<ToastContext.Provider value={value}>
			{children}

			{/* 画面下に固定 */}
			<div
				className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[min(92vw,420px)] space-y-2"
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

function ToastCard({
	item,
	onClose,
}: {
	item: ToastItem;
	onClose: () => void;
}) {
	const base =
		"rounded-xl shadow-lg border px-3 py-2 flex items-start gap-3 bg-white dark:bg-gray-900";
	// 種類別にボーダー色を変更
	const colorByType: Record<ToastType, string> = {
		info: "border-gray-200 dark:border-gray-700",
		success: "border-green-300 dark:border-green-800",
		warning: "border-yellow-300 dark:border-yellow-800",
		error: "border-red-300 dark:border-red-800",
	};

	return (
		<div className={`${base} ${colorByType[item.type]}`}>
			<div className="text-sm text-gray-900 dark:text-gray-100 flex-1">
				{item.message}
			</div>
			<button
				type="button"
				onClick={onClose}
				className="text-xs px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
				aria-label="閉じる"
			>
				✕
			</button>
		</div>
	);
}
