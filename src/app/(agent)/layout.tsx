import { ReactNode } from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AgentLayoutClient from "@/components/agent/AgentLayoutClient";

export const dynamic = "force-dynamic";

interface AgentLayoutProps {
  children: ReactNode;
}

export default async function AgentLayout({ children }: AgentLayoutProps) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <AgentLayoutClient user={session}>{children}</AgentLayoutClient>;
}

