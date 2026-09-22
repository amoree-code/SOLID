import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroSection } from '@/components/sections/hero-section';
import type { Profile } from '@/content/profile';

const profile: Profile = {
  name: 'Ada Lovelace',
  role: 'Mathematician',
  tagline: 'Writing the first algorithm.',
  bio: 'Bio text.',
  email: 'ada@example.com',
  links: [],
  projects: [],
};

describe('HeroSection', () => {
  it('renders the name, role, and tagline from the given profile', () => {
    render(<HeroSection profile={profile} />);

    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(screen.getByText('Mathematician')).toBeInTheDocument();
    expect(screen.getByText('Writing the first algorithm.')).toBeInTheDocument();
  });
});
