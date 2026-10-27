import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import {
	profileEmail,
	profileGitHub,
	profileIdentity,
	profileLogo,
} from "@/features/profile/data/profileData";
import HighlightLink from "@/shared/components/motion/HighlightLink";
import styles from "../Profile.module.css";
import cardStyles from "./ProfileBusinessCard.module.css";
import linkStyles from "./ProfileLink.module.css";
import TiltableCard from "./TiltableCard";

export default function ProfileCard() {
	return (
		<section aria-labelledby="profile-heading" className={styles.cover}>
			<TiltableCard>
				<div className={cardStyles.identity}>
					<div>
						<h1 id="profile-heading" className={cardStyles.name}>
							{profileIdentity.handle}
						</h1>
						<p className={cardStyles.alias}>a.k.a. {profileIdentity.alias}</p>
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
					<p className={cardStyles.affiliation}>
						{profileIdentity.affiliation}
					</p>
				</div>
				<dl className={cardStyles.contacts}>
					<div>
						<dt>Email</dt>
						<dd>
							<a
								href={profileEmail.href}
								draggable={false}
								className={linkStyles.link}
								data-click-highlight
							>
								{profileEmail.display}
							</a>
						</dd>
					</div>
					<div>
						<dt>GitHub</dt>
						<dd>
							<HighlightLink
								href={profileGitHub.href}
								className={linkStyles.link}
								draggable={false}
								target="_blank"
								rel="noopener noreferrer"
							>
								{profileGitHub.display}
							</HighlightLink>
						</dd>
					</div>
				</dl>
			</TiltableCard>
			<a
				href="#profile-about"
				className={styles.scrollCue}
				aria-label="自己紹介へスクロール"
			>
				<MdKeyboardArrowDown aria-hidden="true" />
			</a>
		</section>
	);
}
