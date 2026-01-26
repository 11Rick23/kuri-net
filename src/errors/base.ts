export class KuriNetError extends Error {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "KuriNetError";

		Error.captureStackTrace?.(this, this.constructor);
	}
}

export class InvalidInputError extends KuriNetError {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "InvalidInputError";
	}
}
