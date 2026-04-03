import { KuriNetError } from "./base";

export class DatabaseError extends KuriNetError {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "DatabaseError";
	}
}

export class QueryNotFoundError extends DatabaseError {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "QueryNotFoundError";
	}
}
