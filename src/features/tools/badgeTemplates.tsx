import { MdLaptopMac, MdOutlineShield } from "react-icons/md";
import { TbServer } from "react-icons/tb";

export type ToolBadgeKind = "local" | "database" | "requiresAuth";

export type ToolBadgeDefinition = {
	kind: ToolBadgeKind;
	description: string;
};

type ToolBadgeTemplate = {
	icon: React.ReactNode;
	ariaLabel: string;
	triggerToneClassName: string;
	contentToneClassName?: string;
};

export const toolBadgeTemplates: Record<ToolBadgeKind, ToolBadgeTemplate> = {
	local: {
		icon: <MdLaptopMac size={18} />,
		ariaLabel: "ローカル動作について表示",
		triggerToneClassName:
			"bg-ctp-peach/18 text-ctp-peach ring-1 ring-ctp-peach/35",
	},
	database: {
		icon: <TbServer size={18} />,
		ariaLabel: "データベース利用について表示",
		triggerToneClassName: "bg-ctp-sky/18 text-ctp-sky ring-1 ring-ctp-sky/35",
	},
	requiresAuth: {
		icon: <MdOutlineShield size={18} />,
		ariaLabel: "認証要件について表示",
		triggerToneClassName:
			"bg-ctp-yellow/18 text-ctp-yellow ring-1 ring-ctp-yellow/35",
	},
};
