export default function ProfileCard() {
	return (
		<section className="flex min-h-screen items-center justify-center px-6 pt-24 pb-10">
			<div className="w-full max-w-2xl rounded-3xl border border-ctp-surface1 bg-ctp-base/90 px-8 py-12 text-center shadow-light backdrop-blur-sm dark:shadow-dark">
				<p className="mb-4 text-sm font-bold tracking-[0.3em] text-ctp-sapphire uppercase">
					About
				</p>
				<h1 className="text-4xl font-black text-ctp-text sm:text-5xl">
					現在製作中
				</h1>
				<p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-ctp-subtext1 sm:text-base">
					このページは現在準備中です。
					<br />
					公開までしばらくお待ちください。
				</p>
			</div>
		</section>
	);
}
