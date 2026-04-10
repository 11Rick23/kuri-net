import type { NextConfig } from "next";

const assetBaseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.trim();

if (!assetBaseUrl) {
	throw new Error("NEXT_PUBLIC_ASSET_BASE_URL is required.");
}

const assetUrl = new URL(assetBaseUrl);
const assetPathname = assetUrl.pathname.replace(/\/+$/, "");
const assetRemotePattern = new URL(assetBaseUrl);

assetRemotePattern.pathname = assetPathname ? `${assetPathname}/**` : "/**";
assetRemotePattern.search = "";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [assetRemotePattern],
	},
};

export default nextConfig;
