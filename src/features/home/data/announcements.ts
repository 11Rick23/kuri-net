export type Announcement = {
	date: string;
	title: string;
	paragraphs: string[];
};

export function parseAnnouncements(markdown: string): Announcement[] {
	return markdown
		.replace(/\r\n/g, "\n")
		.split(/^## /m)
		.slice(1)
		.map((section) => {
			const [heading, ...lines] = section.split("\n");
			const match = /^(\d{4}-\d{2}-\d{2}) (\S.*)$/.exec(heading.trim());
			if (!match) {
				throw new Error(
					"お知らせの見出しは「## YYYY-MM-DD タイトル」で指定してください。",
				);
			}

			const [, date, title] = match;
			const parsedDate = new Date(`${date}T00:00:00Z`);
			if (
				Number.isNaN(parsedDate.getTime()) ||
				parsedDate.toISOString().slice(0, 10) !== date
			) {
				throw new Error(`お知らせの日付が不正です: ${date}`);
			}

			return {
				date,
				title,
				paragraphs: lines
					.join("\n")
					.trim()
					.split(/\n\s*\n/)
					.filter(Boolean),
			};
		})
		.sort((a, b) => b.date.localeCompare(a.date));
}
