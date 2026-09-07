import ProfileCard from "@/features/profile/components/ProfileCard";
import {
	ProfileSection,
	RichText,
	TextCard,
	TopicGrid,
} from "@/features/profile/components/ProfileSection";
import {
	activities,
	interests,
	profileParagraphs,
} from "@/features/profile/data/profileContent";
import PageContainer from "@/shared/components/layout/PageContainer";
import styles from "./Profile.module.css";

export default function ProfileScreen() {
	return (
		<main className="page-shell">
			<PageContainer className={styles.page}>
				<ProfileCard />

				<ProfileSection title="私について">
					<TextCard>
						{profileParagraphs.map((paragraph) => (
							<p key={paragraph.id}>
								<RichText content={paragraph.content} />
							</p>
						))}
					</TextCard>
				</ProfileSection>

				<ProfileSection title="興味分野" layout="wide">
					<TopicGrid topics={interests} />
				</ProfileSection>

				<ProfileSection title="活動・趣味">
					<TopicGrid topics={activities} layout="rows" />
				</ProfileSection>
			</PageContainer>
		</main>
	);
}
