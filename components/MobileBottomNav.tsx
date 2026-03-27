"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconHome, IconPaw, IconAlertTriangle, IconUser } from "@/components/icons";

const items = [
  { href: "/owner", label: "Home", icon: IconHome },
  { href: "/pets", label: "My Pets", icon: IconPaw },
  { href: "/lost-pets", label: "Lost Pets", icon: IconAlertTriangle },
  { href: "/profile", label: "Profile", icon: IconUser }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
