"use client";

import { forwardRef } from "react";

export const LoadMoreTrigger = forwardRef<HTMLDivElement>(
  function LoadMoreTrigger(_props, ref) {
    return (
      <div
        ref={ref}
        className="load-more-trigger"
        aria-hidden="true"
      />
    );
  },
);
