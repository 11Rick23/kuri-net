import ProfileCard from "@/features/profile/components/ProfileCard";
import ProfileStory from "@/features/profile/components/ProfileStory";
import { getProfileAge } from "@/features/profile/lib/profileAge";
import PageContainer from "@/shared/components/layout/PageContainer";
import styles from "./Profile.module.css";

export default function ProfileScreen() {
	return (
		<main className={`page-shell ${styles.screen}`}>
			<PageContainer className={styles.page}>
				<ProfileCard />

				<ProfileStory age={getProfileAge(new Date())} />
			</PageContainer>
		</main>
	);
}
