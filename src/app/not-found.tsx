import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
          <FileQuestion className="h-12 w-12 text-blue-600 dark:text-blue-500" />
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          404 - Page Not Found
        </h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
          The page you are looking for doesn't exist or has been moved.
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
