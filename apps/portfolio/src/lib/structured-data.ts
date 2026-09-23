import type { Profile } from '@/content/profile';
import { absoluteUrl } from '@/lib/site';

/**
 * schema.org `Person` for search engines, built from the same profile the
 * page renders — so the two can never disagree.
 */
export function personJsonLd(profile: Profile) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    description: profile.tagline,
    email: `mailto:${profile.email}`,
    url: absoluteUrl('/'),
    sameAs: profile.links.map((link) => link.href),
  };
}

/** Serializes for a <script> tag, escaping `<` so content can never close the tag. */
export function toJsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
