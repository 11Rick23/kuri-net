import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ProfileTimelinePeriod } from "../data/profileData";
import styles from "./ProfileTimeline.module.css";

type Direction = -1 | 1;

function animatePeriod(
	panel: HTMLDivElement,
	direction: Direction,
	entering: boolean,
) {
	const style = getComputedStyle(panel);
	const durationValue = style.getPropertyValue("--site-duration-state").trim();
	// ビルド時にmsがsへ短縮されても、Web Animationsにはミリ秒で渡す。
	const duration =
		Number.parseFloat(durationValue) *
		(durationValue.endsWith("ms") ? 1 : 1000);
	const timing = {
		duration: entering ? duration * 0.75 : duration / 2,
		easing: entering
			? style.getPropertyValue("--site-ease").trim()
			: "cubic-bezier(0.4, 0, 1, 1)",
		fill: "both" as const,
	};
	const offset = direction * (entering ? 24 : -24);
	const visible = { opacity: 1, transform: "translateX(0)", filter: "blur(0)" };
	const dissolved = {
		opacity: 0,
		transform: `translateX(${offset}px)`,
		filter: "blur(1.5px)",
	};
	const animations = Array.from(
		panel.querySelectorAll<HTMLElement>(
			`.${styles.eventDate}, .${styles.eventCard} h5, .${styles.eventText}, .${styles.range}`,
		),
		(element) => {
			const current = getComputedStyle(element);
			return element.animate(
				entering
					? [dissolved, visible]
					: [
							{
								opacity: current.opacity,
								transform: current.transform,
								filter: current.filter,
							},
							dissolved,
						],
				timing,
			);
		},
	);
	return animations;
}

export default function useProfileTimelineTransition(
	periods: ProfileTimelinePeriod[],
) {
	const initialId = periods.at(-1)?.id;
	const [selectedId, setSelectedId] = useState(initialId);
	const [transitionDirection, setTransitionDirection] = useState<Direction>(1);
	const panels = useRef(new Map<string, HTMLDivElement>());
	const displayedId = useRef(initialId);
	const requestedId = useRef(initialId);
	const incoming = useRef<Direction | null>(null);
	const animations = useRef<Animation[]>([]);
	const request = useRef(0);

	const cancelAnimations = () => {
		for (const animation of animations.current) animation.cancel();
		animations.current = [];
	};

	useEffect(() => {
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const finish = () => {
			request.current += 1;
			for (const animation of animations.current) animation.cancel();
			animations.current = [];
			incoming.current = null;
			displayedId.current = requestedId.current;
			setSelectedId(requestedId.current);
		};
		const onMotionChange = () => {
			if (reducedMotion.matches) finish();
		};
		reducedMotion.addEventListener("change", onMotionChange);
		window.addEventListener("beforeprint", finish);
		return () => {
			request.current += 1;
			for (const animation of animations.current) animation.cancel();
			reducedMotion.removeEventListener("change", onMotionChange);
			window.removeEventListener("beforeprint", finish);
		};
	}, []);

	useLayoutEffect(() => {
		// 旧文字は次のパネルが描画されるまで透明なまま保つ。
		for (const animation of animations.current) animation.cancel();
		animations.current = [];
		const direction = incoming.current;
		incoming.current = null;
		const panel = selectedId ? panels.current.get(selectedId) : undefined;
		if (
			!panel ||
			direction === null ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}
		const currentRequest = request.current;
		animations.current = animatePeriod(panel, direction, true);
		void Promise.allSettled(animations.current.map((a) => a.finished)).then(
			() => {
				if (request.current !== currentRequest) return;
				for (const animation of animations.current) animation.cancel();
				animations.current = [];
			},
		);
	}, [selectedId]);

	const selectPeriod = (id: string) => {
		if (id === requestedId.current) return;
		const nextIndex = periods.findIndex((period) => period.id === id);
		if (nextIndex < 0) return;
		requestedId.current = id;
		const currentRequest = ++request.current;
		incoming.current = null;
		if (id === displayedId.current) {
			cancelAnimations();
			return;
		}
		const currentIndex = periods.findIndex(
			(period) => period.id === displayedId.current,
		);
		const direction: Direction = nextIndex > currentIndex ? 1 : -1;
		setTransitionDirection(direction);
		const panel = displayedId.current
			? panels.current.get(displayedId.current)
			: undefined;
		const showNext = () => {
			if (request.current !== currentRequest) return;
			displayedId.current = id;
			incoming.current = direction;
			setSelectedId(id);
		};
		if (
			!panel ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			showNext();
			return;
		}
		const previousAnimations = animations.current;
		animations.current = animatePeriod(panel, direction, false);
		for (const animation of previousAnimations) animation.cancel();
		void Promise.allSettled(animations.current.map((a) => a.finished)).then(
			showNext,
		);
	};

	return { selectedId, selectPeriod, panels, transitionDirection };
}
