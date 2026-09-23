/**
 * The site's public origin — the one value every absolute URL (canonical,
 * Open Graph, sitemap, robots, structured data) is built from. Set
 * NEXT_PUBLIC_SITE_URL to the deployed domain; a malformed value fails the
 * build instead of shipping broken share links.
 */
function readSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  try {
    return new URL(raw);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL must be an absolute URL, got "${raw}".`);
  }
}

export const siteUrl = readSiteUrl();

export function absoluteUrl(path = '/'): string {
  return new URL(path, siteUrl).toString();
}
