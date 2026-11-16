"use client"

import {
    Home,
    Building,
    UserCheck,
    Wrench,
    PanelLeftClose,
    FileText,
    CreditCard,
    HardHat,
    Landmark,
    LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AgentSidebarProps = {
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
}

type NavItem = { label: string; href: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Properties", href: "/properties", icon: Building },
    { label: "Lease Tracker", href: "/leases", icon: FileText },
    { label: "Rent Tracker", href: "/payments", icon: CreditCard },
    { label: "25th Rates and Levies", href: "/rates-and-levies", icon: Landmark },
    { label: "Landlords", href: "/landlords", icon: UserCheck },
    { label: "Maintenance", href: "/maintenance", icon: Wrench },
    { label: "Contractors", href: "/contractors", icon: HardHat },
    { label: "Documents", href: "/documents", icon: FileText },
];

export default function AgentSidebar({ isCollapsed, setIsCollapsed }: AgentSidebarProps) {
    const sidebarWidth = isCollapsed ? "w-20" : "w-64";
    const pathname = usePathname();

    return (
        <aside
            className={`
                fixed top-0 left-0 z-40 h-screen
                bg-white dark:bg-[#161c2d]
                border-r border-slate-200 dark:border-white/5
                text-slate-600 dark:text-slate-300
                transition-all duration-300 ease-in-out
                ${sidebarWidth}
                flex flex-col
                overflow-hidden
            `}
        >
            {/* Brand block */}
            <div className="p-4 flex items-center justify-between gap-2 shrink-0 h-16">
                <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 min-w-0 ${
                    isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                }`}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500">
                        <Home size={16} className="text-white" />
                    </div>
                    <div className="whitespace-nowrap">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            Property
                        </p>
                        <p className="text-[10px] tracking-wide text-slate-400 dark:text-slate-500">
                            MANAGEMENT
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors shrink-0 text-slate-500 dark:text-slate-400"
                    aria-label="Toggle sidebar"
                >
                    <PanelLeftClose size={20} className={`transition-transform duration-300 ${
                        isCollapsed ? "rotate-180" : ""
                    }`} />
                </button>
            </div>

            <nav className="px-2 flex-1 overflow-y-auto overflow-x-hidden">
                <div className="space-y-1">
                    {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href;

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 rounded-lg p-3 overflow-hidden transition-colors ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-600 font-medium dark:bg-indigo-500/15 dark:text-indigo-300"
                                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                                }`}
                            >
                                <Icon size={20} className="shrink-0" />
                                <span className={`whitespace-nowrap transition-all duration-300 ${
                                    isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                                }`}>{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Status footer */}
            <div className="flex items-center gap-2 border-t border-slate-100 dark:border-white/5 px-5 py-4 text-xs text-slate-400 shrink-0">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                <span className={`whitespace-nowrap transition-all duration-300 ${
                    isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                }`}>All Systems Stable</span>
            </div>
        </aside>
    )
}
