"use client";

import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";
import { useId } from "react";
import { GoMute, GoUnmute } from "react-icons/go";
import { IoPause, IoPlay, IoScan, IoScanOutline } from "react-icons/io5";
import type { VideoPlayerController } from "./useVideoPlayer";
import { formatMediaTime } from "./videoPlayerHelpers";

const sliderTrackClassName =
	"bg-ctp-surface2/90 accent-ctp-blue dark:bg-white/10";

function cx(...classNames: Array<string | false | null | undefined>) {
	return classNames.filter(Boolean).join(" ");
}

type VideoPlayerButtonProps = {
	ariaLabel: string;
	onClick: (event: MouseEvent<HTMLButtonElement>) => void;
	children: ReactNode;
	className?: string;
	onFocus?: () => void;
	tabIndex?: number;
};

export function VideoPlayerButton({
	ariaLabel,
	onClick,
	children,
	className,
	onFocus,
	tabIndex,
}: VideoPlayerButtonProps) {
	return (
		<button
			type="button"
			aria-label={ariaLabel}
			onClick={onClick}
			onFocus={onFocus}
			tabIndex={tabIndex}
			className={cx(
				"flex items-center justify-center rounded-full transition hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-blue focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-crust",
				className,
			)}
		>
			{children}
		</button>
	);
}

type VideoRangeInputProps = ComponentPropsWithoutRef<"input"> & {
	className?: string;
};

function VideoRangeInput({
	className,
	type = "range",
	...props
}: VideoRangeInputProps) {
	return (
		<input
			{...props}
			type={type}
			className={cx(
				"appearance-none rounded-full hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-app-accent",
				sliderTrackClassName,
				className,
			)}
		/>
	);
}

export default function VideoControls({
	title,
	controller,
}: {
	title: string;
	controller: VideoPlayerController;
}) {
	const seekID = useId();
	const volumeID = useId();
	const controlsTabIndex = controller.showControls ? 0 : -1;
	const shouldShowVolumeSlider =
		controller.isHoverCapable &&
		controller.showControls &&
		controller.isVolumePanelOpen;

	const stopPropagation = (event: MouseEvent<HTMLElement>) => {
		event.stopPropagation();
	};

	return (
		<div
			ref={controller.controlsRef}
			aria-hidden={!controller.showControls}
			className={cx(
				"absolute inset-x-0 bottom-0 z-20 p-3 transition duration-200 sm:p-4",
				controller.showControls
					? "pointer-events-auto opacity-100"
					: "pointer-events-none opacity-0",
			)}
			onFocusCapture={controller.revealControls}
			onBlurCapture={controller.handleControlsBlur}
		>
			<div className="rounded-lg border border-ctp-surface1 bg-ctp-crust px-3 py-3 sm:px-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<VideoPlayerButton
						ariaLabel={controller.isPlaying ? "動画を一時停止" : "動画を再生"}
						onClick={(event) => {
							stopPropagation(event);
							void controller.togglePlayback();
						}}
						tabIndex={controlsTabIndex}
						className="h-10 w-10 shrink-0 bg-ctp-blue text-lg text-ctp-base hover:brightness-105"
					>
						{controller.isPlaying ? (
							<IoPause />
						) : (
							<IoPlay className="translate-x-0.5" />
						)}
					</VideoPlayerButton>

					<div className="min-w-0 flex-1">
						<div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] font-semibold tracking-[0.16em] text-ctp-subtext0 sm:text-xs">
							<span className="truncate">{title}</span>
							<span className="shrink-0 tabular-nums text-ctp-subtext1">
								{formatMediaTime(controller.currentTime)} /{" "}
								{formatMediaTime(controller.duration)}
							</span>
						</div>

						<label htmlFor={seekID} className="sr-only">
							再生位置
						</label>
						<VideoRangeInput
							id={seekID}
							min={0}
							max={controller.progress.max}
							step={0.1}
							value={controller.progress.value}
							onClick={stopPropagation}
							onChange={(event) => controller.handleSeek(event.target.value)}
							tabIndex={controlsTabIndex}
							disabled={controller.progress.max <= 0}
							className="h-2 w-full disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>

					{controller.isHoverCapable ? (
						<>
							{/* biome-ignore lint/a11y/noStaticElementInteractions: 音量パネルは子要素のhoverとfocusに追従する */}
							<div
								className="flex shrink-0 items-center gap-2"
								onMouseEnter={controller.openVolumePanel}
								onMouseLeave={controller.closeVolumePanel}
								onFocus={controller.openVolumePanel}
								onBlur={controller.handleVolumeBlur}
							>
								<VideoPlayerButton
									ariaLabel={controller.isMuted ? "ミュート解除" : "ミュート"}
									onClick={(event) => {
										stopPropagation(event);
										controller.toggleMuted();
									}}
									tabIndex={controlsTabIndex}
									className="h-10 w-10 text-lg text-ctp-text hover:bg-white/8"
								>
									{controller.isMuted ? <GoMute /> : <GoUnmute />}
								</VideoPlayerButton>

								<div
									className={cx(
										"overflow-hidden transition-[width,opacity] duration-200",
										shouldShowVolumeSlider
											? "w-24 opacity-100 sm:w-28"
											: "w-0 opacity-0",
									)}
								>
									<label htmlFor={volumeID} className="sr-only">
										音量
									</label>
									<VideoRangeInput
										id={volumeID}
										min={0}
										max={1}
										step={0.01}
										value={controller.isMuted ? 0 : controller.volume}
										onClick={stopPropagation}
										onChange={(event) =>
											controller.handleVolumeChange(event.target.value)
										}
										tabIndex={shouldShowVolumeSlider ? controlsTabIndex : -1}
										className="h-2 w-24 sm:w-28"
									/>
								</div>
							</div>
						</>
					) : null}

					<VideoPlayerButton
						ariaLabel={
							controller.isFullscreen
								? "フルスクリーンを終了"
								: "フルスクリーン"
						}
						onClick={(event) => {
							stopPropagation(event);
							void controller.toggleFullscreen();
						}}
						tabIndex={controlsTabIndex}
						className="h-10 w-10 text-lg text-ctp-text hover:bg-white/8"
					>
						{controller.isFullscreen ? <IoScanOutline /> : <IoScan />}
					</VideoPlayerButton>
				</div>
			</div>
		</div>
	);
}
