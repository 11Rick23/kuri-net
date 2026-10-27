import { profileBirthday } from "../data/profileData";

export function getProfileAge(now: Date): number {
	const japanDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
	const year = japanDate.getUTCFullYear();
	const month = japanDate.getUTCMonth() + 1;
	const day = japanDate.getUTCDate();
	const birthdayPassed =
		month > profileBirthday.month ||
		(month === profileBirthday.month && day >= profileBirthday.day);
	return year - profileBirthday.year - (birthdayPassed ? 0 : 1);
}
