export function dragAngle(distance: number, size: number, origin: number) {
	if (size <= 0) return origin;
	const travel = distance / size;
	const rotation = travel * 48 + Math.sign(travel) * travel ** 2 * 140;
	return Math.max(-105, Math.min(105, origin + rotation));
}
