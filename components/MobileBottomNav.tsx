"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconHome, IconPaw, IconAlertTriangle, IconUser, IconClipboard, IconSearch, IconSyringe, IconMenu } from "@/components/icons";
import type { SidebarRole } from "@/components/Sidebar";

const ownerItems = [
  { href: "/home", label: "Feed", icon: IconHome },
  { href: "/pets", label: "My Pets", icon: IconPaw },
  { href: "/lost-pets", label: "Lost Pets", icon: IconAlertTriangle },
  { href: "/owner/settings", label: "More", icon: IconMenu }
] as const;

const staffItems = [
  { href: "/staff", label: "Home", icon: IconHome },
  { href: "/staff/pets", label: "Queue", icon: IconClipboard },
  { href: "/search", label: "Search", icon: IconSearch },
  { href: "/lost-pets", label: "Lost", icon: IconAlertTriangle }
] as const;

const adminItems = [
  { href: "/admin", label: "Home", icon: IconHome },
  { href: "/staff/pets", label: "Queue", icon: IconClipboard },
  { href: "/search", label: "Search", icon: IconSearch },
  { href: "/profile", label: "Profile", icon: IconUser }
] as const;

export function MobileBottomNav({ role }: { role: SidebarRole }) {
  const pathname = usePathname();
  const items = role === "Admin" ? adminItems : role === "Staff" ? staffItems : ownerItems;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined}>
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
