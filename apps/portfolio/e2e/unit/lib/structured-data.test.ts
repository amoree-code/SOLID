import { describe, expect, it } from 'vitest';
import type { Profile } from '@/content/profile';
import { personJsonLd, toJsonLdScript } from '@/lib/structured-data';

const profile: Profile = {
  name: 'Ada Lovelace',
  role: 'Mathematician',
  tagline: 'Writing the first algorithm.',
  bio: 'Bio text.',
  email: 'ada@example.com',
  links: [{ label: 'GitHub', href: 'https://github.com/ada' }],
  projects: [],
};

describe('personJsonLd', () => {
  it('describes the profile as a schema.org Person', () => {
    expect(personJsonLd(profile)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Ada Lovelace',
      jobTitle: 'Mathematician',
      description: 'Writing the first algorithm.',
      email: 'mailto:ada@example.com',
      url: 'http://localhost:3000/',
      sameAs: ['https://github.com/ada'],
    });
  });
});

describe('toJsonLdScript', () => {
  it('escapes "<" so profile text cannot close the script tag', () => {
    const script = toJsonLdScript({ bio: '</script><script>alert(1)</script>' });
    expect(script).not.toContain('</script>');
    expect(JSON.parse(script)).toEqual({ bio: '</script><script>alert(1)</script>' });
  });
});
