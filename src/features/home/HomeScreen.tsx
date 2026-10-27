import { getAuthenticatedSession } from "@/features/auth/server/session";
import LiveClock from "@/shared/components/LiveClock";
import PageContainer from "@/shared/components/layout/PageContainer";
import HighlightLink from "@/shared/components/motion/HighlightLink";
import HandwrittenGreeting from "./HandwrittenGreeting";
import styles from "./Home.module.css";
import HomeAnnouncements from "./HomeAnnouncements";

const homeLinks = [
	{ href: "/profile", label: "Profile" },
	{ href: "/works", label: "Works" },
	{ href: "/apps", label: "Apps" },
];

export default async function HomeScreen() {
	const session = await getAuthenticatedSession();

	return (
		<main className={styles.home}>
			<PageContainer>
				<div className={styles.composition}>
					<div className={styles.introduction}>
						<h1 className={styles.greeting}>
							{session ? "お帰りなさい" : <HandwrittenGreeting />}
						</h1>
						{session && (
							<div className={styles.description}>
								<LiveClock />
							</div>
						)}
						<HomeAnnouncements />
					</div>
					<nav className={styles.links} aria-label="ページ一覧">
						{homeLinks.map((link) => (
							<HighlightLink
								key={link.href}
								href={link.href}
								className={styles.link}
							>
								<span>{link.label}</span>
								<span className={styles.arrow} aria-hidden="true">
									→
								</span>
							</HighlightLink>
						))}
					</nav>
				</div>
			</PageContainer>
		</main>
	);
}
