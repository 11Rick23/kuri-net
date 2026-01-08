/* 汎用型 */
export type Result<T, E = string> =
	| { success: true; data: T }
	| { success: false; error: E };

/* トースト関係の型 */
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

/* モーダル関係の型 */
export type ModalOpenOptions = {
	closeOnBackdrop?: boolean;
	closeOnEsc?: boolean;
	paddingSize?: number;
};

export type ModalState =
	| {
			isOpen: true;
			content: React.ReactNode;
			options: Required<ModalOpenOptions>;
	  }
	| {
			isOpen: false;
			content: null;
			options: Required<ModalOpenOptions>;
	  };

export type ModalContextValue = {
	isOpen: boolean;
	openModal: (content: React.ReactNode, options?: ModalOpenOptions) => void;
	closeModal: () => void;
};
