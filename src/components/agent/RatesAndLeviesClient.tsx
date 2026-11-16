"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Landmark,
  Search,
  Building2,
  Calendar,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  LayoutGrid,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { RatesAndLevyItem, RatesAndLevyEntryItem } from "@/types/ratesAndLevies";
import RatesAndLeviesModal from "@/components/agent/RatesAndLeviesModal";

const MONTH_SHORT_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatRand(val: number): string {
  if (!val || isNaN(val)) return "R0.00";
  return `R${val.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface CellEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number, paid: boolean) => Promise<void>;
  propertyName: string;
  accountName: string;
  monthName: string;
  year: number;
  initialAmount: number;
  initialPaid: boolean;
}

function CellEditModal({
  isOpen,
  onClose,
  onSave,
  propertyName,
  accountName,
  monthName,
  year,
  initialAmount,
  initialPaid,
}: CellEditModalProps) {
  const [amount, setAmount] = useState<number | "">(initialAmount);
  const [paid, setPaid] = useState<boolean>(initialPaid);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAmount(initialAmount);
    setPaid(initialPaid);
  }, [initialAmount, initialPaid, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(Number(amount) || 0, paid);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {monthName} {year} • Due 25th
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[220px]">
              {propertyName} ({accountName})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Amount (ZAR)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 1400.00"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-[#135446]"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Payment Status
            </span>
            <button
              type="button"
              onClick={() => setPaid(!paid)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                paid
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
              }`}
            >
              {paid ? "Paid" : "Due 25th"}
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#135446] hover:bg-[#0f4438] shadow-xs disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RatesAndLeviesClient() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [viewMode, setViewMode] = useState<"matrix" | "monthly">("matrix");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);

  const [items, setItems] = useState<RatesAndLevyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RatesAndLevyItem | null>(null);

  // Cell editing state
  const [cellEditState, setCellEditState] = useState<{
    isOpen: boolean;
    item: RatesAndLevyItem | null;
    month: number;
    amount: number;
    paid: boolean;
  }>({
    isOpen: false,
    item: null,
    month: 1,
    amount: 0,
    paid: false,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/rates-and-levies?year=${selectedYear}&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to load rates and levies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedYear]);

  // Handle cell edit save
  const handleSaveCell = async (amount: number, paid: boolean) => {
    if (!cellEditState.item) return;
    try {
      const res = await fetch(`/api/rates-and-levies/${cellEditState.item.id}?month=${cellEditState.month}&year=${selectedYear}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: cellEditState.month,
          year: selectedYear,
          amount,
          paid,
        }),
      });
      if (res.ok) {
        await fetchItems();
      }
    } catch (err) {
      console.error("Failed to save entry:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this rates & levy account and its payment history?")) return;
    try {
      const res = await fetch(`/api/rates-and-levies/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter((item) => {
      const pName = item.property.propertyName.toLowerCase();
      const pCode = item.property.propertyCode.toLowerCase();
      const aName = item.accountName.toLowerCase();
      const aNum = (item.accountNumber || "").toLowerCase();
      return pName.includes(s) || pCode.includes(s) || aName.includes(s) || aNum.includes(s);
    });
  }, [items, search]);

  // Calculate annual summary statistics
  const stats = useMemo(() => {
    let totalAnnualBilled = 0;
    let totalAnnualPaid = 0;
    const monthlyTotals = Array(12).fill(0);
    const monthlyPaidTotals = Array(12).fill(0);

    items.forEach((item) => {
      item.entries.forEach((e) => {
        if (e.year === selectedYear) {
          const amt = Number(e.amount) || 0;
          totalAnnualBilled += amt;
          if (e.month >= 1 && e.month <= 12) {
            monthlyTotals[e.month - 1] += amt;
            if (e.paid) {
              totalAnnualPaid += amt;
              monthlyPaidTotals[e.month - 1] += amt;
            }
          }
        }
      });
    });

    const totalAnnualOutstanding = totalAnnualBilled - totalAnnualPaid;
    const paymentRate = totalAnnualBilled > 0 ? Math.round((totalAnnualPaid / totalAnnualBilled) * 100) : 100;

    return {
      totalAccounts: items.length,
      totalAnnualBilled,
      totalAnnualPaid,
      totalAnnualOutstanding,
      paymentRate,
      monthlyTotals,
      monthlyPaidTotals,
    };
  }, [items, selectedYear]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-[#135446]/10 text-[#135446] dark:bg-emerald-950/60 dark:text-emerald-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                25th Rates & Levies Tracker
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#d7ece3] text-[#14533e] dark:bg-emerald-950/70 dark:text-emerald-300">
                Due 25th Monthly
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Monthly municipal rates, body corporate levies, water, and electricity due on the 25th
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year Navigator */}
          <div className="flex items-center bg-[#f4f3ef] dark:bg-slate-800 rounded-full px-2 py-1 border border-neutral-200/80 dark:border-slate-700">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 rounded-full transition-colors"
              title="Previous Year"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-bold text-neutral-900 dark:text-white">
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear((y) => y + 1)}
              className="p-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 rounded-full transition-colors"
              title="Next Year"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#f4f3ef] dark:bg-slate-800 rounded-full p-1 border border-neutral-200/80 dark:border-slate-700">
            <button
              onClick={() => setViewMode("matrix")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === "matrix"
                  ? "bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              }`}
            >
              <TableIcon size={14} />
              <span>12-Month Grid</span>
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === "monthly"
                  ? "bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              }`}
            >
              <Calendar size={14} />
              <span>Single Month</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#135446] hover:bg-[#0f4438] active:scale-[0.98] text-white rounded-full text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* ── Annual KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider">Registered Accounts</span>
            <Building2 className="w-4 h-4 text-[#135446]" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
            {stats.totalAccounts}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Properties with rates/levy profiles</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider">Annual Billed ({selectedYear})</span>
            <Calendar className="w-4 h-4 text-[#135446]" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
            {formatRand(stats.totalAnnualBilled)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Full 12-month projected total</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider">Settled (Paid)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatRand(stats.totalAnnualPaid)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">{stats.paymentRate}% paid compliance rate</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider">Outstanding / Due</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-[#c0392b]">
            {formatRand(stats.totalAnnualOutstanding)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Remaining for {selectedYear}</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search property or account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-700 rounded-full text-xs text-neutral-900 dark:text-white placeholder-neutral-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#135446]/20"
          />
        </div>

        {viewMode === "monthly" && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {MONTH_SHORT_NAMES.map((name, idx) => (
              <button
                key={name}
                onClick={() => setSelectedMonth(idx + 1)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedMonth === idx + 1
                    ? "bg-[#135446] text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Main Data View ── */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-neutral-400 bg-white dark:bg-slate-900 rounded-3xl border border-neutral-200/60 dark:border-slate-800">
          <RefreshCw className="w-7 h-7 animate-spin mb-3 text-[#135446]" />
          <span className="text-xs font-medium">Loading 25th rates and levies matrix...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-16 text-center text-neutral-400 bg-white dark:bg-slate-900 rounded-3xl border border-neutral-200/60 dark:border-slate-800">
          <Landmark className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-slate-600" />
          <p className="text-base font-bold text-neutral-800 dark:text-white">
            No rates or levies found
          </p>
          <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
            Add municipal rates accounts or body corporate levies using the &quot;Add Account&quot; button above.
          </p>
        </div>
      ) : viewMode === "matrix" ? (
        /* ── 12-MONTH MATRIX VIEW (Spreadsheet Structure) ── */
        <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f4f3ef]/80 dark:bg-slate-800/60 border-b border-neutral-200/80 dark:border-slate-800 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  <th className="py-4 px-4 sticky left-0 bg-[#f4f3ef] dark:bg-slate-800 z-10 min-w-[160px]">
                    Property
                  </th>
                  <th className="py-4 px-4 min-w-[150px]">Account / Provider</th>
                  {MONTH_SHORT_NAMES.map((m, idx) => (
                    <th key={m} className="py-4 px-3 text-center min-w-[90px]">
                      {m} 25
                    </th>
                  ))}
                  <th className="py-4 px-4 text-right min-w-[110px] font-bold">
                    Year Total
                  </th>
                  <th className="py-4 px-3 text-center min-w-[70px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-slate-800/80">
                {filteredItems.map((item) => {
                  let rowTotal = 0;
                  const entryByMonth = new Map<number, RatesAndLevyEntryItem>();
                  item.entries.forEach((e) => {
                    if (e.year === selectedYear) {
                      entryByMonth.set(e.month, e);
                      rowTotal += Number(e.amount) || 0;
                    }
                  });

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Property (Sticky Left) */}
                      <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-neutral-50/70 dark:group-hover:bg-slate-800/40 z-10 border-r border-neutral-100 dark:border-slate-800">
                        <div className="font-bold text-xs">{item.property.propertyName}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          ID: {item.property.propertyCode}
                        </div>
                      </td>

                      {/* Account / Provider */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-800 dark:text-slate-200">
                          {item.accountName}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {item.accountNumber || "No Account #"}
                        </div>
                      </td>

                      {/* 12 Monthly Columns */}
                      {MONTH_SHORT_NAMES.map((mName, idx) => {
                        const monthNum = idx + 1;
                        const entry = entryByMonth.get(monthNum);
                        const amount = entry ? Number(entry.amount) : 0;
                        const isPaid = entry?.paid || false;

                        return (
                          <td
                            key={mName}
                            onClick={() =>
                              setCellEditState({
                                isOpen: true,
                                item,
                                month: monthNum,
                                amount,
                                paid: isPaid,
                              })
                            }
                            className="py-3 px-2 text-center cursor-pointer hover:bg-[#135446]/5 dark:hover:bg-emerald-950/20 transition-all border-l border-neutral-100/60 dark:border-slate-800/50"
                            title={`Click to edit ${mName} ${selectedYear}`}
                          >
                            {entry ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="font-bold text-neutral-900 dark:text-white text-[11px]">
                                  R{amount.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold mt-0.5 ${
                                    isPaid
                                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                      : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                                  }`}
                                >
                                  {isPaid ? "Paid" : "Due"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-neutral-300 dark:text-slate-600 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Row Year Total */}
                      <td className="py-3 px-4 text-right font-extrabold text-neutral-900 dark:text-white border-l border-neutral-100 dark:border-slate-800">
                        {formatRand(rowTotal)}
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded-lg text-neutral-400 hover:text-[#135446] hover:bg-neutral-100 transition-colors"
                            title="Edit Account"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* ── Column Totals Summary Row ── */}
                <tr className="bg-[#f4f3ef] dark:bg-slate-800/80 font-bold border-t-2 border-neutral-300 dark:border-slate-700">
                  <td className="py-4 px-4 text-neutral-900 dark:text-white sticky left-0 bg-[#f4f3ef] dark:bg-slate-800 z-10 border-r border-neutral-200">
                    MONTHLY TOTALS
                  </td>
                  <td className="py-4 px-4 text-neutral-500 dark:text-neutral-400 text-[11px]">
                    All Properties Due 25th
                  </td>
                  {MONTH_SHORT_NAMES.map((m, idx) => (
                    <td key={m} className="py-4 px-2 text-center border-l border-neutral-200 dark:border-slate-700">
                      <div className="text-[11px] font-extrabold text-neutral-900 dark:text-white">
                        R{stats.monthlyTotals[idx].toLocaleString("en-ZA", { minimumFractionDigits: 0 })}
                      </div>
                      <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        R{stats.monthlyPaidTotals[idx].toLocaleString("en-ZA", { minimumFractionDigits: 0 })} pd
                      </div>
                    </td>
                  ))}
                  <td className="py-4 px-4 text-right font-extrabold text-sm text-[#135446] dark:text-emerald-400 border-l border-neutral-200 dark:border-slate-700">
                    {formatRand(stats.totalAnnualBilled)}
                  </td>
                  <td className="py-4 px-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── SINGLE MONTH DETAIL VIEW ── */
        <div className="bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f3ef]/80 dark:bg-slate-800/60 border-b border-neutral-200/80 dark:border-slate-800 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-4">Property</th>
                  <th className="py-4 px-4">Account / Provider</th>
                  <th className="py-4 px-4">Due Date</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                {filteredItems.map((item) => {
                  const entry = item.entries.find((e) => e.month === selectedMonth && e.year === selectedYear);
                  const isPaid = entry?.paid || false;
                  const amount = entry?.amount || 0;
                  const dueDate = entry?.dueDate || `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-25`;

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900 dark:text-white">
                          {item.property.propertyName}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          {item.property.propertyCode}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-800 dark:text-slate-200">
                        {item.accountName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-neutral-300 font-medium text-[11px]">
                          <Calendar size={12} className="text-neutral-400" />
                          {dueDate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                        {formatRand(amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() =>
                            setCellEditState({
                              isOpen: true,
                              item,
                              month: selectedMonth,
                              amount,
                              paid: isPaid,
                            })
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400"
                          }`}
                        >
                          {isPaid ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Clock size={13} className="text-amber-500" />}
                          {isPaid ? "Paid" : "Due 25th"}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-[#135446] hover:bg-neutral-100"
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Quick Cell Edit Modal ── */}
      <CellEditModal
        isOpen={cellEditState.isOpen}
        onClose={() => setCellEditState((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveCell}
        propertyName={cellEditState.item?.property.propertyName || ""}
        accountName={cellEditState.item?.accountName || ""}
        monthName={MONTH_SHORT_NAMES[cellEditState.month - 1] || ""}
        year={selectedYear}
        initialAmount={cellEditState.amount}
        initialPaid={cellEditState.paid}
      />

      {/* ── Full Account Modal ── */}
      <RatesAndLeviesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchItems}
        editingItem={editingItem}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </div>
  );
}
