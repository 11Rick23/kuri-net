"use client";

import type {
	ComponentPropsWithoutRef,
	FocusEvent,
	MouseEvent,
	ReactNode,
} from "react";
import { useEffect, useId, useRef, useState } from "react";
import { GoMute, GoUnmute } from "react-icons/go";
import { IoPause, IoPlay, IoScan, IoScanOutline } from "react-icons/io5";

const CONTROLS_IDLE_MS = 2200;
const SLIDER_TRACK_CLASS_NAME =
	"bg-ctp-surface2/90 dark:bg-white/10 accent-ctp-blue";

function cx(...classNames: Array<string | false | null | undefined>) {
	return classNames.filter(Boolean).join(" ");
}

function formatTime(value: number) {
	if (!Number.isFinite(value) || value < 0) return "0:00";

	const totalSeconds = Math.floor(value);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type VideoPlayerProps = {
	src: string;
	poster?: string;
	title: string;
	className?: string;
};

type PlayerIconButtonProps = {
	ariaLabel: string;
	onClick: (event: MouseEvent<HTMLButtonElement>) => void;
	children: ReactNode;
	className?: string;
};

function PlayerIconButton({
	ariaLabel,
	onClick,
	children,
	className,
}: PlayerIconButtonProps) {
	return (
		<button
			type="button"
			aria-label={ariaLabel}
			onClick={onClick}
			className={cx(
				"flex items-center justify-center rounded-full transition hover:cursor-pointer focus:outline-none",
				className,
			)}
		>
			{children}
		</button>
	);
}

type PlayerRangeInputProps = ComponentPropsWithoutRef<"input"> & {
	className?: string;
};

function PlayerRangeInput({
	className,
	type = "range",
	...props
}: PlayerRangeInputProps) {
	return (
		<input
			{...props}
			type={type}
			className={cx(
				"appearance-none rounded-full hover:cursor-pointer",
				SLIDER_TRACK_CLASS_NAME,
				className,
			)}
		/>
	);
}

export default function VideoPlayer({
	src,
	poster,
	title,
	className = "",
}: VideoPlayerProps) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const hideControlsTimeoutRef = useRef<number | null>(null);
	const pointerInsideRef = useRef(false);
	const hoverCapableRef = useRef(false);
	const seekId = useId();
	const volumeId = useId();
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
		if (typeof window === "undefined") return;

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
			setIsFullscreen(document.fullscreenElement === containerRef.current);
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

		return () => {
			video.removeEventListener("loadedmetadata", syncVideoState);
			video.removeEventListener("durationchange", syncVideoState);
			video.removeEventListener("timeupdate", syncVideoState);
			video.removeEventListener("play", syncVideoState);
			video.removeEventListener("pause", syncVideoState);
			video.removeEventListener("ended", syncVideoState);
			video.removeEventListener("volumechange", syncVideoState);
			document.removeEventListener("fullscreenchange", syncFullscreenState);
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

	const hideControls = () => {
		setShowControls(false);
		setIsVolumePanelOpen(false);
	};

	const scheduleHideControls = () => {
		clearHideControlsTimer();

		hideControlsTimeoutRef.current = window.setTimeout(() => {
			if (hoverCapableRef.current && !pointerInsideRef.current) return;
			hideControls();
		}, CONTROLS_IDLE_MS);
	};

	const revealControls = () => {
		setShowControls(true);
		scheduleHideControls();
	};

	const stopPropagation = (
		event: MouseEvent<HTMLElement> | FocusEvent<HTMLDivElement>,
	) => {
		event.stopPropagation();
	};

	const togglePlayback = async () => {
		const video = videoRef.current;
		if (!video) return;

		if (video.paused || video.ended) {
			await video.play();
		} else {
			video.pause();
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
		if (!container) return;

		if (document.fullscreenElement === container) {
			await document.exitFullscreen();
		} else {
			await container.requestFullscreen();
		}

		revealControls();
	};

	const handleVolumeBlur = (event: FocusEvent<HTMLDivElement>) => {
		if (event.currentTarget.contains(event.relatedTarget)) return;
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

	const progressMax = duration > 0 ? duration : 0;
	const progressValue = Math.min(currentTime, progressMax || 0);
	const shouldShowVolumeSlider =
		isHoverCapable && showControls && isVolumePanelOpen;

	return (
		<div className={cx("space-y-3", className)}>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: hover and pointer tracking are handled on the player surface container */}
			<div
				ref={containerRef}
				className={cx(
					"relative overflow-hidden border border-ctp-surface1 bg-ctp-crust shadow-[0_20px_50px_rgba(0,0,0,0.22)]",
					isFullscreen
						? "flex h-full w-full items-center justify-center rounded-none bg-black"
						: "rounded-[1.5rem]",
				)}
				onMouseEnter={handleMouseEnter}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
			>
				{/* biome-ignore lint/a11y/useMediaCaption: product demo clips in this shared player can be silent and intentionally omit subtitle tracks */}
				<video
					ref={videoRef}
					src={src}
					poster={poster}
					preload="metadata"
					playsInline
					className={cx(
						"relative bg-transparent object-contain",
						isFullscreen
							? "h-full max-h-full w-full max-w-full"
							: "aspect-video w-full",
					)}
					aria-label={title}
				/>

				<PlayerIconButton
					ariaLabel={
						isHoverCapable
							? `${title}を再生または一時停止`
							: `${title}の操作パネルを表示`
					}
					onClick={() => handleSurfaceClick()}
					className="absolute inset-0 z-10"
				>
					<span className="sr-only">{title}</span>
				</PlayerIconButton>

				{!isPlaying ? (
					<PlayerIconButton
						ariaLabel={`${title}を再生`}
						onClick={(event) => {
							stopPropagation(event);
							void togglePlayback();
						}}
						className="absolute left-1/2 top-1/2 z-20 h-18 w-18 -translate-x-1/2 -translate-y-1/2 border border-white/14 bg-ctp-base/88 text-3xl text-ctp-text shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm hover:scale-[1.03]"
					>
						<IoPlay className="translate-x-0.5" />
					</PlayerIconButton>
				) : null}

				<div
					className={cx(
						"absolute inset-x-0 bottom-0 z-20 p-3 transition duration-200 sm:p-4",
						showControls
							? "pointer-events-auto opacity-100"
							: "pointer-events-none opacity-0",
					)}
				>
					<div className="rounded-[1.25rem] border border-white/8 bg-ctp-crust/82 px-3 py-3 backdrop-blur-md sm:px-4">
						<div className="flex items-center gap-2 sm:gap-3">
							<PlayerIconButton
								ariaLabel={isPlaying ? "動画を一時停止" : "動画を再生"}
								onClick={(event) => {
									stopPropagation(event);
									void togglePlayback();
								}}
								className="h-10 w-10 shrink-0 bg-ctp-blue text-lg text-ctp-base hover:brightness-105 focus:ring-2 focus:ring-ctp-blue/60"
							>
								{isPlaying ? (
									<IoPause />
								) : (
									<IoPlay className="translate-x-0.5" />
								)}
							</PlayerIconButton>

							<div className="min-w-0 flex-1">
								<div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] font-semibold tracking-[0.16em] text-ctp-subtext0 sm:text-xs">
									<span className="truncate uppercase">{title}</span>
									<span className="shrink-0 tabular-nums text-ctp-subtext1">
										{formatTime(currentTime)} / {formatTime(duration)}
									</span>
								</div>

								<label htmlFor={seekId} className="sr-only">
									再生位置
								</label>
								<PlayerRangeInput
									id={seekId}
									min={0}
									max={progressMax}
									step={0.1}
									value={progressValue}
									onClick={stopPropagation}
									onChange={(event) => handleSeek(event.target.value)}
									disabled={progressMax <= 0}
									className="h-2 w-full disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>

							{isHoverCapable ? (
								<>
									{/* biome-ignore lint/a11y/noStaticElementInteractions: volume tray visibility is driven by hover and focus state on its container */}
									<div
										className="flex shrink-0 items-center gap-2"
										onMouseEnter={() => {
											setIsVolumePanelOpen(true);
											revealControls();
										}}
										onMouseLeave={() => {
											setIsVolumePanelOpen(false);
										}}
										onFocus={() => {
											setIsVolumePanelOpen(true);
											revealControls();
										}}
										onBlur={handleVolumeBlur}
									>
										<PlayerIconButton
											ariaLabel={isMuted ? "ミュート解除" : "ミュート"}
											onClick={(event) => {
												stopPropagation(event);
												toggleMuted();
											}}
											className="h-10 w-10 text-lg text-ctp-text hover:bg-white/8 focus:ring-2 focus:ring-ctp-blue/45"
										>
											{isMuted ? <GoMute /> : <GoUnmute />}
										</PlayerIconButton>

										<div
											className={cx(
												"overflow-hidden transition-[width,opacity] duration-200",
												shouldShowVolumeSlider
													? "w-24 opacity-100 sm:w-28"
													: "w-0 opacity-0",
											)}
										>
											<label htmlFor={volumeId} className="sr-only">
												音量
											</label>
											<PlayerRangeInput
												id={volumeId}
												min={0}
												max={1}
												step={0.01}
												value={isMuted ? 0 : volume}
												onClick={stopPropagation}
												onChange={(event) =>
													handleVolumeChange(event.target.value)
												}
												className="h-2 w-24 sm:w-28"
											/>
										</div>
									</div>
								</>
							) : null}

							<PlayerIconButton
								ariaLabel={
									isFullscreen ? "フルスクリーンを終了" : "フルスクリーン"
								}
								onClick={(event) => {
									stopPropagation(event);
									void toggleFullscreen();
								}}
								className="h-10 w-10 text-lg text-ctp-text hover:bg-white/8 focus:ring-2 focus:ring-ctp-blue/45"
							>
								{isFullscreen ? <IoScanOutline /> : <IoScan />}
							</PlayerIconButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
