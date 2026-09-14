"use client";

import { useEffect, useRef } from "react";

const animationId = "click-highlight";

export function useHighlightAction() {
	const request = useRef(0);

	useEffect(() => {
		return () => {
			request.current += 1;
		};
	}, []);

	return (target: HTMLElement, action: () => void) => {
		const currentRequest = ++request.current;
		const animation = target
			.getAnimations({ subtree: true })
			.find((animation) => animation.id === animationId);
		const complete = () => {
			if (request.current === currentRequest && target.isConnected) action();
		};
		if (!animation) {
			complete();
			return;
		}
		// モーション低減への切り替えで点滅が中断されても、操作は完了する。
		void animation.finished.then(complete, complete);
	};
}

export default function ClickHighlight() {
	useEffect(() => {
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const animations = new Map<HTMLElement, Animation>();
		const cancel = () => {
			for (const [target, animation] of animations) {
				animation.cancel();
				delete target.dataset.highlightBlinking;
			}
			animations.clear();
		};
		const onClick = (event: MouseEvent) => {
			if (reducedMotion.matches || !(event.target instanceof Element)) return;
			const target = event.target.closest<HTMLElement>(
				"[data-click-highlight]",
			);
			if (!target) return;

			animations.get(target)?.cancel();
			target.dataset.highlightBlinking = "";
			const animation = target.animate(
				[
					{ opacity: 1 },
					{ opacity: 0 },
					{ opacity: 1 },
					{ opacity: 0 },
					{ opacity: 1 },
				],
				{
					id: animationId,
					duration: 280,
					easing: "steps(4, end)",
					pseudoElement: "::before",
				},
			);
			animations.set(target, animation);
			animation.onfinish = () => {
				if (animations.get(target) !== animation) return;
				animations.delete(target);
				delete target.dataset.highlightBlinking;
			};
		};

		// 各リンク・ボタンの処理から完了を待てるよう、キャプチャ段階で開始する。
		document.addEventListener("click", onClick, true);
		reducedMotion.addEventListener("change", cancel);
		return () => {
			cancel();
			document.removeEventListener("click", onClick, true);
			reducedMotion.removeEventListener("change", cancel);
		};
	}, []);

	return null;
}
