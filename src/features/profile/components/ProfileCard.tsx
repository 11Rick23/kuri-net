import Image from "next/image";
import {
	profileDetails,
	profileEmail,
	profileGitHub,
	profileInterests,
	profileLogo,
} from "@/features/profile/data/profileData";
import styles from "../Profile.module.css";
import cardStyles from "./ProfileBusinessCard.module.css";
import TiltableCard from "./TiltableCard";

export default function ProfileCard() {
	return (
		<section aria-labelledby="profile-heading" className={styles.cover}>
			<TiltableCard>
				<div className={cardStyles.identity}>
					<div>
						<h1 id="profile-heading" className={cardStyles.name}>
							kuri-kuri
						</h1>
						<p className={cardStyles.alias}>a.k.a. 11Rick23</p>
					</div>
					<div className={cardStyles.logo}>
						<Image
							src={profileLogo.light}
							alt={profileLogo.alt}
							fill
							sizes="(max-width: 767px) 88px, 108px"
							className="object-contain dark:hidden"
							draggable={false}
						/>
						<Image
							src={profileLogo.dark}
							alt={profileLogo.alt}
							fill
							sizes="(max-width: 767px) 88px, 108px"
							className="hidden object-contain dark:block"
							draggable={false}
						/>
					</div>
				</div>
				<div className={cardStyles.background}>
					<p className={cardStyles.affiliation}>慶應義塾大学 環境情報学部</p>
					<p className={cardStyles.interests}>{profileInterests.join(" / ")}</p>
				</div>
				<dl className={cardStyles.contacts}>
					<div>
						<dt>Email</dt>
						<dd>
							<a href={profileEmail.href} draggable={false}>
								{profileEmail.display}
							</a>
						</dd>
					</div>
					<div>
						<dt>GitHub</dt>
						<dd>
							<a
								href={profileGitHub.href}
								draggable={false}
								target="_blank"
								rel="noopener noreferrer"
							>
								{profileGitHub.display}
							</a>
						</dd>
					</div>
				</dl>
			</TiltableCard>

			<dl className={styles.details}>
				{profileDetails.map((detail) => {
					const Icon = detail.icon;

					return (
						<div key={detail.label} className={styles.detail}>
							<dt>
								<Icon aria-hidden="true" />
								{detail.label}
							</dt>
							<dd>{detail.value}</dd>
						</div>
					);
				})}
			</dl>
		</section>
	);
}
