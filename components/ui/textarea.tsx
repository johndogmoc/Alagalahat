"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "input-base",
          error ? "input-error" : "",
          className
        )}
        style={{ minHeight: 96, resize: "vertical" }}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
