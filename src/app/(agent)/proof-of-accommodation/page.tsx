import { BadgeCheck, Plus, Download, Printer } from "lucide-react";
import DocumentHeaderNav from "@/components/agent/DocumentHeaderNav";

export default function ProofOfAccommodationPage() {
  return (
    <div className="space-y-6 pb-12 font-sans">
      <DocumentHeaderNav
        title="Proof of Accommodation Certificate"
        description="Official certificate confirming residential address and active tenancy status for banks, universities, and FICA."
      />

      <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Proof of Accommodation Generator
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Issue verified letters of accommodation for verified tenants with property details, lease validity, and agency seal.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 dark:border-slate-700 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors">
              <Printer size={14} />
              <span>Print Letter</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#135446] hover:bg-[#0f4438] text-white text-xs font-bold shadow-xs transition-all">
              <Plus size={14} />
              <span>Generate Certificate</span>
            </button>
          </div>
        </div>

        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#d7ece3] dark:bg-emerald-950/50 flex items-center justify-center text-[#14533e] dark:text-emerald-300 mb-4 shadow-2xs">
            <BadgeCheck size={32} />
          </div>
          <h3 className="text-base font-bold text-neutral-800 dark:text-slate-100">
            FICA Proof of Residence Letter
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md">
            Automatically pulls tenant details, property address, sub-division ID, lease start date, and expiry date into a clean letterhead format ready for PDF export.
          </p>
        </div>
      </div>
    </div>
  );
}
