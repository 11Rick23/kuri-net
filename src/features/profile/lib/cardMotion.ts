export function dragAngle(distance: number, size: number, origin: number) {
	if (size <= 0) return origin;
	const travel = distance / size;
	return origin + travel * 180;
}

function nearestFront(angle: number) {
	return ((((angle + 180) % 360) + 360) % 360) - 180;
}

type Tilt = { x: number; y: number };

export function createCardMotion() {
	let angle: Tilt = { x: 0, y: 0 };
	let target: Tilt = { x: 0, y: 0 };
	let velocity: Tilt | null = null;
	let settling = false;
	let samples: { time: number; angle: Tilt }[] = [];

	function returnToFront() {
		angle = { x: nearestFront(angle.x), y: nearestFront(angle.y) };
		target = { x: 0, y: 0 };
	}
	let drag: {
		id: number;
		x: number;
		y: number;
		width: number;
		height: number;
		origin: Tilt;
	} | null = null;

	return {
		get angle() {
			return angle;
		},
		get settling() {
			return settling;
		},
		get pointerId() {
			return drag?.id;
		},
		hover(x: number, y: number) {
			if (!drag && !settling) target = { x, y };
		},
		start(
			id: number,
			x: number,
			y: number,
			width: number,
			height: number,
			time = 0,
		) {
			if (drag) return false;
			velocity = null;
			settling = false;
			samples = [{ time, angle: { ...angle } }];
			drag = { id, x, y, width, height, origin: { ...angle } };
			target = { ...angle };
			return true;
		},
		move(id: number, x: number, y: number, time = 0) {
			if (!drag || drag.id !== id) return;
			target = {
				x: dragAngle(drag.y - y, drag.height, drag.origin.x),
				y: dragAngle(x - drag.x, drag.width, drag.origin.y),
			};
			samples = samples.filter((sample) => time - sample.time <= 80);
			samples.push({ time, angle: { ...target } });
		},
		release(time: number) {
			if (!drag) return;
			drag = null;
			settling = true;
			const first = samples[0];
			const last = samples.at(-1);
			if (first && last && last.time > first.time && time - last.time < 80) {
				const duration = Math.max(8, time - first.time);
				velocity = {
					x: Math.max(
						-2.4,
						Math.min(2.4, (last.angle.x - first.angle.x) / duration),
					),
					y: Math.max(
						-2.4,
						Math.min(2.4, (last.angle.y - first.angle.y) / duration),
					),
				};
			}
			if (!velocity || Math.hypot(velocity.x, velocity.y) < 0.06) {
				velocity = null;
				returnToFront();
			}
			samples = [];
		},
		reset(immediate = false) {
			drag = null;
			velocity = null;
			settling = false;
			samples = [];
			target = { x: 0, y: 0 };
			// 同じ見た目の角度へ正規化し、回した周数を巻き戻さず表面へ戻す。
			angle = immediate
				? { ...target }
				: { x: nearestFront(angle.x), y: nearestFront(angle.y) };
		},
		advance(elapsed: number) {
			if (velocity) {
				const decay = Math.exp(-Math.max(0, elapsed) / 260);
				angle = {
					x: angle.x + velocity.x * 260 * (1 - decay),
					y: angle.y + velocity.y * 260 * (1 - decay),
				};
				velocity = { x: velocity.x * decay, y: velocity.y * decay };
				if (Math.hypot(velocity.x, velocity.y) < 0.015) {
					velocity = null;
					returnToFront();
				}
				return true;
			}
			if (drag) angle = { ...target };
			else {
				const blend = 1 - Math.exp(-Math.max(0, elapsed) / 100);
				angle = {
					x: angle.x + (target.x - angle.x) * blend,
					y: angle.y + (target.y - angle.y) * blend,
				};
			}
			const moving =
				Math.abs(target.x - angle.x) + Math.abs(target.y - angle.y) > 0.01;
			if (!moving) {
				angle = { ...target };
				settling = false;
			}
			return moving;
		},
	};
}
