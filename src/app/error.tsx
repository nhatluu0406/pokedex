"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="app-error">
      <div className="app-error-card">
        <h1>Something went wrong</h1>
        <p>We couldn&apos;t load the Pokedex. Please try again.</p>
        <button type="button" className="retry-btn" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
