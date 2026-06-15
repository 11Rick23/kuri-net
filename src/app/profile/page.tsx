import type { Metadata } from "next";
import ProfileScreen from "@/features/profile/ProfileScreen";

export const metadata: Metadata = {
	title: "Profile",
};

export default function ProfilePage() {
	return <ProfileScreen />;
}
