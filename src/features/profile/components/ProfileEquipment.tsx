import type { IconType } from "react-icons";
import {
	TbBrowser,
	TbChecklist,
	TbCode,
	TbCommand,
	TbDeviceDesktop,
	TbDeviceGamepad2,
	TbDeviceLaptop,
	TbDeviceMobile,
	TbDeviceWatch,
	TbHeadphones,
	TbHeadset,
	TbLock,
	TbMail,
	TbMessageCircle,
	TbShield,
	TbTerminal2,
} from "react-icons/tb";
import HighlightLink from "@/shared/components/motion/HighlightLink";
import {
	type ProfileEquipmentIcon,
	profileApplications,
	profileDevices,
} from "../data/profileData";
import styles from "./ProfileEquipment.module.css";
import linkStyles from "./ProfileLink.module.css";

const icons: Record<ProfileEquipmentIcon, IconType> = {
	desktop: TbDeviceDesktop,
	laptop: TbDeviceLaptop,
	phone: TbDeviceMobile,
	watch: TbDeviceWatch,
	earbuds: TbHeadphones,
	headset: TbHeadset,
	gamepad: TbDeviceGamepad2,
	browser: TbBrowser,
	mail: TbMail,
	tasks: TbChecklist,
	launcher: TbCommand,
	code: TbCode,
	chat: TbMessageCircle,
	terminal: TbTerminal2,
	lock: TbLock,
	shield: TbShield,
};

export default function ProfileEquipment() {
	return (
		<div className={styles.equipment}>
			<section className={styles.box} aria-labelledby="profile-devices-heading">
				<h3 id="profile-devices-heading">DEVICES I OWN</h3>
				<ul className={styles.list}>
					{profileDevices.map((device, index) => {
						const Icon = icons[device.icon];
						const detailsId = `profile-device-${device.id}`;
						const titleId = `${detailsId}-title`;
						const hasDetails = Boolean(device.details?.length);
						const label = (
							<>
								<Icon className={styles.icon} aria-hidden="true" />
								<span>{device.name}</span>
							</>
						);
						return (
							<li
								key={device.id}
								className={styles.item}
								data-group-start={
									index > 0 && device.group !== profileDevices[index - 1]?.group
								}
							>
								{hasDetails ? (
									<>
										<button
											type="button"
											className={`${styles.row} ${linkStyles.link} ${styles.deviceButton}`}
											popoverTarget={detailsId}
											aria-controls={detailsId}
											aria-label={`${device.name}の詳細`}
										>
											{label}
										</button>
										<section
											id={detailsId}
											popover="auto"
											className={styles.deviceDetails}
											aria-labelledby={titleId}
										>
											<h4 id={titleId} className="sr-only">
												{device.name}
											</h4>
											<dl>
												{device.details?.map(({ label, value }) => (
													<div key={label}>
														<dt className="sr-only">{label}</dt>
														<dd>{value}</dd>
													</div>
												))}
											</dl>
										</section>
									</>
								) : (
									<span className={styles.row}>{label}</span>
								)}
							</li>
						);
					})}
				</ul>
			</section>
			<section className={styles.box} aria-labelledby="profile-apps-heading">
				<h3 id="profile-apps-heading">APPS I USE</h3>
				<ul className={styles.list}>
					{profileApplications.map((app, index) => {
						const Icon = icons[app.icon];
						return (
							<li
								key={app.id}
								className={styles.item}
								data-group-start={
									index > 0 &&
									app.group !== profileApplications[index - 1]?.group
								}
							>
								<HighlightLink
									href={app.href}
									className={`${styles.row} ${linkStyles.link}`}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`${app.name}（公式サイトを新しいタブで開く）`}
								>
									<Icon className={styles.icon} aria-hidden="true" />
									<span>{app.name}</span>
								</HighlightLink>
							</li>
						);
					})}
				</ul>
			</section>
		</div>
	);
}
