"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";
import { toolDefinitions } from "@/features/tools/toolDefinitions";
import {
	decideDialogKeyboardAction,
	lockBodyScroll,
	resolveFocusReturnTarget,
} from "@/shared/components/modal/dialogAccessibility";

const menuID = "tools-navigation-menu";

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
			aria-current={active ? "page" : undefined}
			className={[
				"block rounded-lg border px-4 py-3 transition",
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
	const menuButtonRef = useRef<HTMLButtonElement | null>(null);
	const menuRef = useRef<HTMLElement | null>(null);
	const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
	const [open, setOpen] = useState(false);

	const closeMenu = useCallback(() => {
		setOpen(false);
	}, []);

	useEffect(() => {
		if (pathname) {
			closeMenu();
		}
	}, [pathname, closeMenu]);

	useEffect(() => {
		if (!open) return;

		const unlockBodyScroll = lockBodyScroll(document.body.style);

		const focusFrame = window.requestAnimationFrame(() => {
			menuRef.current
				?.querySelector<HTMLButtonElement>("[data-menu-close]")
				?.focus();
		});

		const onKeyDown = (event: KeyboardEvent) => {
			const menu = menuRef.current;
			if (!menu) return;

			const focusableElements = Array.from(
				menu.querySelectorAll<HTMLElement>(
					"a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
				),
			);
			const firstElement = focusableElements[0];
			const lastElement = focusableElements.at(-1);
			const activeElement = document.activeElement;
			const activePosition =
				activeElement === firstElement && firstElement === lastElement
					? "only"
					: activeElement === menu
						? "container"
						: activeElement === firstElement
							? "first"
							: activeElement === lastElement
								? "last"
								: menu.contains(activeElement)
									? "inside"
									: "outside";
			const action = decideDialogKeyboardAction({
				key: event.key,
				shiftKey: event.shiftKey,
				closeOnEscape: true,
				focusableCount: focusableElements.length,
				activePosition,
			});

			if (action === "none") return;

			event.preventDefault();
			if (action === "close") {
				closeMenu();
			} else if (action === "focus-container") {
				menu.focus();
			} else if (action === "focus-first") {
				firstElement?.focus();
			} else {
				lastElement?.focus();
			}
		};

		document.addEventListener("keydown", onKeyDown);

		return () => {
			window.cancelAnimationFrame(focusFrame);
			document.removeEventListener("keydown", onKeyDown);
			unlockBodyScroll();

			const previouslyFocusedElement = previouslyFocusedElementRef.current;
			previouslyFocusedElementRef.current = null;
			window.requestAnimationFrame(() => {
				resolveFocusReturnTarget(
					previouslyFocusedElement,
					() => menuButtonRef.current,
				)?.focus();
			});
		};
	}, [open, closeMenu]);

	return (
		<div className="min-h-screen">
			<button
				ref={menuButtonRef}
				type="button"
				aria-label="サイドメニューを開く"
				aria-controls={menuID}
				aria-expanded={open}
				aria-hidden={open}
				inert={open}
				onClick={() => {
					if (document.activeElement instanceof HTMLElement) {
						previouslyFocusedElementRef.current = document.activeElement;
					}
					setOpen(true);
				}}
				className={[
					"fixed top-4 left-4 z-90 inline-flex h-11 w-11 items-center justify-center rounded-full border border-ctp-surface1 bg-ctp-base/95 text-ctp-text backdrop-blur-md transition hover:cursor-pointer hover:bg-ctp-surface0",
					open ? "pointer-events-none opacity-0" : "opacity-100",
				].join(" ")}
			>
				<FaBars size={18} />
			</button>

			{open && (
				<div
					aria-hidden="true"
					onClick={closeMenu}
					className="fixed inset-0 z-75 bg-ctp-crust/60 backdrop-blur-[1px]"
				/>
			)}

			<aside
				ref={menuRef}
				tabIndex={-1}
				id={menuID}
				role="dialog"
				aria-label="アプリメニュー"
				aria-modal={open ? true : undefined}
				aria-hidden={!open}
				inert={!open}
				className={[
					"fixed inset-y-0 left-0 z-80 w-[min(20rem,86vw)] border-r border-ctp-surface1 bg-ctp-base px-4 pb-6 pt-20 transition-transform duration-200",
					open ? "translate-x-0" : "-translate-x-full",
				].join(" ")}
			>
				<button
					data-menu-close
					type="button"
					aria-label="サイドメニューを閉じる"
					onClick={closeMenu}
					className="absolute top-4 left-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-ctp-surface1 bg-ctp-base/95 text-ctp-text transition hover:cursor-pointer hover:bg-ctp-surface0"
				>
					<FaXmark size={18} />
				</button>

				<div className="space-y-2 px-1 pb-4">
					<h2 className="text-2xl font-bold text-ctp-text">アプリメニュー</h2>
					<p className="text-sm leading-6 text-ctp-subtext1">
						ここから各アプリへ移動できます。
					</p>
				</div>

				<nav className="space-y-3">
					{toolDefinitions.map((tool) => (
						<NavLink
							key={tool.id}
							href={tool.href}
							label={tool.title}
							description={tool.description}
							active={pathname === tool.href}
							onClick={closeMenu}
						/>
					))}
				</nav>
			</aside>

			<div className="pt-20">{children}</div>
		</div>
	);
}
