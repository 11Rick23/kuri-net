export type WorkSection = {
	id: string;
	heading: string;
	paragraphs: string[];
	media?: WorkSectionMedia[];
};

export type WorkSectionMedia = WorkSectionVideoMedia | WorkSectionPdfMedia;

export type WorkSectionMediaPlacement = "before" | "after";

export type WorkSectionVideoMedia = {
	type: "video";
	title: string;
	assetKey: string;
	placement: WorkSectionMediaPlacement;
	caption?: string;
	posterAssetKey?: string;
};

export type WorkSectionPdfMedia = {
	type: "pdf";
	title: string;
	assetKey: string;
	placement: WorkSectionMediaPlacement;
	caption?: string;
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
