import type { IconType } from "react-icons";
import { Si1Password, SiDiscord, SiGithub, SiRaycast } from "react-icons/si";
import {
	TbBrandVscode,
	TbCake,
	TbCalendar,
	TbDroplet,
	TbGenderMale,
	TbMail,
	TbRulerMeasure,
} from "react-icons/tb";
import PageContainer from "@/shared/components/layout/PageContainer";
import {
	createProfileFacts,
	type ProfileApplication,
	type ProfileFact,
	profileApplications,
	profileGreeting,
	profileIdentity,
	profileTimeline,
} from "../data/profileData";
import styles from "./ProfileStory.module.css";
import ProfileTimeline from "./ProfileTimeline";

const applicationIcons: Record<ProfileApplication["id"], IconType> = {
	github: SiGithub,
	discord: SiDiscord,
	vscode: TbBrandVscode,
	"1password": Si1Password,
	raycast: SiRaycast,
	spark: TbMail,
};

const factIcons: Record<ProfileFact["id"], IconType> = {
	birthday: TbCake,
	age: TbCalendar,
	gender: TbGenderMale,
	bloodType: TbDroplet,
	height: TbRulerMeasure,
};

export default function ProfileStory({ age }: { age: number }) {
	const facts = createProfileFacts(age);

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

				<section
					className={styles.basics}
					aria-labelledby="profile-basics-heading"
				>
					<div className={styles.sectionHeading}>
						<h3 id="profile-basics-heading">基本情報</h3>
					</div>
					<dl className={styles.facts}>
						{facts.map(({ id, label, value }) => {
							const Icon = factIcons[id];
							return (
								<div key={id} className={styles.fact}>
									<dt>
										<Icon aria-hidden="true" />
										<span className="sr-only">{label}</span>
									</dt>
									<dd>{value}</dd>
								</div>
							);
						})}
					</dl>
				</section>

				<ProfileTimeline periods={profileTimeline} />

				<section
					className={styles.applications}
					aria-labelledby="profile-apps-heading"
				>
					<div className={styles.sectionHeading}>
						<h3 id="profile-apps-heading">アプリ・サービス</h3>
					</div>
					<ul className={styles.appList}>
						{profileApplications.map(({ id, name, href }) => {
							const Icon = applicationIcons[id];
							return (
								<li key={id}>
									<a
										href={href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`${name}（外部サイト、新しいタブで開く）`}
									>
										<Icon className={styles.appIcon} aria-hidden="true" />
										<span className={styles.appName}>{name}</span>
									</a>
								</li>
							);
						})}
					</ul>
				</section>
			</PageContainer>
		</section>
	);
}
