import { Section } from '@/components/ui/section';
import type { Profile } from '@/content/profile';

export function HeroSection({ profile }: { profile: Profile }) {
  return (
    <Section className="py-24 sm:py-32">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{profile.role}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
        {profile.name}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-300">{profile.tagline}</p>
      <p className="mt-4 max-w-xl text-zinc-600 dark:text-zinc-300">{profile.bio}</p>
    </Section>
  );
}
