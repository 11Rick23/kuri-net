import type { ProfileObjectKind } from "../data/profileStory";
import styles from "./ProfileStory.module.css";

export default function ProfileObject({ kind }: { kind: ProfileObjectKind }) {
	return (
		<svg viewBox="0 0 200 180" fill="none" aria-hidden="true">
			{kind === "macbook" && (
				<>
					<g className={styles.laptopScreen}>
						<rect
							x="24"
							y="28"
							width="152"
							height="106"
							rx="6"
							fill="var(--site-surface-strong)"
							stroke="currentColor"
							strokeWidth="2"
						/>
						<rect
							x="32"
							y="37"
							width="136"
							height="87"
							rx="1"
							fill="var(--site-surface)"
							stroke="currentColor"
						/>
						<circle cx="100" cy="32" r="1.5" fill="currentColor" />
						<rect
							x="45"
							y="52"
							width="79"
							height="56"
							rx="3"
							fill="var(--site-accent)"
							stroke="currentColor"
							strokeWidth="1.5"
						/>
						<path d="M45 64h79" stroke="var(--site-on-accent)" />
						<path
							d="M53 58h3m4 0h3m4 0h3"
							stroke="var(--site-on-accent)"
							strokeLinecap="round"
						/>
						<path
							d="M61 76h12l4 5h25v16H61Z"
							stroke="var(--site-on-accent)"
							strokeWidth="1.5"
						/>
						<path
							d="M138 53h9l3 4h10v14h-22Z"
							fill="var(--site-surface-muted)"
							stroke="currentColor"
						/>
					</g>
					<path
						d="m24 135-15 12v5c0 4 5 6 10 6h162c5 0 10-2 10-6v-5l-15-12Z"
						fill="var(--site-surface-strong)"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinejoin="round"
					/>
					<path d="M10 148h180m-109-1 3 5h32l3-5" stroke="currentColor" />
				</>
			)}
			{kind === "ski" && (
				<>
					<path
						d="m9 114 29-36 28 28 25-17 36 39 32-27 32 30M7 158h186"
						stroke="var(--site-control-line)"
						strokeWidth="1.5"
					/>
					<g className={styles.skiPair} stroke="currentColor" strokeWidth="2">
						<g transform="rotate(-16 94 92)">
							<path
								d="M82 152V29c0-17 14-17 14 0v123c0 10-14 10-14 0Z"
								fill="var(--site-accent)"
							/>
							<path d="M84 41h10m-10 7h10M85 87h8v22h-8Z" />
						</g>
						<g transform="rotate(14 119 92)">
							<path
								d="M112 152V29c0-17 14-17 14 0v123c0 10-14 10-14 0Z"
								fill="var(--site-surface)"
							/>
							<path d="M114 41h10m-10 7h10M115 87h8v22h-8Z" />
						</g>
					</g>
					<path
						d="m51 60-14 94m8-3-16-2m25-89-6-1M158 53l14 101m-8-3 16-2m-25-96 6-1"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
					/>
				</>
			)}
			{kind === "notebook" && (
				<g transform="rotate(-6 100 90)">
					<path
						d="M39 29h117v128H44c-7 0-10-4-10-10V39c0-7 2-10 5-10Z"
						fill="var(--site-surface-strong)"
						stroke="currentColor"
						strokeWidth="2"
					/>
					<path
						d="M44 22h112v125H44c-6 0-10 3-10 8V32c0-7 4-10 10-10Z"
						fill="var(--site-surface)"
						stroke="currentColor"
						strokeWidth="2"
					/>
					<path d="M49 23v123M44 151h106" stroke="currentColor" />
					<path
						d="M129 22v41l-9-7-9 7V22"
						fill="var(--site-accent)"
						stroke="currentColor"
					/>
					<g
						className={styles.notebookDiagram}
						stroke="currentColor"
						strokeWidth="1.5"
					>
						<path d="m73 78 49 9-33 32Z" />
						<circle cx="73" cy="78" r="8" fill="var(--site-surface)" />
						<circle cx="122" cy="87" r="8" fill="var(--site-accent)" />
						<circle cx="89" cy="119" r="8" fill="var(--site-surface)" />
					</g>
					<path
						d="m174 64-6 60-4 10-2-11 6-60Z"
						fill="var(--site-surface-strong)"
						stroke="currentColor"
						strokeWidth="1.5"
					/>
				</g>
			)}
		</svg>
	);
}
