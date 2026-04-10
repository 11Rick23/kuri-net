export type WorkSection = {
	heading: string;
	paragraphs: string[];
	media?: WorkSectionMedia[];
};

export type WorkSectionMedia = WorkSectionVideoMedia;

export type WorkSectionVideoMedia = {
	type: "video";
	title: string;
	assetKey: string;
	placement: "before" | "after";
	caption?: string;
	posterAssetKey?: string;
};

export type WorkLink = {
	label: string;
	href: string;
};

export type WorkEntry = {
	title: string;
	summary: string;
	coverImageAssetKey?: string;
	coverAlt?: string;
	stack: string[];
	lead: string;
	sections: WorkSection[];
	period?: string;
	role?: string;
	teamSize?: string;
	links?: WorkLink[];
};
