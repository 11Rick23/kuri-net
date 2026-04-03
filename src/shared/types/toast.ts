export type ToastType = "info" | "success" | "warning" | "error";

export type ToastItem = {
	id: string;
	type: ToastType;
	message: React.ReactNode;
	durationMs: number;
	count: number;
};

export type ToastOptions = {
	id?: string;
	type?: ToastType;
	durationMs?: number;
};

export type ToastContextValue = {
	toast: (message: React.ReactNode, options?: ToastOptions) => void;
	dismiss: (id: string) => void;
	pause: (id: string) => void;
	resume: (id: string) => void;
};

export type TimerInfo = {
	startAt: number;
	remainingMs: number;
	timeoutId: number;
};
