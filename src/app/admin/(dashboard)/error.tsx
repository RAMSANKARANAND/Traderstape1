"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  const isForbidden = error.message.includes("Forbidden") || error.message.includes("Unauthorized");

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white border-4 border-ink brutal-shadow p-8">
        <h1 className="text-3xl font-black uppercase mb-4 text-ink">
          {isForbidden ? "Access Denied" : "Something Went Wrong"}
        </h1>
        <p className="text-lg font-bold mb-6 text-ink">
          {isForbidden
            ? "You do not have permission to perform this action."
            : "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-accent-yellow text-ink font-black uppercase px-6 py-3 brutal-border border-2 border-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
          >
            Try Again
          </button>
          <a
            href="/admin"
            className="bg-ink text-white font-black uppercase px-6 py-3 brutal-border border-2 border-ink hover:bg-ink/90 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}