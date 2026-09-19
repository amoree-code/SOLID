import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/forbidden')({
  component: ForbiddenPage,
});

function ForbiddenPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-lg font-medium">You don't have permission to view this page.</p>
      <Link to="/" className="text-sm underline underline-offset-4">
        Back to dashboard
      </Link>
    </div>
  );
}
