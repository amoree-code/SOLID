import { Section } from '@/components/ui/section';
import type { Profile } from '@/content/profile';

export function SiteFooter({ profile }: { profile: Profile }) {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <Section className="py-8 text-sm text-zinc-500 dark:text-zinc-400">
        © {new Date().getFullYear()} {profile.name}
      </Section>
    </footer>
  );
}
