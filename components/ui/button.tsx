"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "amber";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild, href, ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      outline: "btn-outline",
      ghost: "btn-ghost",
      destructive: "btn-destructive",
      amber: "btn-amber"
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      default: "btn-size-default",
      sm: "btn-size-sm",
      lg: "btn-size-lg",
      icon: "btn-size-icon"
    };

    const classes = cn("btn", variants[variant], sizes[size], className);

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
