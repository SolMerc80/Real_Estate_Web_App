import { ShieldAlert, Plus, Download, FileWarning } from "lucide-react";
import DocumentHeaderNav from "@/components/agent/DocumentHeaderNav";

export default function EvictionFinalWarningPage() {
  return (
    <div className="space-y-6 pb-12 font-sans">
      <DocumentHeaderNav
        title="Eviction Final Warning & Cancellation"
        description="Formal cancellation of lease agreement and demand to vacate following expiry of the 20-day notice."
      />

      <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Final Eviction Warning & Cancellation Notice
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Confirm cancellation of the lease agreement and issue final demand for handover of keys.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 dark:border-slate-700 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors">
              <Download size={14} />
              <span>Download PDF Notice</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all">
              <Plus size={14} />
              <span>Issue Final Warning</span>
            </button>
          </div>
        </div>

        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 mb-4 shadow-2xs">
            <ShieldAlert size={32} />
          </div>
          <h3 className="text-base font-bold text-neutral-800 dark:text-slate-100">
            Final Cancellation & Eviction Notice
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md">
            Prepared for sheriff service or immediate handover with legal references for unlawful occupation proceedings under the PIE Act.
          </p>
        </div>
      </div>
    </div>
  );
}
