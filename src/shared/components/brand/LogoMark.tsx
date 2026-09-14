export default function LogoMark({
	className,
	id,
	variant = "outline",
}: {
	className?: string;
	id?: string;
	variant?: "outline" | "color";
}) {
	// 両方のSVGの合成条件を揃え、切り替え時の細線の描画差を防ぐ。
	return (
		<svg
			id={id}
			className={className}
			style={{ transform: "translateZ(0)" }}
			viewBox="0 0 100 100"
			fill={variant === "color" ? "var(--site-accent)" : "none"}
			stroke={variant === "color" ? "#000000" : "currentColor"}
			strokeWidth={variant === "color" ? "1.5" : "3"}
			aria-hidden="true"
			focusable="false"
		>
			{/* public/logo-outline.svg と同じ形状をヘッダーと導入演出で共有する。 */}
			<path d="M18 18H34V82H18Z" pathLength="1" />
			<path
				d="M42 43L66 18H86L55 50L86 82H65L42 57Z"
				pathLength="1"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
