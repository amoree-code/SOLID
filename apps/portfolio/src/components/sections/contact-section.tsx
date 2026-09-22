import { Section } from '@/components/ui/section';
import type { Link } from '@/content/profile';

export function ContactSection({ email, links }: { email: string; links: Link[] }) {
  return (
    <Section id="contact">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Get in touch</h2>
      <a
        href={`mailto:${email}`}
        className="mt-4 inline-block text-zinc-600 hover:underline dark:text-zinc-300"
      >
        {email}
      </a>
      <ul className="mt-6 flex gap-6">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
