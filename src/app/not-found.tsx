import type { Metadata } from "next";
import Link from "next/link";
import FullscreenMessage from "@/shared/components/layout/FullscreenMessage";

export const metadata: Metadata = {
	title: "404",
};

export default function NotFound() {
	return (
		<main>
			<FullscreenMessage
				backgroundLabel="404"
				title="Page Not Found"
				description="ページが見つかりませんでした。"
				actions={
					<Link
						href="/"
						className="rounded-md border border-ctp-blue bg-ctp-blue px-5 py-2 text-sm font-semibold text-ctp-crust transition duration-200 hover:bg-ctp-sapphire active:scale-[0.98]"
					>
						トップページへ戻る
					</Link>
				}
			/>
		</main>
	);
}
