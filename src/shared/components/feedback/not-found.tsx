import { Link } from '@tanstack/react-router';

export function NotFound() {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-lg font-medium">Page not found</p>
      <Link to="/" className="text-sm underline underline-offset-4">
        Back to dashboard
      </Link>
    </div>
  );
}
