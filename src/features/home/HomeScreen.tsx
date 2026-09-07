import Link from "next/link";
import { getAuthenticatedSession } from "@/features/auth/server/session";
import LiveClock from "@/shared/components/LiveClock";
import PageContainer from "@/shared/components/layout/PageContainer";
import styles from "./Home.module.css";

const homeLinks = [
	{ href: "/profile", label: "Profile" },
	{ href: "/works", label: "Works" },
	{ href: "/apps", label: "Apps" },
];

export default async function HomeScreen() {
	const session = await getAuthenticatedSession();

	const loggedOutContent = {
		title: "こんにちは",
		description: (
			<>
				kuri-kuri.net へようこそ。
				<br />
				プロフィール、制作実績、ウェブアプリなどをまとめています。
			</>
		),
	};

	const loggedInContent = {
		title: "お帰りなさい",
		description: <LiveClock />,
	};

	return (
		<main className={styles.home}>
			<PageContainer>
				<div className={styles.composition}>
					<div className={styles.introduction}>
						<h1 className={styles.greeting}>
							{session ? loggedInContent.title : loggedOutContent.title}
						</h1>
						<div className={styles.description}>
							{session
								? loggedInContent.description
								: loggedOutContent.description}
						</div>
					</div>
					<nav className={styles.links} aria-label="ページ一覧">
						{homeLinks.map((link) => (
							<Link key={link.href} href={link.href} className={styles.link}>
								<span>{link.label}</span>
								<span className={styles.arrow} aria-hidden="true">
									→
								</span>
							</Link>
						))}
					</nav>
				</div>
			</PageContainer>
		</main>
	);
}
