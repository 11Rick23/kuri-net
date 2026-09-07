import { db } from "@/database";
import { createAuthRepository } from "@/features/auth/data/repositoryCore";

export type {
	PasskeyAuthenticationSyncResult,
	RegistrationCompletionResult,
} from "@/features/auth/data/repositoryCore";

export const {
	cleanupRegisteringUser,
	completeRegisteringUser,
	getAuthUserStateByID,
	synchronizePasskeyOwnerAfterAuthentication,
	updateRegisteringDisplayName,
} = createAuthRepository(db);
