import PageContainer from "@/shared/components/layout/PageContainer";
import {
	profileGreeting,
	profileIdentity,
	profileTimeline,
} from "../data/profileData";
import ProfileEquipment from "./ProfileEquipment";
import styles from "./ProfileStory.module.css";
import ProfileTimeline from "./ProfileTimeline";

export default function ProfileStory() {
	return (
		<section
			id="profile-about"
			className={styles.story}
			aria-labelledby="profile-introduction"
		>
			<PageContainer className={styles.content}>
				<header className={styles.introduction}>
					<h2 id="profile-introduction" className={styles.greeting}>
						<span>{profileGreeting.before}</span>
						<span>
							<span className={styles.handle}>{profileIdentity.handle}</span>
							{profileGreeting.after}
						</span>
					</h2>
				</header>
				<ProfileTimeline periods={profileTimeline} />
				<ProfileEquipment />
			</PageContainer>
		</section>
	);
}
