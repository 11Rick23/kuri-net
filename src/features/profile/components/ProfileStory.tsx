import PageContainer from "@/shared/components/layout/PageContainer";
import Reveal from "@/shared/components/motion/Reveal";
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
				<Reveal>
					<header className={styles.introduction}>
						<h2 id="profile-introduction" className={styles.greeting}>
							<span>{profileGreeting.before}</span>
							<span>
								<span className={styles.handle}>{profileIdentity.handle}</span>
								{profileGreeting.after}
							</span>
						</h2>
					</header>
				</Reveal>
				<Reveal>
					<ProfileTimeline periods={profileTimeline} />
				</Reveal>
				<Reveal>
					<ProfileEquipment />
				</Reveal>
			</PageContainer>
		</section>
	);
}
