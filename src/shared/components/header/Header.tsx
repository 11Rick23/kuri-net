import { getAuthenticatedSession } from "@/features/auth/server/session";
import ColorModeButton from "./ColorModeButton";
import styles from "./Header.module.css";
import HomeButton from "./HomeButton";
import LogInButton from "./LoginButton";
import LogOutButton from "./LogoutButton";
import PageButton from "./PageButton";

export default async function Header() {
	const session = await getAuthenticatedSession();

	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<HomeButton />
				<nav className={styles.navigation} aria-label="メインナビゲーション">
					<PageButton url="/profile" display="Profile" />
					<PageButton url="/works" display="Works" />
					<PageButton url="/apps" display="Apps" match="prefix" />
				</nav>
				<div className={styles.controls}>
					<ColorModeButton />
					{session ? <LogOutButton /> : <LogInButton />}
				</div>
			</div>
		</header>
	);
}
