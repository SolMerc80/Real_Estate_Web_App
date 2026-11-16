import { Handshake, Plus, Download, FileText } from "lucide-react";
import DocumentHeaderNav from "@/components/agent/DocumentHeaderNav";

export default function MemorandumPage() {
  return (
    <div className="space-y-6 pb-12 font-sans">
      <DocumentHeaderNav
        title="Memorandum of Agreement (MOA)"
        description="Formal agreement defining terms between property owners, agencies, and co-tenants."
      />

      <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Memorandum of Understanding / Agreement
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Draft official tripartite agreements, management mandates, or subleasing arrangements.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 dark:border-slate-700 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors">
              <Download size={14} />
              <span>Export Template</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#135446] hover:bg-[#0f4438] text-white text-xs font-bold shadow-xs transition-all">
              <Plus size={14} />
              <span>Draft New MOA</span>
            </button>
          </div>
        </div>

        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 mb-4 shadow-2xs">
            <Handshake size={32} />
          </div>
          <h3 className="text-base font-bold text-neutral-800 dark:text-slate-100">
            Memorandum of Agreement Drafting
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md">
            Define specific tenant conditions, commission sharing terms with landlords, or sub-division usage rules.
          </p>
        </div>
      </div>
    </div>
  );
}
