import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { ContactSection } from '@/components/sections/contact-section';
import { HeroSection } from '@/components/sections/hero-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { profile } from '@/content/profile';
import { personJsonLd, toJsonLdScript } from '@/lib/structured-data';

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON; toJsonLdScript escapes "<"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(personJsonLd(profile)) }}
      />
      <SiteHeader profile={profile} />
      <main className="flex-1">
        <HeroSection profile={profile} />
        <ProjectsSection projects={profile.projects} />
        <ContactSection email={profile.email} links={profile.links} />
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
