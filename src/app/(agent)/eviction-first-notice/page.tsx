import { AlertTriangle, Plus, Download, ShieldCheck } from "lucide-react";
import DocumentHeaderNav from "@/components/agent/DocumentHeaderNav";

export default function EvictionFirstNoticePage() {
  return (
    <div className="space-y-6 pb-12 font-sans">
      <DocumentHeaderNav
        title="Eviction 1st Notice (20-Day Breach Notice)"
        description="Statutory notice to remedy breach of lease in terms of Section 14 of the Consumer Protection Act (CPA)."
      />

      <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              First Eviction Warning & Notice to Remedy Breach
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Issue formal 20 business day notice to tenants in arrears or in default of lease conditions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 dark:border-slate-700 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors">
              <Download size={14} />
              <span>Download Blank Notice</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#135446] hover:bg-[#0f4438] text-white text-xs font-bold shadow-xs transition-all">
              <Plus size={14} />
              <span>Issue 1st Notice</span>
            </button>
          </div>
        </div>

        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 mb-4 shadow-2xs">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-base font-bold text-neutral-800 dark:text-slate-100">
            Section 14 CPA Notice Template
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md">
            Outlines unpaid balances, days remaining to settle arrears, and legal consequences prior to lease cancellation.
          </p>
        </div>
      </div>
    </div>
  );
}
