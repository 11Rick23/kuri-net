"use client";

import type { FocusEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { resolveMediaProgress } from "./videoPlayerHelpers";

const controlsIdleMs = 2200;

type WebkitDocument = Document & {
	webkitFullscreenElement?: Element | null;
	webkitExitFullscreen?: () => Promise<void>;
	webkitCancelFullScreen?: () => void;
};

type WebkitVideo = HTMLVideoElement & {
	webkitEnterFullscreen?: () => void;
	webkitExitFullscreen?: () => void;
	webkitDisplayingFullscreen?: boolean;
};

function containsRelatedTarget(
	currentTarget: HTMLDivElement,
	relatedTarget: EventTarget | null,
) {
	return relatedTarget instanceof Node && currentTarget.contains(relatedTarget);
}

export function useVideoPlayer() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const controlsRef = useRef<HTMLDivElement | null>(null);
	const hideControlsTimeoutRef = useRef<number | null>(null);
	const pointerInsideRef = useRef(false);
	const hoverCapableRef = useRef(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [showControls, setShowControls] = useState(false);
	const [isHoverCapable, setIsHoverCapable] = useState(false);
	const [isVolumePanelOpen, setIsVolumePanelOpen] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
		const syncHoverCapability = (event?: MediaQueryListEvent) => {
			const nextValue = event?.matches ?? mediaQuery.matches;
			hoverCapableRef.current = nextValue;
			setIsHoverCapable(nextValue);

			if (!nextValue) {
				setIsVolumePanelOpen(false);
			}
		};

		syncHoverCapability();
		mediaQuery.addEventListener("change", syncHoverCapability);

		return () => mediaQuery.removeEventListener("change", syncHoverCapability);
	}, []);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const syncVideoState = () => {
			setCurrentTime(video.currentTime);
			setDuration(video.duration || 0);
			setVolume(video.volume);
			setIsMuted(video.muted || video.volume === 0);
			setIsPlaying(!video.paused && !video.ended);
		};

		const syncFullscreenState = () => {
			const webkitDocument = document as WebkitDocument;
			const webkitVideo = video as WebkitVideo;
			setIsFullscreen(
				document.fullscreenElement === containerRef.current ||
					webkitDocument.webkitFullscreenElement === containerRef.current ||
					(webkitVideo.webkitDisplayingFullscreen ?? false),
			);
		};

		syncVideoState();

		video.addEventListener("loadedmetadata", syncVideoState);
		video.addEventListener("durationchange", syncVideoState);
		video.addEventListener("timeupdate", syncVideoState);
		video.addEventListener("play", syncVideoState);
		video.addEventListener("pause", syncVideoState);
		video.addEventListener("ended", syncVideoState);
		video.addEventListener("volumechange", syncVideoState);
		document.addEventListener("fullscreenchange", syncFullscreenState);
		document.addEventListener("webkitfullscreenchange", syncFullscreenState);
		video.addEventListener("webkitbeginfullscreen", syncFullscreenState);
		video.addEventListener("webkitendfullscreen", syncFullscreenState);

		return () => {
			video.removeEventListener("loadedmetadata", syncVideoState);
			video.removeEventListener("durationchange", syncVideoState);
			video.removeEventListener("timeupdate", syncVideoState);
			video.removeEventListener("play", syncVideoState);
			video.removeEventListener("pause", syncVideoState);
			video.removeEventListener("ended", syncVideoState);
			video.removeEventListener("volumechange", syncVideoState);
			document.removeEventListener("fullscreenchange", syncFullscreenState);
			document.removeEventListener(
				"webkitfullscreenchange",
				syncFullscreenState,
			);
			video.removeEventListener("webkitbeginfullscreen", syncFullscreenState);
			video.removeEventListener("webkitendfullscreen", syncFullscreenState);
		};
	}, []);

	useEffect(
		() => () => {
			if (hideControlsTimeoutRef.current !== null) {
				window.clearTimeout(hideControlsTimeoutRef.current);
			}
		},
		[],
	);

	const clearHideControlsTimer = () => {
		if (hideControlsTimeoutRef.current === null) return;

		window.clearTimeout(hideControlsTimeoutRef.current);
		hideControlsTimeoutRef.current = null;
	};

	const controlsContainFocus = () => {
		const activeElement = document.activeElement;

		return (
			activeElement instanceof HTMLElement &&
			controlsRef.current?.contains(activeElement) === true
		);
	};

	const hideControls = () => {
		if (controlsContainFocus()) return;

		setShowControls(false);
		setIsVolumePanelOpen(false);
	};

	const scheduleHideControls = () => {
		clearHideControlsTimer();

		hideControlsTimeoutRef.current = window.setTimeout(() => {
			if (controlsContainFocus()) return;
			if (hoverCapableRef.current && !pointerInsideRef.current) return;
			hideControls();
		}, controlsIdleMs);
	};

	const revealControls = () => {
		setShowControls(true);
		scheduleHideControls();
	};

	const togglePlayback = async () => {
		const video = videoRef.current;
		if (!video) return;

		try {
			if (video.paused || video.ended) {
				await video.play();
			} else {
				video.pause();
			}
		} catch (error) {
			console.error("Failed to toggle video playback.", error);
		}

		revealControls();
	};

	const handleSeek = (nextTime: string) => {
		const video = videoRef.current;
		if (!video) return;

		video.currentTime = Number(nextTime);
		revealControls();
	};

	const handleVolumeChange = (nextVolume: string) => {
		const video = videoRef.current;
		if (!video) return;

		const resolvedVolume = Number(nextVolume);
		video.volume = resolvedVolume;
		video.muted = resolvedVolume === 0;
		revealControls();
	};

	const toggleMuted = () => {
		const video = videoRef.current;
		if (!video) return;

		if (video.muted || video.volume === 0) {
			video.muted = false;
			video.volume = video.volume === 0 ? 1 : video.volume;
		} else {
			video.muted = true;
		}

		revealControls();
	};

	const toggleFullscreen = async () => {
		const container = containerRef.current;
		const video = videoRef.current as WebkitVideo | null;
		if (!container || !video) return;

		const webkitDocument = document as WebkitDocument;
		const isCurrentlyFullscreen =
			document.fullscreenElement === container ||
			webkitDocument.webkitFullscreenElement === container ||
			(video.webkitDisplayingFullscreen ?? false);

		try {
			if (isCurrentlyFullscreen) {
				if (document.fullscreenElement === container) {
					await document.exitFullscreen();
				} else if (webkitDocument.webkitFullscreenElement === container) {
					if (webkitDocument.webkitExitFullscreen) {
						await webkitDocument.webkitExitFullscreen();
					} else {
						webkitDocument.webkitCancelFullScreen?.();
					}
				} else if (video.webkitDisplayingFullscreen) {
					video.webkitExitFullscreen?.();
				}
			} else if (document.fullscreenEnabled) {
				await container.requestFullscreen();
			} else {
				video.webkitEnterFullscreen?.();
			}
		} catch (error) {
			console.error("Failed to toggle fullscreen mode.", error);
		}

		revealControls();
	};

	const handleVolumeBlur = (event: FocusEvent<HTMLDivElement>) => {
		if (containsRelatedTarget(event.currentTarget, event.relatedTarget)) return;
		if (!isHoverCapable) return;

		setIsVolumePanelOpen(false);
	};

	const handleSurfaceClick = () => {
		if (isHoverCapable) {
			void togglePlayback();
			return;
		}

		revealControls();
	};

	const handleMouseEnter = () => {
		if (!isHoverCapable) return;

		pointerInsideRef.current = true;
		revealControls();
	};

	const handleMouseMove = () => {
		if (!isHoverCapable) return;

		revealControls();
	};

	const handleMouseLeave = () => {
		if (!isHoverCapable) return;

		pointerInsideRef.current = false;
		hideControls();
		clearHideControlsTimer();
	};

	const handleControlsBlur = (event: FocusEvent<HTMLDivElement>) => {
		if (containsRelatedTarget(event.currentTarget, event.relatedTarget)) return;

		if (pointerInsideRef.current) {
			revealControls();
			return;
		}

		clearHideControlsTimer();
		hideControls();
	};

	const openVolumePanel = () => {
		setIsVolumePanelOpen(true);
		revealControls();
	};

	const closeVolumePanel = () => {
		setIsVolumePanelOpen(false);
	};

	const progress = resolveMediaProgress(currentTime, duration);

	return {
		videoRef,
		containerRef,
		controlsRef,
		isPlaying,
		isMuted,
		currentTime,
		duration,
		volume,
		isFullscreen,
		showControls,
		isHoverCapable,
		isVolumePanelOpen,
		progress,
		revealControls,
		togglePlayback,
		handleSeek,
		handleVolumeChange,
		toggleMuted,
		toggleFullscreen,
		handleVolumeBlur,
		handleSurfaceClick,
		handleMouseEnter,
		handleMouseMove,
		handleMouseLeave,
		handleControlsBlur,
		openVolumePanel,
		closeVolumePanel,
	};
}

export type VideoPlayerController = ReturnType<typeof useVideoPlayer>;
