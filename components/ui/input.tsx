"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div style={{ position: "relative", width: "100%" }}>
        {leftIcon && (
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: error ? "var(--color-error)" : "var(--color-text-muted)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              transition: "color var(--transition-fast)"
            }}
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error && props.id ? `${props.id}-error` : undefined}
          className={cn(
            "input-base",
            error ? "input-error" : "",
            leftIcon ? "input-has-left-icon" : "",
            rightIcon ? "input-has-right-icon" : "",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span
            style={{
              position: "absolute",
              right: 4,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center"
            }}
          >
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
