export function getProfileAge(now: Date): number {
	const japanDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
	const year = japanDate.getUTCFullYear();
	const month = japanDate.getUTCMonth() + 1;
	const day = japanDate.getUTCDate();
	const birthdayPassed = month > 11 || (month === 11 && day >= 23);
	return year - 2005 - (birthdayPassed ? 0 : 1);
}
