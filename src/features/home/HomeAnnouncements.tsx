import { readFile } from "node:fs/promises";
import path from "node:path";
import AnnouncementArchive from "./AnnouncementArchive";
import { type Announcement, parseAnnouncements } from "./data/announcements";
import styles from "./HomeAnnouncements.module.css";

function AnnouncementContent({ announcement }: { announcement: Announcement }) {
	return (
		<article className={styles.entry}>
			<div className={styles.entryHeading}>
				<h3 className={styles.title}>{announcement.title}</h3>
				<time className={styles.date} dateTime={announcement.date}>
					{announcement.date.replaceAll("-", ".")}
				</time>
			</div>
			{announcement.paragraphs.length > 0 && (
				<p className={styles.body}>{announcement.paragraphs.join("\n\n")}</p>
			)}
		</article>
	);
}

export default async function HomeAnnouncements() {
	const markdown = await readFile(
		path.join(process.cwd(), "src/features/home/data/announcements.md"),
		"utf8",
	);
	const announcements = parseAnnouncements(markdown);
	const [latest] = announcements;

	return (
		<section className={styles.panel} aria-labelledby="home-announcements">
			<h2 className={styles.heading} id="home-announcements">
				お知らせ
			</h2>
			{latest ? (
				<AnnouncementContent announcement={latest} />
			) : (
				<p className={styles.empty}>現在、お知らせはありません。</p>
			)}
			{latest && (
				<AnnouncementArchive>
					<div className={styles.pastEntries}>
						{announcements.map((announcement) => (
							<AnnouncementContent
								key={`${announcement.date}-${announcement.title}`}
								announcement={announcement}
							/>
						))}
					</div>
				</AnnouncementArchive>
			)}
		</section>
	);
}
