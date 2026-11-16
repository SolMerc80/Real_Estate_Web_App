"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  FileText,
  Calculator,
} from "lucide-react";
import { RentPaymentItem, RentPaymentStatus } from "@/types/rentPayment";
import RentPaymentModal from "@/components/agent/RentPaymentModal";

type StatusTab = "ALL" | "PAID" | "UNPAID";
type SortField = "propertyId" | "propertyName" | "tenantName" | "yearMonth" | "amountDue" | "amountPaid" | "paymentDate" | "status";
type SortOrder = "asc" | "desc";

const MONTH_NAMES = [
  "",
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

const MONTH_FULL_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function RentTrackerClient() {
  const [payments, setPayments] = useState<RentPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("yearMonth");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Inline editing notes state
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState<string>("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RentPaymentItem | null>(null);

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rent-payment");
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (error) {
      console.error("Failed to load rent payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Compute unique years present for filter dropdown
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    payments.forEach((p) => {
      if (p.year) yearsSet.add(p.year);
    });
    yearsSet.add(new Date().getFullYear());
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [payments]);

  // Toggle paid/unpaid status directly
  const handleToggleStatus = async (payment: RentPaymentItem) => {
    try {
      const res = await fetch(`/api/rent-payment/${payment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleStatus: true }),
      });

      if (res.ok) {
        const updated = await res.json();
        setPayments((prev) =>
          prev.map((item) => (item.id === payment.id ? { ...item, ...updated } : item))
        );
      }
    } catch (err) {
      console.error("Failed to toggle payment status:", err);
    }
  };

  // Inline update notes
  const handleSaveNote = async (id: number) => {
    try {
      const res = await fetch(`/api/rent-payment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: tempNote }),
      });

      if (res.ok) {
        setPayments((prev) =>
          prev.map((item) => (item.id === id ? { ...item, notes: tempNote } : item))
        );
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setEditingNoteId(null);
    }
  };

  // Delete payment
  const handleDeletePayment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this rent payment entry?")) {
      return;
    }

    try {
      const res = await fetch(`/api/rent-payment/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPayments((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete payment:", err);
    }
  };

  // Filter and sort payments
  const filteredAndSortedPayments = useMemo(() => {
    let list = payments.filter((item) => {
      // Tab filter (ALL, PAID, UNPAID)
      if (activeTab === "PAID" && item.status !== "PAID") return false;
      if (activeTab === "UNPAID" && item.status === "PAID") return false;

      // Year filter
      if (selectedYear !== "ALL" && String(item.year) !== selectedYear) {
        return false;
      }

      // Month filter
      if (selectedMonth !== "ALL" && String(item.month) !== selectedMonth) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const propId = String(item.propertyId);
        const propCode = (item.property?.propertyCode || "").toLowerCase();
        const propName = (item.property?.propertyName || "").toLowerCase();
        const propAddr = (item.property?.address || "").toLowerCase();
        const tenantName = `${item.tenant?.firstName || ""} ${item.tenant?.lastName || ""}`.toLowerCase();
        const notes = (item.notes || "").toLowerCase();
        const monthName = (MONTH_FULL_NAMES[item.month] || "").toLowerCase();

        return (
          propId.includes(q) ||
          propCode.includes(q) ||
          propName.includes(q) ||
          propAddr.includes(q) ||
          tenantName.includes(q) ||
          notes.includes(q) ||
          monthName.includes(q)
        );
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === "propertyId") {
        comparison = a.propertyId - b.propertyId;
      } else if (sortField === "propertyName") {
        comparison = (a.property?.propertyName || "").localeCompare(b.property?.propertyName || "");
      } else if (sortField === "tenantName") {
        const nameA = `${a.tenant?.firstName || ""} ${a.tenant?.lastName || ""}`;
        const nameB = `${b.tenant?.firstName || ""} ${b.tenant?.lastName || ""}`;
        comparison = nameA.localeCompare(nameB);
      } else if (sortField === "yearMonth") {
        const dateA = a.year * 100 + a.month;
        const dateB = b.year * 100 + b.month;
        comparison = dateA - dateB;
      } else if (sortField === "amountDue") {
        comparison = a.amountDue - b.amountDue;
      } else if (sortField === "amountPaid") {
        comparison = a.amountPaid - b.amountPaid;
      } else if (sortField === "paymentDate") {
        const timeA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const timeB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortField === "status") {
        comparison = a.status.localeCompare(b.status);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return list;
  }, [payments, activeTab, selectedYear, selectedMonth, searchQuery, sortField, sortOrder]);

  // Dynamic Totals calculation for the Totals Row
  const totals = useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;
    let totalPaidCount = 0;
    let totalUnpaidCount = 0;

    filteredAndSortedPayments.forEach((p) => {
      totalDue += p.amountDue || 0;
      totalPaid += p.amountPaid || 0;
      if (p.status === "PAID") {
        totalPaidCount++;
      } else {
        totalUnpaidCount++;
      }
    });

    const totalBalance = totalDue - totalPaid;

    return {
      count: filteredAndSortedPayments.length,
      totalDue,
      totalPaid,
      totalBalance,
      totalPaidCount,
      totalUnpaidCount,
    };
  }, [filteredAndSortedPayments]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 p-8 text-white shadow-2xl">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-blue-300 shadow-inner">
              <CreditCard className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                Rent Tracker
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
                  Rent Ledger
                </span>
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Real-time tracking of monthly rent schedules, collected payments, unpaid balances, and tenant payment notes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPayments}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-sm"
              title="Refresh rent payments"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => {
                setEditingPayment(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Record Payment
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rent Due */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Rent Due</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            R{totals.totalDue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across {totals.count} tracked records</p>
        </div>

        {/* Total Collected */}
        <div className="p-5 rounded-2xl border bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <span>Total Collected (Paid)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            R{totals.totalPaid.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-600/80 mt-1">{totals.totalPaidCount} fully paid entries</p>
        </div>

        {/* Outstanding / Unpaid */}
        <div className="p-5 rounded-2xl border bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-300 text-xs font-medium">
            <span>Outstanding Balance</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            R{totals.totalBalance.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-rose-600/80 mt-1">{totals.totalUnpaidCount} unpaid / pending entries</p>
        </div>

        {/* Collection Rate */}
        <div className="p-5 rounded-2xl border bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 shadow-sm">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 text-xs font-medium">
            <span>Collection Rate</span>
            <Calculator className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            {totals.totalDue > 0
              ? `${Math.round((totals.totalPaid / totals.totalDue) * 100)}%`
              : "100%"}
          </p>
          <p className="text-[11px] text-indigo-500/80 mt-1">Current collection efficiency</p>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Property ID, Name, Address, or Tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {/* Filters: Status Tabs + Year + Month Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "ALL"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setActiveTab("PAID")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "PAID"
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setActiveTab("UNPAID")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "UNPAID"
                  ? "bg-rose-600 text-white shadow-sm font-bold"
                  : "text-rose-600 dark:text-rose-400 hover:text-rose-700"
              }`}
            >
              Unpaid
            </button>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
            <span className="text-slate-400 font-semibold">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={String(yr)}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
            <span className="text-slate-400 font-semibold">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Months</option>
              {MONTH_FULL_NAMES.slice(1).map((mName, idx) => (
                <option key={idx + 1} value={String(idx + 1)}>
                  {mName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Main Rent Tracker Table */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading rent tracker records...</p>
        </div>
      ) : filteredAndSortedPayments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40 text-center">
          <div className="bg-blue-50 dark:bg-blue-950/60 p-4 rounded-full mb-4 text-blue-500 dark:text-blue-400">
            <CreditCard size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
            No rent payment records found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm mb-6">
            {searchQuery
              ? `No records match "${searchQuery}".`
              : activeTab !== "ALL"
              ? `There are currently no rent payments marked as "${activeTab}".`
              : "Record your first rent payment entry to start tracking collections."}
          </p>
          <button
            onClick={() => {
              setEditingPayment(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            <Plus size={16} /> Record Rent Payment
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border-spacing-0">
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-800 border-b-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                  {/* 1. Property ID */}
                  <th
                    onClick={() => handleSort("propertyId")}
                    className="py-4 px-4 whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Property ID</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  {/* 2. Property Name / Address */}
                  <th
                    onClick={() => handleSort("propertyName")}
                    className="py-4 px-4 whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Property Name / Address</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  {/* 3. Property / Tenant */}
                  <th
                    onClick={() => handleSort("tenantName")}
                    className="py-4 px-4 whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Tenant</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  {/* 4. Year */}
                  <th className="py-4 px-3 text-center whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80">
                    Year
                  </th>

                  {/* 5. Month */}
                  <th
                    onClick={() => handleSort("yearMonth")}
                    className="py-4 px-3 text-center whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Month</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  {/* 6. Amount Due */}
                  <th
                    onClick={() => handleSort("amountDue")}
                    className="py-4 px-4 text-right whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Amount Due</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  {/* 7. Amount Paid */}
                  <th
                    onClick={() => handleSort("amountPaid")}
                    className="py-4 px-4 text-right whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Amount Paid</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  {/* 8. Payment Date */}
                  <th
                    onClick={() => handleSort("paymentDate")}
                    className="py-4 px-4 whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Payment Date</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  {/* 9. Status */}
                  <th
                    onClick={() => handleSort("status")}
                    className="py-4 px-4 text-center whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Status</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>

                  {/* 10. Notes */}
                  <th className="py-4 px-4 min-w-[200px] border-r border-slate-200 dark:border-slate-700/80">
                    Notes
                  </th>

                  {/* Actions */}
                  <th className="py-4 px-4 text-right whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800 text-sm">
                {filteredAndSortedPayments.map((payment) => {
                  const isPaid = payment.status === "PAID";
                  const isPartial = payment.status === "PARTIAL";

                  return (
                    <tr
                      key={payment.id}
                      className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors ${
                        isPaid
                          ? "bg-emerald-50/15 dark:bg-emerald-950/10"
                          : "bg-rose-50/20 dark:bg-rose-950/10"
                      }`}
                    >
                      {/* 1. Property ID */}
                      <td className="py-3.5 px-4 align-middle border-r border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60 w-fit">
                            ID #{payment.propertyId}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {payment.property?.propertyCode || "—"}
                          </span>
                        </div>
                      </td>

                      {/* 2. Property Name / Address */}
                      <td className="py-3.5 px-4 align-middle max-w-xs border-r border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {payment.property?.propertyName || "Property"}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {[payment.property?.address, payment.property?.city].filter(Boolean).join(", ") || "—"}
                          </span>
                        </div>
                      </td>

                      {/* 3. Property / Tenant */}
                      <td className="py-3.5 px-4 align-middle border-r border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            {payment.tenant?.firstName} {payment.tenant?.lastName}
                          </span>
                          {payment.tenant?.phoneNumber && (
                            <span className="text-[11px] text-slate-400 mt-0.5">
                              {payment.tenant.phoneNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Year */}
                      <td className="py-3.5 px-3 text-center align-middle font-mono text-xs font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                        {payment.year}
                      </td>

                      {/* 5. Month */}
                      <td className="py-3.5 px-3 text-center align-middle border-r border-slate-200 dark:border-slate-800">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                          {MONTH_NAMES[payment.month]}
                        </span>
                      </td>

                      {/* 6. Amount Due */}
                      <td className="py-3.5 px-4 text-right align-middle font-bold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">
                        R{payment.amountDue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                      </td>

                      {/* 7. Amount Paid */}
                      <td className="py-3.5 px-4 text-right align-middle border-r border-slate-200 dark:border-slate-800">
                        <span
                          className={`font-bold ${
                            isPaid
                              ? "text-emerald-600 dark:text-emerald-400"
                              : payment.amountPaid > 0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          R{payment.amountPaid.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* 8. Payment Date */}
                      <td className="py-3.5 px-4 align-middle text-xs border-r border-slate-200 dark:border-slate-800">
                        {payment.paymentDate ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                            <Calendar size={13} className="text-slate-400" />
                            {payment.paymentDate}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unpaid</span>
                        )}
                      </td>

                      {/* 9. Status (Paid and Unpaid options toggle) */}
                      <td className="py-3.5 px-4 align-middle text-center border-r border-slate-200 dark:border-slate-800">
                        <div className="inline-flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => payment.status !== "PAID" && handleToggleStatus(payment)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                              isPaid
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-emerald-600"
                            }`}
                            title="Mark as Paid"
                          >
                            <CheckCircle2 size={12} />
                            Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => payment.status === "PAID" && handleToggleStatus(payment)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                              !isPaid
                                ? "bg-rose-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-rose-600"
                            }`}
                            title="Mark as Unpaid"
                          >
                            <XCircle size={12} />
                            Unpaid
                          </button>
                        </div>
                      </td>

                      {/* 10. Notes (inline editable) */}
                      <td className="py-3.5 px-4 align-middle border-r border-slate-200 dark:border-slate-800">
                        {editingNoteId === payment.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={tempNote}
                              onChange={(e) => setTempNote(e.target.value)}
                              className="w-full text-xs px-2 py-1 rounded border border-blue-400 bg-white dark:bg-slate-800 outline-none"
                              placeholder="Add notes..."
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveNote(payment.id);
                                if (e.key === "Escape") setEditingNoteId(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveNote(payment.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Save Note"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingNoteId(payment.id);
                              setTempNote(payment.notes || "");
                            }}
                            className="group/note cursor-pointer flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600"
                            title="Click to edit note"
                          >
                            <span className="line-clamp-2 italic">
                              {payment.notes || <span className="text-slate-400 not-italic">+ Add note</span>}
                            </span>
                            <Edit2 size={12} className="opacity-0 group-hover/note:opacity-100 text-slate-400 ml-1 shrink-0" />
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingPayment(payment);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* 11. ROW FOR TOTALS (Calculates all total amounts) */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-extrabold text-xs tracking-wider border-t-4 border-blue-600 shadow-inner">
                  {/* Property ID summary */}
                  <td className="py-4 px-4 border-r border-slate-700/80">
                    <span className="font-mono text-blue-300 uppercase">
                      TOTALS
                    </span>
                  </td>

                  {/* Property Name/Address column */}
                  <td className="py-4 px-4 border-r border-slate-700/80">
                    <span>{totals.count} Payment Records</span>
                  </td>

                  {/* Tenant column */}
                  <td className="py-4 px-4 border-r border-slate-700/80">
                    <span className="text-slate-300 font-medium">
                      {totals.totalPaidCount} Paid / {totals.totalUnpaidCount} Unpaid
                    </span>
                  </td>

                  {/* Year */}
                  <td className="py-4 px-3 text-center border-r border-slate-700/80 text-slate-400">
                    —
                  </td>

                  {/* Month */}
                  <td className="py-4 px-3 text-center border-r border-slate-700/80 text-slate-400">
                    —
                  </td>

                  {/* TOTAL AMOUNT DUE */}
                  <td className="py-4 px-4 text-right border-r border-slate-700/80 text-white text-sm font-black">
                    <span className="text-xs text-blue-300 font-semibold block uppercase tracking-tight">Total Due</span>
                    R{totals.totalDue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </td>

                  {/* TOTAL AMOUNT PAID */}
                  <td className="py-4 px-4 text-right border-r border-slate-700/80 text-emerald-400 text-sm font-black">
                    <span className="text-xs text-emerald-300 font-semibold block uppercase tracking-tight">Total Paid</span>
                    R{totals.totalPaid.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </td>

                  {/* Payment Date column */}
                  <td className="py-4 px-4 border-r border-slate-700/80 text-rose-300 font-bold">
                    <span className="text-xs text-slate-400 font-semibold block uppercase tracking-tight">Balance Due</span>
                    R{totals.totalBalance.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </td>

                  {/* Status summary */}
                  <td className="py-4 px-4 text-center border-r border-slate-700/80">
                    <span className="px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[11px] font-bold">
                      {totals.totalDue > 0
                        ? `${Math.round((totals.totalPaid / totals.totalDue) * 100)}% Cleared`
                        : "N/A"}
                    </span>
                  </td>

                  {/* Notes summary */}
                  <td className="py-4 px-4 border-r border-slate-700/80 text-[11px] text-slate-400 font-normal italic">
                    Summary across current filter view
                  </td>

                  {/* Actions column */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 underline font-semibold"
                    >
                      Back to top
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Rent Payment Modal */}
      {isModalOpen && (
        <RentPaymentModal
          initialData={editingPayment}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPayment(null);
          }}
          onSuccess={fetchPayments}
        />
      )}
    </div>
  );
}
