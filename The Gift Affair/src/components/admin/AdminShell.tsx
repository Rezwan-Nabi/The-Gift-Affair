import { BookOpen, ExternalLink, FolderOpen, Gift, LayoutDashboard, Tags } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import Logo from "@/components/ui/Logo";
import AdminNavLink from "./AdminNavLink";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/gifts", label: "Gifts", icon: Gift },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/tags", label: "Occasions, recipients and budgets", icon: Tags },
  { href: "/admin/guides", label: "Gift guides", icon: BookOpen },
];

export default function AdminShell({ user, children }: { user: { displayName: string; role: string }; children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-b border-plum-line bg-surface lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col gap-6 p-5">
          <div>
            <Logo href="/admin" className="text-xl" />
            <p className="mt-1 text-sm text-plum-soft">Content admin</p>
          </div>
          <nav aria-label="Admin">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col">
              {NAV.map((n) => (
                <li key={n.href} className="shrink-0">
                  <AdminNavLink href={n.href} exact={n.exact}>
                    <n.icon className="size-4 shrink-0" aria-hidden="true" />
                    {n.label}
                  </AdminNavLink>
                </li>
              ))}
              <li className="shrink-0">
                <Link href="/" target="_blank" className="flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-plum-soft hover:bg-cream">
                  <ExternalLink className="size-4" aria-hidden="true" /> View website<span className="sr-only"> (opens in a new tab)</span>
                </Link>
              </li>
            </ul>
          </nav>
          <div className="mt-auto hidden border-t border-plum-line pt-4 lg:block">
            <p className="truncate text-sm font-semibold">{user.displayName}</p>
            <p className="text-xs text-plum-soft capitalize">{user.role}</p>
            <form action={signOut} className="mt-3">
              <button type="submit" className="text-sm font-semibold underline underline-offset-4">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex justify-end border-b border-plum-line px-5 py-2 lg:hidden">
          <form action={signOut}>
            <button type="submit" className="min-h-10 text-sm font-semibold underline underline-offset-4">
              Sign out
            </button>
          </form>
        </div>
        <main id="main" className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
