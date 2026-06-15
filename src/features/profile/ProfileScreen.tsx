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

export default function ProfileScreen() {
	return (
		<main className="min-h-screen px-4 pt-24 pb-16 sm:px-6">
			<PageContainer className="gap-12">
				<ProfileCard />

				<ProfileSection label="Profile" title="私について">
					<TextCard>
						{profileParagraphs.map((paragraph, index) => (
							<p
								key={paragraph.id}
								className={index === 0 ? undefined : "mt-4"}
							>
								<RichText content={paragraph.content} />
							</p>
						))}
					</TextCard>
				</ProfileSection>

				<ProfileSection label="Interests" title="興味分野">
					<TopicGrid topics={interests} />
				</ProfileSection>

				<ProfileSection label="Activities" title="活動・趣味">
					<TopicGrid topics={activities} />
				</ProfileSection>
			</PageContainer>
		</main>
	);
}
