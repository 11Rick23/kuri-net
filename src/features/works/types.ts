export type WorkSection = {
	heading: string;
	paragraphs: string[];
};

export type WorkLink = {
	label: string;
	href: string;
};

export type WorkEntry = {
	slug: string;
	title: string;
	summary: string;
	coverImage: string;
	coverAlt: string;
	stack: string[];
	appealTags: string[];
	lead: string;
	sections: WorkSection[];
	period?: string;
	role?: string;
	teamSize?: string;
	links?: WorkLink[];
};
