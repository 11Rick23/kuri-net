export type AuthenticatedUserState = {
	status: "REGISTERING" | "ACTIVE" | "SUSPENDED";
	isAnonymous: boolean;
	profileCompleted: boolean;
};

export function isAuthenticatedUserState(
	user: AuthenticatedUserState | undefined,
): boolean {
	return Boolean(
		user &&
			user.status === "ACTIVE" &&
			!user.isAnonymous &&
			user.profileCompleted,
	);
}

export function hasRequiredUserVerification(
	userVerified: boolean | undefined,
): boolean {
	return userVerified === true;
}
