"use client";

import { ReactNode } from "react";
import AgentHeader from "@/components/agent/AgentHeader";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

interface AgentLayoutClientProps {
  children: ReactNode;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

export default function AgentLayoutClient({ children, user }: AgentLayoutClientProps) {
  return (
    <div className="min-h-screen min-w-full bg-[#f4f3ef] dark:bg-[#0c1017] text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors">
      <AgentHeader user={user} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}
