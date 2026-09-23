import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import type { Project } from '@/content/profile';

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-medium">
          <a href={project.href} target="_blank" rel="noreferrer" className="hover:underline">
            {project.name}
          </a>
        </CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary">{tag}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <Section id="projects">
      <h2 className="text-2xl font-semibold">Projects</h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <li key={project.name}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
