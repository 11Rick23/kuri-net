export default function NotFound() {
	return (
		<div className="flex items-center justify-center w-screen h-screen flex-col gap-10">
			<h1
				className="
                absolute
                text-[clamp(0rem,40vw,40rem)]
                font-bold blur-sm
                text-ctp-lavender/10
                select-none pointer-events-none
                "
			>
				404
			</h1>
			<p className="text-[clamp(24px,8vw,80px)]">Page Not Found</p>
			<p className="text-[clamp(12px,2vw,40px)]">
				ページが見つかりませんでした。
			</p>
		</div>
	);
}
