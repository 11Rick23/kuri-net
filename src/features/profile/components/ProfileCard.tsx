import Image from "next/image";
import {
	profileEmail,
	profileGitHub,
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
							sizes="(max-width: 479px) 128px, (max-width: 836px) 36vw, 296px"
							className="object-contain dark:hidden"
							draggable={false}
						/>
						<Image
							src={profileLogo.dark}
							alt={profileLogo.alt}
							fill
							sizes="(max-width: 479px) 128px, (max-width: 836px) 36vw, 296px"
							className="hidden object-contain dark:block"
							draggable={false}
						/>
					</div>
					<p className={cardStyles.affiliation}>慶應義塾大学 環境情報学部</p>
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
		</section>
	);
}
