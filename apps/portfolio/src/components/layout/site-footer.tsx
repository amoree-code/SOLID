import { Container } from '@/components/ui/section';
import type { Profile } from '@/content/profile';

export function SiteFooter({ profile }: { profile: Profile }) {
  return (
    <footer className="border-t">
      <Container className="py-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} {profile.name}
      </Container>
    </footer>
  );
}
