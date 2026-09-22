import Link from 'next/link';
import { Section } from '@/components/ui/section';
import type { Profile } from '@/content/profile';

export function SiteHeader({ profile }: { profile: Profile }) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <Section className="flex items-center justify-between py-4">
        <Link href="/" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {profile.name}
        </Link>
        <nav className="flex gap-6 text-sm text-zinc-600 dark:text-zinc-300">
          <Link href="#projects" className="hover:underline">
            Projects
          </Link>
          <Link href="#contact" className="hover:underline">
            Contact
          </Link>
        </nav>
      </Section>
    </header>
  );
}
