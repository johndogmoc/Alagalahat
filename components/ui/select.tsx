"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ className, children, error, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={error ? "true" : undefined}
      className={cn(
        "input-base",
        error ? "input-error" : "",
        className
      )}
      style={{ cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 4l4 4 4-4'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
      {...props}
    >
      {children}
    </select>
  );
}
