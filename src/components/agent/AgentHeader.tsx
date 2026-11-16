"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Home,
  Users,
  Wrench,
  CreditCard,
  ArrowRight,
  Loader2,
  Building,
  FileText,
  UserCheck,
  HardHat,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/agent/ThemeToggle";

interface AgentHeaderProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

interface SearchResults {
  properties: Array<{ id: number; propertyName: string; propertyCode: string; address: string; city: string | null; status: string }>;
  maintenances: Array<{ id: number; issueDescription: string; priority: string; status: string; property: { propertyName: string; propertyCode: string } }>;
  duePayments: Array<{ id: number; month: number; year: number; amountDue: string; status: string; lease: { property: { propertyName: string; propertyCode: string }; tenant: { firstName: string; lastName: string } } }>;
  tenants: Array<{ id: number; firstName: string; lastName: string; email: string | null; phoneNumber: string | null; status: string }>;
  landlords?: Array<{ id: number; displayName: string; email: string | null; phoneNumber: string | null; commissionRate: number | string | null }>;
  contractors: Array<{ id: number; contractorName: string; speciality: string | null }>;
}

function getInitials(name?: string) {
  if (!name) return "JD";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "JD";
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Properties", href: "/properties" },
  { label: "Tenants", href: "/tenants" },
  { label: "Lease Tracker", href: "/leases" },
  { label: "Rent Tracker", href: "/payments" },
  { label: "25th Rates and Levies", href: "/rates-and-levies" },
  { label: "Landlords", href: "/landlords" },
  { label: "Maintenance", href: "/maintenance" },
  { label: "Contractors", href: "/contractors" },
];

export default function AgentHeader({ user }: AgentHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const navigateTo = (path: string) => {
    setIsSearchOpen(false);
    setQuery("");
    router.push(path);
  };

  const hasResults =
    results &&
    (results.properties.length > 0 ||
      results.tenants.length > 0 ||
      results.contractors.length > 0 ||
      results.maintenances?.length > 0 ||
      results.duePayments?.length > 0 ||
      (results.landlords && results.landlords.length > 0));

  const userName = user?.name || "John Doe";
  const userInitials = getInitials(user?.name);

  return (
    <header className="w-full bg-[#f4f3ef] dark:bg-[#0c1017] border-b border-neutral-200/60 dark:border-slate-800/80 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tier 1: Top Brand, Search Bar & Profile */}
        <div className="h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#135446] text-white shadow-xs group-hover:bg-[#0f4438] transition-colors">
              <Home size={20} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight font-sans">
                Property
              </p>
              <p className="text-[10px] tracking-widest uppercase font-semibold text-neutral-400 dark:text-neutral-500 leading-none">
                MANAGEMENT
              </p>
            </div>
          </Link>

          {/* Centered Search Bar */}
          <div className="flex-1 max-w-xl mx-4 relative" ref={searchContainerRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {loading ? (
                  <Loader2 className="h-4 w-4 text-[#135446] animate-spin" />
                ) : (
                  <Search className="h-4 w-4 text-neutral-400" />
                )}
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuery(val);
                  if (!val.trim() || val.length < 2) {
                    setResults(null);
                    setLoading(false);
                  }
                }}
                onFocus={() => query.length >= 2 && setIsSearchOpen(true)}
                placeholder="Search properties, tenants, contractors..."
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900/90 border border-neutral-200/80 dark:border-slate-700/80 rounded-full text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#135446]/20 focus:border-[#135446] transition-all"
              />
            </div>

            {/* Live Search Preview Dropdown */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-3 z-50 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                {!hasResults && !loading && (
                  <div className="px-5 py-6 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm">
                      No matching records found for &quot;
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{query}</span>
                      &quot;
                    </p>
                  </div>
                )}

                {/* Properties Category */}
                {results && results.properties.length > 0 && (
                  <div className="mb-3">
                    <div className="px-4 py-1.5 flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Building size={14} className="text-[#135446]" />
                        <span>Properties ({results.properties.length})</span>
                      </div>
                    </div>
                    {results.properties.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(`/properties`)}
                        className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-slate-800/50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#135446] dark:group-hover:text-emerald-400">
                              {item.propertyName}
                            </p>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                item.status === "AVAILABLE"
                                  ? "bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 text-emerald-700"
                                  : item.status === "OCCUPIED"
                                  ? "bg-red-100 dark:bg-red-950 dark:text-red-300 text-red-700"
                                  : "bg-blue-100 dark:bg-blue-950 dark:text-blue-300 text-blue-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {[item.address, item.city].filter(Boolean).join(", ")}
                          </p>
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-slate-300 dark:text-slate-600 group-hover:text-[#135446] opacity-0 group-hover:opacity-100 transition-all"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Maintenance Tickets */}
                {results && results.maintenances && results.maintenances.length > 0 && (
                  <div className="mb-3 border-t border-slate-100 dark:border-slate-800 pt-2">
                    <div className="px-4 py-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Wrench size={14} className="text-amber-500" />
                      <span>Maintenance Progress ({results.maintenances.length})</span>
                    </div>
                    {results.maintenances.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(`/maintenance`)}
                        className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-slate-800/50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 line-clamp-1">
                              {item.issueDescription}
                            </p>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">
                              {item.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">Property: {item.property?.propertyName}</p>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Due Rent Payments */}
                {results && results.duePayments && results.duePayments.length > 0 && (
                  <div className="mb-3 border-t border-slate-100 dark:border-slate-800 pt-2">
                    <div className="px-4 py-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <CreditCard size={14} className="text-rose-500" />
                      <span>Rent & Payments ({results.duePayments.length})</span>
                    </div>
                    {results.duePayments.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(`/payments`)}
                        className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-slate-800/50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {item.lease.property?.propertyName} - {item.lease.tenant?.firstName} {item.lease.tenant?.lastName}
                          </p>
                          <p className="text-xs text-slate-500">Due: R{item.amountDue} ({item.month}/{item.year})</p>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Tenants */}
                {results && results.tenants && results.tenants.length > 0 && (
                  <div className="mb-3 border-t border-slate-100 dark:border-slate-800 pt-2">
                    <div className="px-4 py-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Users size={14} className="text-blue-500" />
                      <span>Tenants ({results.tenants.length})</span>
                    </div>
                    {results.tenants.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(`/tenants`)}
                        className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-slate-800/50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {item.firstName} {item.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{item.email || item.phoneNumber || "No contact info"}</p>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Bell notification button */}
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-neutral-200/80 dark:border-slate-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-slate-700 shadow-xs transition-colors"
              aria-label="Notifications"
            >
              <Bell size={17} />
            </button>

            {/* Theme Toggle button */}
            <ThemeToggle />

            {/* Agent Account pill & dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-neutral-200/50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                aria-expanded={dropdownOpen}
                aria-label="Agent Account menu"
              >
                <div className="w-10 h-10 rounded-full bg-[#f3a838] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {userInitials}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    {userName}
                  </p>
                  <p className="text-[10px] tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 uppercase leading-tight">
                    {user?.role ? `${user.role} ACCOUNT` : "AGENT ACCOUNT"}
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-neutral-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-neutral-200/80 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-neutral-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Signed in as</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {user?.email || "agent@propops.com"}
                    </p>
                  </div>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors font-medium cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2: Sub-navbar Horizontal Navigation Pills + System Status */}
        <div className="py-2.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar border-t border-neutral-200/50 dark:border-slate-800/60">
          <nav className="flex items-center gap-1.5 shrink-0">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
                    isActive
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-xs"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2 shrink-0 pl-4 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
              All Systems Stable
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
