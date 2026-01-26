"use client";

import { useEffect, useState } from "react";

type Props = {
	locale?: string;
	timeZone?: string;
};

export default function LiveClock({
	locale = "ja-JP",
	timeZone = "Asia/Tokyo",
}: Props) {
	const [now, setNow] = useState<Date | null>(null);

	useEffect(() => {
		// 初回描画(SSR)との差分を避けるため、クライアントで初期化
		setNow(new Date());

		const id = window.setInterval(() => {
			setNow(new Date());
		}, 1000);

		return () => window.clearInterval(id);
	}, []);

	if (!now) return null;

	return (
		<span>
			{now.toLocaleString(locale, {
				timeZone,
				year: "numeric",
				month: "long",
				day: "numeric",
				weekday: "short",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			})}
		</span>
	);
}