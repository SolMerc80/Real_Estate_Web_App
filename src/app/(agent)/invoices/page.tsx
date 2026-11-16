import { Receipt, Plus, Download, Printer, Search } from "lucide-react";
import DocumentHeaderNav from "@/components/agent/DocumentHeaderNav";

export default function InvoicesPage() {
  return (
    <div className="space-y-6 pb-12 font-sans">
      <DocumentHeaderNav
        title="Tenant Invoices & Billing"
        description="Generate, track, and dispatch monthly rent invoices, utilities, and municipal recharge statements."
      />

      <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Invoice Generation & Register
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Select an active lease to compile an official tax invoice with banking details and payment reference.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 dark:border-slate-700 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors">
              <Printer size={14} />
              <span>Print Batch</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#135446] hover:bg-[#0f4438] text-white text-xs font-bold shadow-xs transition-all">
              <Plus size={14} />
              <span>Create New Invoice</span>
            </button>
          </div>
        </div>

        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 mb-4 shadow-2xs">
            <Receipt size={32} />
          </div>
          <h3 className="text-base font-bold text-neutral-800 dark:text-slate-100">
            Tenant Invoice Generator
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md">
            Automates the compilation of monthly rental invoices pulling from active leases, utilities, and levy recoveries with standard South African banking instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
