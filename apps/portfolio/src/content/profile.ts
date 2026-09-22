/**
 * All page copy lives here, separated from presentation — swap this one file
 * for a real bio/projects/links and every section picks it up automatically.
 * (Single Responsibility: sections render; this describes what to render.)
 */

export type Project = {
  name: string;
  description: string;
  href: string;
  tags: string[];
};

export type Link = {
  label: string;
  href: string;
};

export const profile = {
  name: 'Your Name',
  role: 'Full-Stack Developer',
  tagline: 'I build things for the web.',
  bio: 'Replace this with a couple of sentences about what you do and what you care about.',
  email: 'you@example.com',
  links: [
    { label: 'GitHub', href: 'https://github.com/your-username' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/your-username' },
  ] satisfies Link[],
  projects: [
    {
      name: 'Project One',
      description: 'One sentence on what it does and the problem it solves.',
      href: 'https://github.com/your-username/project-one',
      tags: ['TypeScript', 'React'],
    },
    {
      name: 'Project Two',
      description: 'One sentence on what it does and the problem it solves.',
      href: 'https://github.com/your-username/project-two',
      tags: ['Node.js', 'PostgreSQL'],
    },
  ] satisfies Project[],
};

export type Profile = typeof profile;
