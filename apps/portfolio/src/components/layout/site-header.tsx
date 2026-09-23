import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/section';
import type { Profile } from '@/content/profile';

export function SiteHeader({ profile }: { profile: Profile }) {
  return (
    <header className="border-b">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="text-sm font-semibold">
          {profile.name}
        </Link>
        <nav className="-me-3 flex gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="#projects">Projects</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="#contact">Contact</Link>
          </Button>
        </nav>
      </Container>
    </header>
  );
}
