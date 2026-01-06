/* 汎用型 */
export type Result<T, E = string> =
	| { success: true; data: T }
	| { success: false; error: E };

/* トースト関係の型 */
export type ToastType = "info" | "success" | "warning" | "error";

export type ToastItem = {
	id: string;
	type: ToastType;
	message: string;
	durationMs: number;
};

export type ToastOptions = {
	type?: ToastType;
	durationMs?: number;
};

export type ToastContextValue = {
	toast: (message: string, options?: ToastOptions) => void;
	dismiss: (id: string) => void;
};
