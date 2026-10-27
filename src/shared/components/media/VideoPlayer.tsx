"use client";

import { IoPlay } from "react-icons/io5";
import { useVideoPlayer } from "./useVideoPlayer";
import VideoControls, { VideoPlayerButton } from "./VideoControls";

function cx(...classNames: Array<string | false | null | undefined>) {
	return classNames.filter(Boolean).join(" ");
}

type VideoPlayerProps = {
	src: string;
	poster?: string;
	title: string;
	className?: string;
};

export default function VideoPlayer({
	src,
	poster,
	title,
	className = "",
}: VideoPlayerProps) {
	const controller = useVideoPlayer();

	return (
		<div className={cx("space-y-3", className)}>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: hoverとpointerの状態を動画プレイヤー全体で追跡する */}
			<div
				ref={controller.containerRef}
				className={cx(
					"relative overflow-hidden border border-ctp-surface1 bg-ctp-crust",
					controller.isFullscreen
						? "flex h-full w-full items-center justify-center rounded-none bg-black"
						: "rounded-lg",
				)}
				onMouseEnter={controller.handleMouseEnter}
				onMouseMove={controller.handleMouseMove}
				onMouseLeave={controller.handleMouseLeave}
			>
				{/* biome-ignore lint/a11y/useMediaCaption: 字幕トラックの有無は各コンテンツの要件で決定する */}
				<video
					ref={controller.videoRef}
					src={src}
					poster={poster}
					preload="metadata"
					playsInline
					className={cx(
						"relative bg-transparent object-contain",
						controller.isFullscreen
							? "h-full max-h-full w-full max-w-full"
							: "aspect-video w-full",
					)}
					aria-label={title}
				/>

				<VideoPlayerButton
					ariaLabel={
						controller.isHoverCapable
							? `${title}を再生または一時停止`
							: `${title}の操作パネルを表示`
					}
					onClick={controller.handleSurfaceClick}
					onFocus={controller.revealControls}
					className="absolute inset-0 z-10 rounded-none ring-inset focus-visible:ring-offset-0"
				>
					<span className="sr-only">{title}</span>
				</VideoPlayerButton>

				{!controller.isPlaying ? (
					<VideoPlayerButton
						ariaLabel={`${title}を再生`}
						onClick={(event) => {
							event.stopPropagation();
							void controller.togglePlayback();
						}}
						className="absolute left-1/2 top-1/2 z-20 h-18 w-18 -translate-x-1/2 -translate-y-1/2 border border-white/14 bg-ctp-base/88 text-3xl text-ctp-text backdrop-blur-sm hover:bg-ctp-surface0"
					>
						<IoPlay className="translate-x-0.5" />
					</VideoPlayerButton>
				) : null}

				<VideoControls title={title} controller={controller} />
			</div>
		</div>
	);
}
