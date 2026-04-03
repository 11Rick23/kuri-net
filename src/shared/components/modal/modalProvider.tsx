/** biome-ignore-all lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: 背景クリックで閉じるように */

"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { IoIosClose } from "react-icons/io";
import IconButton from "@/shared/components/button/IconButton";
import type {
	ModalContextValue,
	ModalOpenOptions,
	ModalState,
} from "@/shared/types/modal";

const ModalContext = createContext<ModalContextValue | null>(null);

const defaultOptions: Required<ModalOpenOptions> = {
	closeOnBackdrop: true,
	closeOnEsc: true,
	paddingSize: 12,
};

export function ModalProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<ModalState>({
		isOpen: false,
		content: null,
		options: defaultOptions,
	});

	const openModal = useCallback(
		(content: React.ReactNode, options?: ModalOpenOptions) => {
			setState({
				isOpen: true,
				content,
				options: { ...defaultOptions, ...options },
			});
		},
		[],
	);

	const closeModal = useCallback(() => {
		setState({
			isOpen: false,
			content: null,
			options: defaultOptions,
		});
	}, []);

	// ESC で閉じる
	React.useEffect(() => {
		if (!state.isOpen || !state.options.closeOnEsc) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeModal();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [state.isOpen, state.options.closeOnEsc, closeModal]);

	const value = useMemo<ModalContextValue>(
		() => ({
			isOpen: state.isOpen,
			openModal,
			closeModal,
		}),
		[state.isOpen, openModal, closeModal],
	);

	return (
		<ModalContext.Provider value={value}>
			{children}

			{state.isOpen && (
				<div
					role="dialog"
					aria-modal="true"
					className="fixed inset-0 z-80"
					onClick={state.options.closeOnBackdrop ? closeModal : undefined}
				>
					{/* 背景 */}
					<div className="absolute inset-0 bg-black/70 dark:bg-black/30" />

					<div className="absolute inset-0 flex items-center justify-center p-4">
						{/* パネル */}
						<div
							className={`
                                relative overflow-auto rounded-xl
                                bg-white dark:bg-black
                                border border-gray-300 dark:border-gray-700
                                p-${state.options.paddingSize} shadow-lg`}
							onClick={(e) => e.stopPropagation()}
						>
							{/* 閉じるボタン */}
							<IconButton
								ariaLabel="閉じる"
								onClick={closeModal}
								size="md"
								className="
                                absolute top-2 right-2
                                rounded-lg
                                text-gray-400 text-3xl leading-none
                                hover:bg-black/20 dark:hover:bg-white/20"
							>
								<IoIosClose />
							</IconButton>

							{state.content}
						</div>
					</div>
				</div>
			)}
		</ModalContext.Provider>
	);
}

export function useModal(): ModalContextValue {
	const ctx = useContext(ModalContext);
	if (!ctx) {
		throw new Error("useModal must be used within <ModalProvider>.");
	}
	return ctx;
}
