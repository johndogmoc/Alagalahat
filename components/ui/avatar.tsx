"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type AvatarProps = React.HTMLAttributes<HTMLDivElement>;

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={cn("relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))]", className)}
      {...props}
    />
  );
}

export type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export function AvatarImage({ className, ...props }: AvatarImageProps) {
  return <img className={cn("aspect-square h-full w-full object-cover", className)} {...props} />;
}

export type AvatarFallbackProps = React.HTMLAttributes<HTMLDivElement>;

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <div
      className={cn("flex h-full w-full items-center justify-center text-xs font-medium text-[hsl(var(--muted-foreground))]", className)}
      {...props}
    />
  );
}

