"use client";

import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { IoIosClose } from "react-icons/io";
import IconButton from "@/shared/components/button/IconButton";
import {
	decideDialogKeyboardAction,
	lockBodyScroll,
	resolveFocusReturnTarget,
} from "@/shared/components/modal/dialogAccessibility";
import type {
	ModalContextValue,
	ModalOpenOptions,
	ModalState,
} from "@/shared/types/modal";

const ModalContext = createContext<ModalContextValue | null>(null);

const defaultOptions: Omit<Required<ModalOpenOptions>, "ariaLabel"> = {
	closeOnBackdrop: true,
	closeOnEsc: true,
	paddingSize: 12,
	returnFocusFallback: () => null,
};

const paddingClassName: Record<number, string> = {
	0: "p-0",
	4: "p-4",
	6: "p-6",
	12: "p-12",
};

const focusableSelector = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[tabindex]:not([tabindex='-1'])",
].join(",");

export function ModalProvider({ children }: { children: ReactNode }) {
	const panelRef = useRef<HTMLDivElement | null>(null);
	const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
	const [state, setState] = useState<ModalState>({
		isOpen: false,
		content: null,
		options: null,
	});

	const openModal = useCallback(
		(content: ReactNode, options: ModalOpenOptions) => {
			if (document.activeElement instanceof HTMLElement) {
				previouslyFocusedElementRef.current = document.activeElement;
			}

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
			options: null,
		});
	}, []);

	useEffect(() => {
		if (!state.isOpen) return;

		const options = state.options;
		const unlockBodyScroll = lockBodyScroll(document.body.style);

		const focusFrame = window.requestAnimationFrame(() => {
			panelRef.current?.focus();
		});

		const onKeyDown = (event: KeyboardEvent) => {
			const panel = panelRef.current;
			if (!panel) return;

			const focusableElements = Array.from(
				panel.querySelectorAll<HTMLElement>(focusableSelector),
			).filter((element) => element.tabIndex >= 0);

			if (focusableElements.length === 0) {
				event.preventDefault();
				panel.focus();
				return;
			}

			const firstElement = focusableElements[0];
			const lastElement = focusableElements.at(-1);
			const activeElement = document.activeElement;
			const activePosition =
				activeElement === firstElement && firstElement === lastElement
					? "only"
					: activeElement === panel
						? "container"
						: activeElement === firstElement
							? "first"
							: activeElement === lastElement
								? "last"
								: panel.contains(activeElement)
									? "inside"
									: "outside";
			const action = decideDialogKeyboardAction({
				key: event.key,
				shiftKey: event.shiftKey,
				closeOnEscape: options.closeOnEsc,
				focusableCount: focusableElements.length,
				activePosition,
			});

			if (action === "none") return;

			event.preventDefault();
			if (action === "close") {
				closeModal();
			} else if (action === "focus-container") {
				panel.focus();
			} else if (action === "focus-first") {
				firstElement?.focus();
			} else {
				lastElement?.focus();
			}
		};

		document.addEventListener("keydown", onKeyDown);

		return () => {
			window.cancelAnimationFrame(focusFrame);
			document.removeEventListener("keydown", onKeyDown);
			unlockBodyScroll();

			const previouslyFocusedElement = previouslyFocusedElementRef.current;
			previouslyFocusedElementRef.current = null;
			window.requestAnimationFrame(() => {
				resolveFocusReturnTarget(
					previouslyFocusedElement,
					options.returnFocusFallback,
				)?.focus();
			});
		};
	}, [state, closeModal]);

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
				<div className="fixed inset-0 z-80">
					<div className="absolute inset-0 bg-ctp-crust/80" />

					{/* biome-ignore lint/a11y/noStaticElementInteractions: 背景はポインター操作用で、キーボードではEscapeと閉じるボタンを使う */}
					<div
						className="absolute inset-0 flex items-center justify-center p-4"
						onMouseDown={(event) => {
							if (
								state.options.closeOnBackdrop &&
								event.target === event.currentTarget
							) {
								closeModal();
							}
						}}
					>
						<div
							ref={panelRef}
							role="dialog"
							aria-label={state.options.ariaLabel}
							aria-modal="true"
							tabIndex={-1}
							className={[
								"relative overflow-auto rounded-lg border border-ctp-overlay0 bg-ctp-surface0 text-ctp-text",
								paddingClassName[state.options.paddingSize] ?? "p-12",
							].join(" ")}
						>
							<IconButton
								ariaLabel="閉じる"
								onClick={closeModal}
								size="md"
								className="absolute top-2 right-2 z-20 rounded-lg text-3xl leading-none text-ctp-overlay1"
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
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error("useModal must be used within <ModalProvider>.");
	}
	return context;
}
