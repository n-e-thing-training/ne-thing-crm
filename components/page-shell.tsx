import { ReactNode } from "react";
import type { Route } from "next";
import { NavLink } from "@/components/nav-link";
import { SignOutButton } from "@/components/sign-out-button";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
  { href: "/accounts", label: "Accounts" },
  { href: "/contacts", label: "Contacts" },
  { href: "/classes", label: "Classes" },
  { href: "/participants", label: "Participants" },
  { href: "/registrations", label: "Registrations" },
  { href: "/imports", label: "Imports" },
  { href: "/templates", label: "Templates" },
  { href: "/messaging", label: "Messaging" },
  { href: "/history", label: "History" }
] as Array<{ href: Route; label: string }>;

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-semibold">n.e. thing training CRM</h1>
            <p className="text-xs text-slate-500">Operations and compliance center</p>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex flex-wrap items-center gap-2">
            {links.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
            </nav>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
