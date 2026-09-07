export type DialogFocusPosition =
	| "container"
	| "first"
	| "inside"
	| "last"
	| "only"
	| "outside";

export type DialogKeyboardAction =
	| "none"
	| "close"
	| "focus-container"
	| "focus-first"
	| "focus-last";

export function decideDialogKeyboardAction({
	key,
	shiftKey,
	closeOnEscape,
	focusableCount,
	activePosition,
}: {
	key: string;
	shiftKey: boolean;
	closeOnEscape: boolean;
	focusableCount: number;
	activePosition: DialogFocusPosition;
}): DialogKeyboardAction {
	if (key === "Escape") {
		return closeOnEscape ? "close" : "none";
	}

	if (key !== "Tab") {
		return "none";
	}

	if (focusableCount === 0) {
		return "focus-container";
	}

	if (activePosition === "only") {
		return shiftKey ? "focus-last" : "focus-first";
	}

	if (shiftKey && ["container", "first", "outside"].includes(activePosition)) {
		return "focus-last";
	}

	if (!shiftKey && ["last", "outside"].includes(activePosition)) {
		return "focus-first";
	}

	return "none";
}

export function lockBodyScroll(style: Pick<CSSStyleDeclaration, "overflow">) {
	const previousOverflow = style.overflow;
	style.overflow = "hidden";

	return () => {
		style.overflow = previousOverflow;
	};
}

export function resolveFocusReturnTarget(
	previouslyFocusedElement: HTMLElement | null,
	fallback?: () => HTMLElement | null,
): HTMLElement | null {
	if (previouslyFocusedElement?.isConnected) {
		return previouslyFocusedElement;
	}

	const fallbackElement = fallback?.() ?? null;
	return fallbackElement?.isConnected ? fallbackElement : null;
}
