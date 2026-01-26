import { KuriNetError } from "./base";

export class DatabaseError extends KuriNetError {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "DatabaseError";
	}
}