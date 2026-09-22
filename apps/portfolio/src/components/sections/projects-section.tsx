import { Section } from '@/components/ui/section';
import type { Project } from '@/content/profile';

function ProjectCard({ project }: { project: Project }) {
  return (
    <li className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
      <a
        href={project.href}
        target="_blank"
        rel="noreferrer"
        className="text-lg font-medium text-zinc-900 hover:underline dark:text-zinc-50"
      >
        {project.name}
      </a>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{project.description}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {tag}
          </li>
        ))}
      </ul>
    </li>
  );
}

export function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <Section id="projects">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Projects</h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </ul>
    </Section>
  );
}
