export class KuriNetError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = "KuriNetError";

        Error.captureStackTrace?.(this, this.constructor);
	}
}