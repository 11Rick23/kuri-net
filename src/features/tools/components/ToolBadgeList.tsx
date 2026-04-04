"use client";

import {
	type ToolBadgeDefinition,
	toolBadgeTemplates,
} from "@/features/tools/badgeTemplates";
import ToolBadge from "@/features/tools/components/ToolBadge";

export default function ToolBadgeList({
	badges,
}: {
	badges: ToolBadgeDefinition[];
}) {
	if (badges.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap items-start justify-start gap-2 sm:justify-end">
			{badges.map((badge) => {
				const template = toolBadgeTemplates[badge.kind];

				return (
					<ToolBadge
						key={`${badge.kind}-${badge.description}`}
						icon={template.icon}
						ariaLabel={template.ariaLabel}
						triggerToneClassName={template.triggerToneClassName}
						contentToneClassName={template.contentToneClassName}
						triggerClassName="h-9 w-9"
						wrapperClassName="items-start sm:items-end"
					>
						{badge.description}
					</ToolBadge>
				);
			})}
		</div>
	);
}
