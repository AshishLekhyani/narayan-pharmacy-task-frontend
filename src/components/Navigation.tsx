"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center px-4 h-full transition-colors ${
      isActive
        ? "text-primary border-b-2 border-primary font-semibold"
        : "text-on-surface-variant hover:bg-surface-container-low"
    }`;
  };

  return (
    <nav className="flex h-16 shrink-0">
      <Link href="/" className={`${getLinkClass("/")} whitespace-nowrap text-body-sm md:text-base px-2 md:px-4`}>
        Entry
      </Link>
      <Link href="/history" className={`${getLinkClass("/history")} whitespace-nowrap text-body-sm md:text-base px-2 md:px-4`}>
        History
      </Link>
    </nav>
  );
}
