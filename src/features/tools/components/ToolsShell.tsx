"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";
import { toolDefinitions } from "@/features/tools/toolDefinitions";

function NavLink({
	href,
	label,
	description,
	active,
	onClick,
}: {
	href: string;
	label: string;
	description?: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<Link
			href={href}
			onClick={onClick}
			className={[
				"block rounded-2xl border px-4 py-3 transition",
				active
					? "border-ctp-blue bg-ctp-blue/10"
					: "border-ctp-surface1 bg-ctp-mantle hover:border-ctp-overlay0",
			].join(" ")}
		>
			<div className="space-y-1">
				<p className="font-semibold text-ctp-text">{label}</p>
				{description && (
					<p className="text-sm leading-6 text-ctp-subtext1">{description}</p>
				)}
			</div>
		</Link>
	);
}

export default function ToolsShell({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (pathname) {
			setOpen(false);
		}
	}, [pathname]);

	return (
		<div className="min-h-screen">
			<button
				type="button"
				aria-label={open ? "サイドメニューを閉じる" : "サイドメニューを開く"}
				aria-expanded={open}
				onClick={() => setOpen((prev) => !prev)}
				className="
				fixed top-4 left-4 z-90 inline-flex h-11 w-11
				items-center justify-center rounded-full
				border border-ctp-surface1
				bg-ctp-base/95
				text-ctp-text
				backdrop-blur-md transition
				shadow-light dark:shadow-dark
				hover:bg-ctp-surface0 hover:cursor-pointer"
			>
				{open ? <FaXmark size={18} /> : <FaBars size={18} />}
			</button>

			{open && (
				<button
					type="button"
					aria-label="サイドメニューを閉じる"
					onClick={() => setOpen(false)}
					className="fixed inset-0 z-75 bg-ctp-crust/60 backdrop-blur-[1px]"
				/>
			)}

			<aside
				className={[
					"fixed inset-y-0 left-0 z-80 w-[min(20rem,86vw)] border-r border-ctp-surface1 bg-ctp-base px-4 pb-6 pt-20 shadow-light transition-transform duration-200 dark:shadow-dark",
					open ? "translate-x-0" : "-translate-x-full",
				].join(" ")}
			>
				<div className="space-y-2 px-1 pb-4">
					<p className="text-xs font-semibold uppercase tracking-[0.25em] text-ctp-subtext0">
						Tools
					</p>
					<h2 className="text-2xl font-bold text-ctp-text">ツールメニュー</h2>
					<p className="text-sm leading-6 text-ctp-subtext1">
						ここから各ツールへ移動できます。
					</p>
				</div>

				<nav className="space-y-3">
					{/* ツール一覧はナビゲーションバーに表示しなくていいかな */}
					{/* <NavLink
						href="/tools"
						label="ツール一覧"
						description="使えるツールを一覧で確認できます。"
						active={pathname === "/tools"}
						onClick={() => setOpen(false)}
					/> */}
					{toolDefinitions.map((tool) => (
						<NavLink
							key={tool.id}
							href={tool.href}
							label={tool.title}
							description={tool.description}
							active={pathname === tool.href}
							onClick={() => setOpen(false)}
						/>
					))}
				</nav>
			</aside>

			<div className="pt-20">{children}</div>
		</div>
	);
}
