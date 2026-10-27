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
import styles from "../Tools.module.css";

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
			className={styles.navLink}
		>
			<div>
				<p className={styles.navLabel}>{label}</p>
				{description && <p className={styles.navDescription}>{description}</p>}
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
		<div className={styles.shell}>
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
					styles.menuButton,
					open ? styles.menuButtonHidden : "",
				].join(" ")}
			>
				<FaBars size={18} aria-hidden="true" />
			</button>

			{open && (
				<div
					aria-hidden="true"
					onClick={closeMenu}
					className={styles.backdrop}
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
				className={[styles.drawer, open ? styles.drawerOpen : ""].join(" ")}
			>
				<button
					data-menu-close
					type="button"
					aria-label="サイドメニューを閉じる"
					onClick={closeMenu}
					className={styles.closeButton}
				>
					<FaXmark size={18} aria-hidden="true" />
				</button>

				<div className={styles.drawerHeader}>
					<h2>アプリメニュー</h2>
					<p>ここから各アプリへ移動できます。</p>
				</div>

				<nav className={styles.drawerNav}>
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

			{children}
		</div>
	);
}
