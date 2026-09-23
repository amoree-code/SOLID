import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { profile } from '@/content/profile';
import { siteUrl } from '@/lib/site';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const title = `${profile.name} — ${profile.role}`;

// Everything search engines and share previews read. Relative URLs (the
// canonical, the generated opengraph-image) resolve against metadataBase.
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: title, template: `%s — ${profile.name}` },
  description: profile.tagline,
  authors: [{ name: profile.name }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    url: '/',
    siteName: profile.name,
    title,
    description: profile.tagline,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: profile.tagline,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
