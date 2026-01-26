import { KuriNetError } from "./base";

export class AuthenticationError extends KuriNetError {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "AuthenticationError";
	}
}

export class ExpiredSessionError extends AuthenticationError {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "ExpiredSessionError";
	}
}

export class ExpiredChallengeError extends AuthenticationError {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = "ExpiredChallengeError";
	}
}
