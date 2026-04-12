import type { NextConfig } from "next";

const assetBaseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.trim();

if (!assetBaseUrl) {
	throw new Error("NEXT_PUBLIC_ASSET_BASE_URL is required.");
}

const assetUrl = new URL(assetBaseUrl);
const assetPathname = assetUrl.pathname.replace(/\/+$/, "");
const assetRemotePattern: NonNullable<
	NonNullable<NextConfig["images"]>["remotePatterns"]
>[number] = {
	protocol: assetUrl.protocol === "https:" ? "https" : "http",
	hostname: assetUrl.hostname,
	port: assetUrl.port,
	pathname: assetPathname ? `${assetPathname}/**` : "/**",
};

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [assetRemotePattern],
	},
};

export default nextConfig;
