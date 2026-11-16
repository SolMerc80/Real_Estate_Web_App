"use client";

import React, { useState, useEffect } from "react";
import { X, DollarSign, Calendar, FileText, CheckCircle2, XCircle, Building2, User } from "lucide-react";
import { RentPaymentItem, RentPaymentLease } from "@/types/rentPayment";

interface RentPaymentModalProps {
  initialData?: RentPaymentItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export default function RentPaymentModal({ initialData, onClose, onSuccess }: RentPaymentModalProps) {
  const [leases, setLeases] = useState<RentPaymentLease[]>([]);
  const [loadingLeases, setLoadingLeases] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const [leaseId, setLeaseId] = useState<number | string>(initialData ? initialData.leaseId : "");
  const [year, setYear] = useState<number>(initialData ? initialData.year : currentDate.getFullYear());
  const [month, setMonth] = useState<number>(initialData ? initialData.month : currentDate.getMonth() + 1);
  const [amountDue, setAmountDue] = useState<string>(initialData ? String(initialData.amountDue) : "");
  const [amountPaid, setAmountPaid] = useState<string>(
    initialData && initialData.amountPaid !== undefined ? String(initialData.amountPaid) : ""
  );
  const [paymentDate, setPaymentDate] = useState<string>(initialData?.paymentDate || "");
  const [status, setStatus] = useState<string>(
    initialData ? (initialData.status === "PAID" ? "PAID" : "UNPAID") : "UNPAID"
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || "");

  // Load active leases when creating new entry
  useEffect(() => {
    if (!initialData) {
      const fetchLeases = async () => {
        try {
          setLoadingLeases(true);
          const res = await fetch("/api/lease");
          if (res.ok) {
            const data = await res.json();
            setLeases(data);
            if (data.length > 0 && !leaseId) {
              setLeaseId(data[0].id);
              setAmountDue(String(data[0].monthlyRent || 0));
            }
          }
        } catch (err) {
          console.error("Failed to load leases:", err);
        } finally {
          setLoadingLeases(false);
        }
      };
      fetchLeases();
    }
  }, [initialData]);

  // Handle Lease Selection changes
  const handleLeaseChange = (selectedId: string) => {
    setLeaseId(selectedId);
    const found = leases.find((l) => String(l.id) === selectedId);
    if (found) {
      setAmountDue(String(found.monthlyRent || 0));
      if (status === "PAID") {
        setAmountPaid(String(found.monthlyRent || 0));
      }
    }
  };

  // Status toggle handler
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    if (newStatus === "PAID") {
      if (!amountPaid || Number(amountPaid) === 0) {
        setAmountPaid(amountDue || "0");
      }
      if (!paymentDate) {
        setPaymentDate(new Date().toISOString().split("T")[0]);
      }
    } else if (newStatus === "UNPAID") {
      setAmountPaid("0");
      setPaymentDate("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (initialData) {
        // Edit existing rent payment
        const res = await fetch(`/api/rent-payment/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: Number(year),
            month: Number(month),
            amountDue: Number(amountDue),
            amountPaid: Number(amountPaid || 0),
            paymentDate: paymentDate || null,
            status: status === "PAID" ? "PAID" : "UNPAID",
            notes,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to update rent payment");
        }
      } else {
        // Create new rent payment
        const res = await fetch("/api/rent-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leaseId: Number(leaseId),
            year: Number(year),
            month: Number(month),
            amountDue: Number(amountDue),
            amountPaid: Number(amountPaid || 0),
            paymentDate: paymentDate || null,
            status: status === "PAID" ? "PAID" : "UNPAID",
            notes,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to record rent payment");
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {initialData ? "Edit Rent Payment" : "Record Rent Payment"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {initialData
                  ? `Updating record for Property ID #${initialData.propertyId}`
                  : "Track due amounts, payments, status, and tenant notes."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Property / Lease Selection */}
          {initialData ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 size={14} className="text-blue-500" />
                  {initialData.property?.propertyName || "Property"}
                </span>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  ID #{initialData.propertyId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {initialData.property?.address || "No address provided"}
              </p>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <User size={13} className="text-slate-400" />
                <span>Tenant: </span>
                <span className="font-bold">
                  {initialData.tenant?.firstName} {initialData.tenant?.lastName}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Property & Tenant Lease <span className="text-rose-500">*</span>
              </label>
              {loadingLeases ? (
                <div className="text-xs text-slate-400 py-2">Loading active property leases...</div>
              ) : leases.length === 0 ? (
                <div className="text-xs text-amber-600 dark:text-amber-400 py-2">
                  No leases available. Please create a property and tenant lease first.
                </div>
              ) : (
                <select
                  value={leaseId}
                  onChange={(e) => handleLeaseChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {leases.map((l: any) => (
                    <option key={l.id} value={l.id}>
                      Property #{l.propertyId} - {l.property?.propertyName} ({l.tenant?.firstName} {l.tenant?.lastName}) - R{Number(l.monthlyRent).toLocaleString()}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Year & Month */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" /> Year <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="2020"
                max="2035"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Month <span className="text-rose-500">*</span>
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} ({m.value})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Due & Amount Paid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Amount Due (R) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={amountDue}
                  onChange={(e) => setAmountDue(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Amount Paid (R)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmountPaid(val);
                    if (Number(val) >= Number(amountDue) && Number(amountDue) > 0) {
                      setStatus("PAID");
                      if (!paymentDate) {
                        setPaymentDate(new Date().toISOString().split("T")[0]);
                      }
                    } else if (Number(val) === 0) {
                      setStatus("UNPAID");
                    }
                  }}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Date & Status (Paid vs Unpaid Options) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Payment Status <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange("PAID")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    status === "PAID"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  }`}
                >
                  <CheckCircle2 size={14} />
                  Paid
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("UNPAID")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    status === "UNPAID"
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  }`}
                >
                  <XCircle size={14} />
                  Unpaid
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" />
              Notes / Remarks
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Paid via EFT reference #9482, partial cash payment, follow up on the 15th..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder-slate-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Saving..." : initialData ? "Save Changes" : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
