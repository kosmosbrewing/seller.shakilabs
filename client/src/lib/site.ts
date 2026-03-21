export const DEFAULT_SITE_URL = "https://shakilabs.com/seller";

export function getCanonicalSiteUrl(): string {
  return DEFAULT_SITE_URL;
}

export function getSiteUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    const basePath = new URL(getCanonicalSiteUrl()).pathname.replace(/\/+$/, "");
    return trimTrailingSlash(`${window.location.origin}${basePath}`);
  }
  return getCanonicalSiteUrl();
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}
