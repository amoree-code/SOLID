import { ImageResponse } from 'next/og';
import { profile } from '@/content/profile';

// The preview card shown when the site is shared (LinkedIn, X, Slack, WhatsApp…),
// generated at build time from profile.ts — no image file to keep in sync.
export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: '#faf9f5',
        color: '#1f1e1d',
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 700 }}>{profile.name}</div>
      <div style={{ fontSize: 40, marginTop: 16, color: '#c96442' }}>{profile.role}</div>
      <div style={{ fontSize: 32, marginTop: 32, color: '#5f5e5a' }}>{profile.tagline}</div>
    </div>,
    size,
  );
}
