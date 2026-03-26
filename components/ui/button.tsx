"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild, href, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background";

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      default: "bg-black text-white hover:bg-black/90",
      outline: "border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--muted))]",
      ghost: "bg-transparent hover:bg-[hsl(var(--muted))]",
      destructive: "bg-red-600 text-white hover:bg-red-600/90"
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8"
    };

    const classes = cn(base, variants[variant], sizes[size], className);

    if (asChild && href) {
      return (
        <Link className={classes} href={href}>
          {props.children}
        </Link>
      );
    }

    return <button ref={ref} className={classes} {...props} />;
  }
);
Button.displayName = "Button";

