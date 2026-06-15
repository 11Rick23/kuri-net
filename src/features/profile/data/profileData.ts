import type { IconType } from "react-icons";
import { MdCake, MdLocationOn, MdSchool } from "react-icons/md";
import { resolveAssetUrl } from "@/shared/utils/resolveAssetUrl";

export type ProfileDetail = {
	label: string;
	value: string;
	icon: IconType;
};

export const profileTags = [
	"セキュリティ",
	"ウェブ開発",
	"認証・認可",
	"Python",
	"TypeScript",
];

export const profileLogo = {
	light: resolveAssetUrl("profile/logo-white.webp"),
	dark: resolveAssetUrl("profile/logo-dark.webp"),
	alt: "kuri-kuri logo",
};

export const profileDetails: ProfileDetail[] = [
	{
		label: "所属",
		value: "慶應義塾大学",
		icon: MdSchool,
	},
	{
		label: "居住地",
		value: "東京都",
		icon: MdLocationOn,
	},
	{
		label: "誕生日",
		value: "11月23日",
		icon: MdCake,
	},
];

export const profileGitHub = {
	href: "https://github.com/11Rick23",
	display: "GitHub",
};

export const profileEmail = {
	href: "mailto:contact@kuri-kuri.net",
	display: "メール",
};
