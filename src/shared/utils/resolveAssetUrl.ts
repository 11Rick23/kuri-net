function trimTrailingSlash(value: string) {
	return value.replace(/\/+$/, "");
}

function trimLeadingSlash(value: string) {
	return value.replace(/^\/+/, "");
}

export function resolveAssetUrl(assetKey: string) {
	if (!assetKey || assetKey.trim() === "") {
		throw new Error("Asset key is required.");
	}

	const normalizedAssetKey = trimLeadingSlash(assetKey.trim());
	const assetBaseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.trim();

	if (!assetBaseUrl) {
		throw new Error(
			"NEXT_PUBLIC_ASSET_BASE_URL is required to resolve static assets.",
		);
	}

	return `${trimTrailingSlash(assetBaseUrl)}/${normalizedAssetKey}`;
}
