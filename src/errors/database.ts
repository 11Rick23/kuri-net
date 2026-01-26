import { KuriNetError } from "./base";

export class DatabaseError extends KuriNetError {
	constructor(message?: string) {
		super(message);
		this.name = "DatabaseError";
	}
}