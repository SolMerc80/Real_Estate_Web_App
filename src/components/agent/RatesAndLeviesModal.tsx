"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, Landmark, DollarSign, Calendar, FileText } from "lucide-react";
import { RatesAndLevyItem } from "@/types/ratesAndLevies";

type PropertyOption = {
  id: number;
  propertyCode: string;
  propertyName: string;
};

type RatesAndLeviesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem: RatesAndLevyItem | null;
  selectedMonth: number;
  selectedYear: number;
};

export default function RatesAndLeviesModal({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
  selectedMonth,
  selectedYear,
}: RatesAndLeviesModalProps) {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [propertyId, setPropertyId] = useState<number | "">("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");
  const [paid, setPaid] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError(null);
      // Fetch properties
      setLoadingProperties(true);
      fetch("/api/property")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setProperties(
              data.map((p) => ({
                id: p.id,
                propertyCode: p.propertyCode,
                propertyName: p.propertyName,
              }))
            );
          }
        })
        .catch((err) => console.error("Error fetching properties:", err))
        .finally(() => setLoadingProperties(false));

      if (editingItem) {
        setPropertyId(editingItem.propertyId);
        setAccountName(editingItem.accountName);
        setAccountNumber(editingItem.accountNumber || "");
        setNotes(editingItem.notes || "");
        if (editingItem.currentEntry) {
          setAmount(editingItem.currentEntry.amount);
          setDueDate(editingItem.currentEntry.dueDate || "");
          setPaid(editingItem.currentEntry.paid);
        } else {
          setAmount("");
          setDueDate(`${selectedYear}-${String(selectedMonth).padStart(2, "0")}-25`);
          setPaid(false);
        }
      } else {
        setPropertyId("");
        setAccountName("");
        setAccountNumber("");
        setAmount("");
        setDueDate(`${selectedYear}-${String(selectedMonth).padStart(2, "0")}-25`);
        setPaid(false);
        setNotes("");
      }
    }
  }, [isOpen, editingItem, selectedMonth, selectedYear]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editingItem && !propertyId) {
      setError("Please select a property.");
      return;
    }
    if (!accountName.trim()) {
      setError("Account name is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        // PUT update
        const res = await fetch(`/api/rates-and-levies/${editingItem.id}?month=${selectedMonth}&year=${selectedYear}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountName: accountName.trim(),
            accountNumber: accountNumber.trim() || null,
            amount: amount === "" ? 0 : Number(amount),
            dueDate: dueDate || null,
            paid,
            notes: notes.trim() || null,
            month: selectedMonth,
            year: selectedYear,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to update account.");
        }
      } else {
        // POST create
        const res = await fetch("/api/rates-and-levies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: Number(propertyId),
            accountName: accountName.trim(),
            accountNumber: accountNumber.trim() || null,
            amount: amount === "" ? 0 : Number(amount),
            dueDate: dueDate || `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-25`,
            paid,
            notes: notes.trim() || null,
            month: selectedMonth,
            year: selectedYear,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to create account.");
        }
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {editingItem ? "Edit Rates & Levy Account" : "Add 25th Rates & Levy Account"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track municipal rates, body corporate levies, or utilities
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingItem && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Property *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(Number(e.target.value))}
                  disabled={loadingProperties}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a property...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.propertyCode} - {p.propertyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Account / Provider Name *
            </label>
            <input
              type="text"
              placeholder="e.g. City of Johannesburg, Body Corporate, Eskom"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Account / Reference Number
            </label>
            <input
              type="text"
              placeholder="e.g. 908123471"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Amount (ZAR)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Due Date (Default: 25th)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="paid-status"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="paid-status" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Mark as Paid for this billing cycle
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <textarea
                rows={2}
                placeholder="Optional notes or instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingItem ? "Update Account" : "Add Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

