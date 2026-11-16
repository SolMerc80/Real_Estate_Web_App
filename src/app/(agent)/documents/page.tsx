import Link from "next/link";
import {
  Receipt,
  ScrollText,
  Handshake,
  AlertTriangle,
  ShieldAlert,
  BadgeCheck,
  ArrowRight,
  LucideIcon,
  Download,
  FileCheck,
} from "lucide-react";
import DocumentHeaderNav from "@/components/agent/DocumentHeaderNav";

type DocCard = {
  label: string;
  category: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge: string;
  color: string;
};

const DOCUMENT_CARDS: DocCard[] = [
  {
    label: "Invoices",
    category: "Accounting",
    description: "Generate monthly rent invoices, utility billing, and statement of accounts for tenants.",
    href: "/invoices",
    icon: Receipt,
    badge: "Monthly Billing",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  },
  {
    label: "Full Lease",
    category: "Contracts",
    description: "Generate legally binding comprehensive residential and commercial lease agreements.",
    href: "/full-lease",
    icon: ScrollText,
    badge: "Binding Agreement",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  {
    label: "Memorandum of Agreement",
    category: "Legal",
    description: "Draft official Memorandums of Agreement (MOA) between landlords, tenants, and agency.",
    href: "/memorandum",
    icon: Handshake,
    badge: "Tripartite Agreement",
    color: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  },
  {
    label: "Eviction 1st Warning",
    category: "Notices",
    description: "Formal 20-day notice to remedy breach (unpaid rent / lease violations) under CPA & PIE act.",
    href: "/eviction-first-notice",
    icon: AlertTriangle,
    badge: "20-Day Notice",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },
  {
    label: "Eviction Final Warning",
    category: "Legal Notice",
    description: "Final statutory cancellation notice and demand to vacate premises following unremedied default.",
    href: "/eviction-final-warning",
    icon: ShieldAlert,
    badge: "Urgent Final Notice",
    color: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  },
  {
    label: "Proof of Accommodation",
    category: "Certificates",
    description: "Generate verified proof of residence and accommodation confirmation letters for tenants.",
    href: "/proof-of-accommodation",
    icon: BadgeCheck,
    badge: "Official Letter",
    color: "bg-[#d7ece3] text-[#14533e] dark:bg-emerald-950/70 dark:text-emerald-300",
  },
];

export default function DocumentsPage() {
  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ── Document Header & Horizontal Nav ── */}
      <DocumentHeaderNav
        title="Document Management & Templates"
        description="Select a template below or use the sub-navbar tabs above to generate, draft, and issue official property agreements and notices."
      />

      {/* ── Document Template Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DOCUMENT_CARDS.map(({ label, category, description, href, icon: Icon, badge, color }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white dark:bg-slate-900 rounded-3xl border border-neutral-200/60 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`p-3 rounded-2xl ${color}`}>
                  <Icon size={22} />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${color}`}>
                  {badge}
                </span>
              </div>

              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                {category}
              </div>

              <h2 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-[#135446] dark:group-hover:text-emerald-400 transition-colors">
                {label}
              </h2>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">
                {description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-[#135446] transition-colors">
              <span>Open Template</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
