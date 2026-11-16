"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Receipt,
  ScrollText,
  Handshake,
  AlertTriangle,
  ShieldAlert,
  BadgeCheck,
  LayoutGrid,
} from "lucide-react";

const DOCUMENT_NAV_ITEMS = [
  {
    label: "All Documents",
    href: "/documents",
    icon: LayoutGrid,
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: Receipt,
  },
  {
    label: "Full Lease",
    href: "/full-lease",
    icon: ScrollText,
  },
  {
    label: "Memorandum of Agreement",
    href: "/memorandum",
    icon: Handshake,
  },
  {
    label: "Eviction 1st Warning",
    href: "/eviction-first-notice",
    icon: AlertTriangle,
  },
  {
    label: "Eviction Final Warning",
    href: "/eviction-final-warning",
    icon: ShieldAlert,
  },
  {
    label: "Proof of Accommodation",
    href: "/proof-of-accommodation",
    icon: BadgeCheck,
  },
];

interface DocumentHeaderNavProps {
  title?: string;
  description?: string;
}

export default function DocumentHeaderNav({
  title = "Document Management & Templates",
  description = "Generate, draft, and issue official agreements, legal notices, and certificates.",
}: DocumentHeaderNavProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      {/* ── Top Header Banner ── */}
      <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-[#135446]/10 text-[#135446] dark:bg-emerald-950/60 dark:text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                {title}
              </h1>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#d7ece3] text-[#14533e] dark:bg-emerald-950/70 dark:text-emerald-300">
                Official Templates
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
          <span>FICA & Legal Compliance Active</span>
        </div>
      </div>

      {/* ── Document Sub-Navbar Tabs ── */}
      <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-2 shadow-sm overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-1.5 min-w-max">
          {DOCUMENT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/documents"
                ? pathname === "/documents"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900 font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white dark:text-neutral-900" : "text-neutral-400"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

