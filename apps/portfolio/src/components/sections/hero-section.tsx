import { Section } from '@/components/ui/section';
import type { Profile } from '@/content/profile';

export function HeroSection({ profile }: { profile: Profile }) {
  return (
    <Section className="py-24 sm:py-32">
      <p className="text-sm font-medium text-muted-foreground">{profile.role}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{profile.name}</h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">{profile.tagline}</p>
      <p className="mt-4 max-w-xl text-muted-foreground">{profile.bio}</p>
    </Section>
  );
}
