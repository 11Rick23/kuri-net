export function createCardCorners() {
	// SSR とブラウザ間の三角関数の微小差を style 属性へ持ち込まない。
	return [
		{ x: "calc(100% - 16px)", y: "16px", angle: -90 },
		{ x: "calc(100% - 16px)", y: "calc(100% - 16px)", angle: 0 },
		{ x: "16px", y: "calc(100% - 16px)", angle: 90 },
		{ x: "16px", y: "16px", angle: 180 },
	].flatMap((corner) =>
		Array.from({ length: 8 }, (_, index) => {
			const angle = corner.angle + ((index + 0.5) * 90) / 8;
			const radians = (angle * Math.PI) / 180;
			const radius = 16 * Math.cos(Math.PI / 32);
			return {
				id: `${corner.angle}-${index}`,
				left: `calc(${corner.x} + ${(radius * Math.cos(radians)).toFixed(3)}px)`,
				top: `calc(${corner.y} + ${(radius * Math.sin(radians)).toFixed(3)}px)`,
				transform: `translate(-50%, -50%) translateZ(calc(var(--card-depth) / -2)) rotateZ(${angle + 90}deg) rotateX(90deg)`,
			};
		}),
	);
}
