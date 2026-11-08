"use client";

import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/ui/Logo";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Taxonomy } from "@/types";
import SearchForm from "./SearchForm";

type Group = { label: string; base: string; items: { name: string; slug: string; description?: string | null }[] };

function groupsFrom(t: Taxonomy): Group[] {
  return [
    { label: "By Occasion", base: "/occasions", items: t.occasions },
    { label: "By Recipient", base: "/recipients", items: t.recipients },
    { label: "By Budget", base: "/budget", items: t.budgets },
  ];
}

/** Accessible disclosure menu: button + list, closes on Escape, outside click or navigation. */
function NavDisclosure({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const listId = `nav-${group.base.slice(1)}`;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <li
      ref={ref}
      className="relative"
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 font-medium hover:bg-plum/6"
      >
        {group.label}
        <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <ul
        id={listId}
        hidden={!open}
        className="absolute top-full left-0 z-40 mt-2 w-64 rounded-2xl border border-plum-line bg-surface p-2 shadow-[0_14px_40px_rgb(56_42_58/0.14)]"
      >
        {group.items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`${group.base}/${item.slug}`}
              className="flex flex-col rounded-xl px-3 py-2.5 hover:bg-cream"
              onClick={() => setOpen(false)}
            >
              <span className="font-medium">{item.name}</span>
              {item.description && <span className="text-sm text-plum-soft">{item.description}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function SiteHeader({ taxonomy }: { taxonomy: Taxonomy }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const groups = groupsFrom(taxonomy);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-plum-line/70 bg-cream/95 backdrop-blur">
      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-[0.95rem]">
            <li>
              <Link href="/gift-ideas" className="inline-flex min-h-11 items-center rounded-full px-3 font-medium hover:bg-plum/6">
                Gifts
              </Link>
            </li>
            {groups.map((g) => (
              <NavDisclosure key={g.base} group={g} />
            ))}
            <li>
              <Link href="/gift-guides" className="inline-flex min-h-11 items-center rounded-full px-3 font-medium hover:bg-plum/6">
                Gift Guides
              </Link>
            </li>
            <li>
              <Link href="/about" className="inline-flex min-h-11 items-center rounded-full px-3 font-medium hover:bg-plum/6">
                About
              </Link>
            </li>
          </ul>
        </nav>

        <div className="hidden w-64 xl:block">
          <SearchForm id="header-search" />
        </div>

        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogTrigger
            className="inline-flex size-11 items-center justify-center rounded-full hover:bg-plum/6 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-6" aria-hidden="true" />
          </DialogTrigger>
          <DialogContent side="left" closeLabel="Close menu" aria-describedby={undefined}>
            <DialogTitle className="sr-only">Menu</DialogTitle>
            <Logo />
            <SearchForm id="mobile-search" className="mt-6" />
            <nav aria-label="Main" className="mt-6">
              <ul className="divide-y divide-plum-line">
                <li>
                  <Link href="/" className="flex min-h-12 items-center font-display text-xl">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/gift-ideas" className="flex min-h-12 items-center font-display text-xl">
                    Gifts
                  </Link>
                </li>
                {groups.map((g) => (
                  <li key={g.base} className="py-3">
                    <p className="font-display text-xl">{g.label}</p>
                    <ul className="mt-1 flex flex-wrap gap-2">
                      {g.items.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`${g.base}/${item.slug}`}
                            className="inline-flex min-h-10 items-center rounded-full border border-plum/20 bg-surface px-4 text-[0.95rem]"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
                <li>
                  <Link href="/gift-guides" className="flex min-h-12 items-center font-display text-xl">
                    Gift Guides
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="flex min-h-12 items-center font-display text-xl">
                    About
                  </Link>
                </li>
              </ul>
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
