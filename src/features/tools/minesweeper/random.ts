export class SeededRandom {
	private state: number;

	constructor(seed: string) {
		this.state = hashSeed(seed);
	}

	next() {
		this.state += 0x6d2b79f5;
		let value = this.state;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	}

	int(min: number, max: number) {
		return min + Math.floor(this.next() * (max - min));
	}

	shuffle<T>(values: T[]) {
		const result = [...values];
		for (let index = result.length - 1; index > 0; index -= 1) {
			const nextIndex = this.int(0, index + 1);
			[result[index], result[nextIndex]] = [result[nextIndex], result[index]];
		}
		return result;
	}
}

function hashSeed(seed: string) {
	let hash = 2166136261;
	for (let index = 0; index < seed.length; index += 1) {
		hash ^= seed.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	hash ^= hash >>> 16;
	hash = Math.imul(hash, 2246822507);
	hash ^= hash >>> 13;
	hash = Math.imul(hash, 3266489909);
	hash ^= hash >>> 16;
	return hash >>> 0 || 0x6d2b79f5;
}

export function createRandomSeed() {
	if (globalThis.crypto?.getRandomValues) {
		const values = new Uint32Array(3);
		globalThis.crypto.getRandomValues(values);
		return [...values]
			.map((value) => value.toString(16).padStart(8, "0"))
			.join("");
	}
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
