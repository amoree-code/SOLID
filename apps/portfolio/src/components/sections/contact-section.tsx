import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import type { Link } from '@/content/profile';

export function ContactSection({ email, links }: { email: string; links: Link[] }) {
  return (
    <Section id="contact">
      <h2 className="text-2xl font-semibold">Get in touch</h2>
      <a
        href={`mailto:${email}`}
        className="mt-4 inline-block text-muted-foreground hover:underline"
      >
        {email}
      </a>
      <ul className="mt-6 flex gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Button asChild variant="outline" size="sm">
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </Section>
  );
}
