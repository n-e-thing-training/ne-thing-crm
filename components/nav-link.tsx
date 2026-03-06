"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface NavLinkProps {
  href: Route;
  label: string;
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={clsx(
        "rounded-md px-3 py-2 text-sm font-medium",
        active ? "bg-brand-700 text-white" : "text-slate-700 hover:bg-slate-200"
      )}
    >
      {label}
    </Link>
  );
}
