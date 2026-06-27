import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 rounded-full bg-red-100 p-4 dark:bg-red-900/30">
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-500" />
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          403 - Access Denied
        </h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
          You do not have permission to view this directory or page using the credentials that you supplied.
        </p>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
