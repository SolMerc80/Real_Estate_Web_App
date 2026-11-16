"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  MapPin,
  DollarSign,
  User,
  Phone,
  Mail,
  RefreshCw,
  Info,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Layers,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import Link from 'next/link';
import { LeaseItem, LeaseTrackerStatus } from '@/types/lease';

type FilterTab = 'ALL' | 'CRITICAL' | 'EXPIRING_SOON' | 'ACTIVE' | 'EXPIRED';
type SortField = 'daysRemaining' | 'endDate' | 'monthlyRent' | 'propertyName' | 'tenantName';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

export default function LeaseTrackerClient() {
  const [leases, setLeases] = useState<LeaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('daysRemaining');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/lease');
      if (res.ok) {
        const data = await res.json();
        setLeases(data);
      }
    } catch (error) {
      console.error('Failed to load leases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  // Compute status metrics
  const stats = useMemo(() => {
    const total = leases.length;
    const critical = leases.filter((l) => l.calculatedStatus === 'CRITICAL').length;
    const expiringSoon = leases.filter((l) => l.calculatedStatus === 'EXPIRING_SOON').length;
    const active = leases.filter((l) => l.calculatedStatus === 'ACTIVE').length;
    const expired = leases.filter((l) => l.calculatedStatus === 'EXPIRED').length;

    const totalRent = leases.reduce((sum, l) => sum + (l.monthlyRent || 0), 0);

    return { total, critical, expiringSoon, active, expired, totalRent };
  }, [leases]);

  // Filter and Sort leases
  const filteredAndSortedLeases = useMemo(() => {
    let result = leases.filter((lease) => {
      // Tab filter
      if (activeTab !== 'ALL' && lease.calculatedStatus !== activeTab) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const tenantName = `${lease.tenant?.firstName || ''} ${lease.tenant?.lastName || ''}`.toLowerCase();
        const propName = (lease.property?.propertyName || '').toLowerCase();
        const propAddress = (lease.property?.address || '').toLowerCase();
        const propCode = (lease.property?.propertyCode || '').toLowerCase();
        const propId = String(lease.propertyId);
        const city = (lease.property?.city || '').toLowerCase();

        return (
          tenantName.includes(query) ||
          propName.includes(query) ||
          propAddress.includes(query) ||
          propCode.includes(query) ||
          propId.includes(query) ||
          city.includes(query)
        );
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'daysRemaining') {
        comparison = a.daysRemaining - b.daysRemaining;
      } else if (sortField === 'endDate') {
        comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      } else if (sortField === 'monthlyRent') {
        comparison = (a.monthlyRent || 0) - (b.monthlyRent || 0);
      } else if (sortField === 'propertyName') {
        comparison = (a.property?.propertyName || '').localeCompare(b.property?.propertyName || '');
      } else if (sortField === 'tenantName') {
        const nameA = `${a.tenant?.firstName} ${a.tenant?.lastName}`;
        const nameB = `${b.tenant?.firstName} ${b.tenant?.lastName}`;
        comparison = nameA.localeCompare(nameB);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [leases, activeTab, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: LeaseTrackerStatus, daysRemaining: number) => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900 shadow-sm animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Critical
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Expiring Soon
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Active
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  const getDaysRemainingDisplay = (days: number, status: LeaseTrackerStatus) => {
    if (days < 0) {
      const absDays = Math.abs(days);
      return (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Expired</span>
          <span className="text-[11px] text-slate-400">{absDays} {absDays === 1 ? 'day' : 'days'} ago</span>
        </div>
      );
    }
    if (days === 0) {
      return (
        <div className="flex flex-col">
          <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">Expires Today</span>
          <span className="text-[11px] text-rose-500">0 days left</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col">
        <span className={`font-bold text-sm ${
          status === 'CRITICAL'
            ? 'text-rose-600 dark:text-rose-400'
            : status === 'EXPIRING_SOON'
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-emerald-600 dark:text-emerald-400'
        }`}>
          {days} {days === 1 ? 'day' : 'days'}
        </span>
        <span className="text-[11px] text-slate-400">remaining</span>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 p-8 text-white shadow-2xl">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-blue-300 shadow-inner">
                <Clock className="w-7 h-7" />
              </span>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                  Lease Tracker
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 backdrop-blur-md">
                    Live Status
                  </span>
                </h1>
                <p className="text-slate-300 text-sm mt-1">
                  Track lease lifecycles, impending expirations, renewal timelines, and active tenancy terms.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLeases}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-sm"
              title="Refresh Lease Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/tenants"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              <User className="w-4 h-4" />
              Manage Tenants
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Status Legend Section (Highlighted Requirement) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Status Thresholds & Legend
            </h2>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
            Automated status updates based on remaining days
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Critical */}
          <div className="relative p-4 rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/70 dark:bg-rose-950/20 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                Critical
              </span>
              <span className="text-xs font-extrabold text-rose-700 dark:text-rose-300 font-mono bg-rose-100/80 dark:bg-rose-900/40 px-2 py-0.5 rounded">
                &le; 30 Days
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                Immediate Action Required
              </p>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                Lease expires within 30 days. Priority for urgent renewal or move-out checklist.
              </p>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="relative p-4 rounded-xl border border-amber-200 dark:border-amber-950/60 bg-amber-50/70 dark:bg-amber-950/20 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <Clock className="w-3.5 h-3.5" />
                Expiring Soon
              </span>
              <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 font-mono bg-amber-100/80 dark:bg-amber-900/40 px-2 py-0.5 rounded">
                &le; 90 Days
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Upcoming Expiration Notice
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                Remaining time between 31 and 90 days. Ideal window for renewal negotiation.
              </p>
            </div>
          </div>

          {/* Active */}
          <div className="relative p-4 rounded-xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/70 dark:bg-emerald-950/20 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 font-mono bg-emerald-100/80 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
                &gt; 90 Days
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                Stable Term
              </p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                Healthy lease with more than 3 months of term remaining. Standard management.
              </p>
            </div>
          </div>

          {/* Expired */}
          <div className="relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                <XCircle className="w-3.5 h-3.5" />
                Expired
              </span>
              <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400 font-mono bg-slate-200/80 dark:bg-slate-700/80 px-2 py-0.5 rounded">
                &lt; 0 Days
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Past Due Term
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Lease end date has passed or lease status is marked as expired/terminated.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Metric KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          onClick={() => setActiveTab('ALL')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 ${
            activeTab === 'ALL'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Leases</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {stats.total}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">All managed properties</p>
        </div>

        <div
          onClick={() => setActiveTab('CRITICAL')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 ${
            activeTab === 'CRITICAL'
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs font-medium">
            <span>Critical (&le;30d)</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {stats.critical}
          </p>
          <p className="text-[11px] text-rose-500/80 mt-1">Immediate renewal</p>
        </div>

        <div
          onClick={() => setActiveTab('EXPIRING_SOON')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 ${
            activeTab === 'EXPIRING_SOON'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-medium">
            <span>Expiring (&le;90d)</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {stats.expiringSoon}
          </p>
          <p className="text-[11px] text-amber-500/80 mt-1">Next 3 months</p>
        </div>

        <div
          onClick={() => setActiveTab('ACTIVE')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 ${
            activeTab === 'ACTIVE'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <span>Active (&gt;90d)</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.active}
          </p>
          <p className="text-[11px] text-emerald-500/80 mt-1">Healthy terms</p>
        </div>

        <div
          onClick={() => setActiveTab('EXPIRED')}
          className={`col-span-2 sm:col-span-1 cursor-pointer p-5 rounded-2xl border transition-all duration-200 ${
            activeTab === 'EXPIRED'
              ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Expired</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 mt-2">
            {stats.expired}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Term ended</p>
        </div>
      </div>

      {/* 4. Controls: Search, Filter Tabs, and View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Property ID, Address, Name, or Tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('CRITICAL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'CRITICAL'
                  ? 'bg-rose-500 text-white shadow-sm font-bold'
                  : 'text-rose-600 dark:text-rose-400 hover:text-rose-700'
              }`}
            >
              Critical ({stats.critical})
            </button>
            <button
              onClick={() => setActiveTab('EXPIRING_SOON')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'EXPIRING_SOON'
                  ? 'bg-amber-500 text-white shadow-sm font-bold'
                  : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
              }`}
            >
              Expiring Soon ({stats.expiringSoon})
            </button>
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setActiveTab('EXPIRED')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'EXPIRED'
                  ? 'bg-slate-700 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Expired ({stats.expired})
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <ListIcon size={16} />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Grid Cards"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Main Lease Data Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading lease tracker records...</p>
        </div>
      ) : filteredAndSortedLeases.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40 text-center">
          <div className="bg-blue-50 dark:bg-blue-950/60 p-4 rounded-full mb-4 text-blue-500 dark:text-blue-400">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
            No leases found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm mb-6">
            {searchQuery
              ? `No lease records match the query "${searchQuery}".`
              : activeTab !== 'ALL'
              ? `There are currently no leases with status "${activeTab}".`
              : 'Add tenants and assign them lease terms to track their expirations here.'}
          </p>
          <Link
            href="/tenants"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            Go to Tenants
          </Link>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border-spacing-0">
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-800 border-b-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <th className="py-4 px-4 whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80">Property ID</th>
                  <th
                    onClick={() => handleSort('propertyName')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Property Address & Name</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('tenantName')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Tenant Name</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('endDate')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Lease Period</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('monthlyRent')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Monthly Rent</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('daysRemaining')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Remaining Days</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>
                  <th className="py-4 px-4 whitespace-nowrap border-r border-slate-200 dark:border-slate-700/80">Status</th>
                  <th className="py-4 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800 text-sm">
                {filteredAndSortedLeases.map((lease) => {
                  const isCritical = lease.calculatedStatus === 'CRITICAL';
                  const isExpiringSoon = lease.calculatedStatus === 'EXPIRING_SOON';

                  return (
                    <tr
                      key={lease.id}
                      className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors ${
                        isCritical
                          ? 'bg-rose-50/30 dark:bg-rose-950/20'
                          : isExpiringSoon
                          ? 'bg-amber-50/30 dark:bg-amber-950/20'
                          : ''
                      }`}
                    >
                      {/* Property ID */}
                      <td className="py-4 px-4 align-top border-r border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60 w-fit">
                            ID #{lease.propertyId}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            Code: {lease.property?.propertyCode || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Property Address & Name */}
                      <td className="py-4 px-4 align-top max-w-xs border-r border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {lease.property?.propertyName || 'Unnamed Property'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {[lease.property?.address, lease.property?.city].filter(Boolean).join(', ') || 'No address'}
                          </span>
                        </div>
                      </td>

                      {/* Tenant Name & Contact */}
                      <td className="py-4 px-4 align-top border-r border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {lease.tenant?.firstName} {lease.tenant?.lastName}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {lease.tenant?.phoneNumber && (
                              <a
                                href={`tel:${lease.tenant.phoneNumber}`}
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                title="Call tenant"
                              >
                                <Phone size={11} />
                                {lease.tenant.phoneNumber}
                              </a>
                            )}
                            {lease.tenant?.email && (
                              <a
                                href={`mailto:${lease.tenant.email}`}
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                title="Email tenant"
                              >
                                <Mail size={11} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Lease Dates */}
                      <td className="py-4 px-4 align-top border-r border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                            <Calendar size={12} className="text-slate-400" />
                            <span>{lease.startDate || '—'}</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-bold">{lease.endDate || '—'}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            Start to Expiration
                          </span>
                        </div>
                      </td>

                      {/* Monthly Rent */}
                      <td className="py-4 px-4 align-top border-r border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            R{lease.monthlyRent.toLocaleString('en-ZA')}
                          </span>
                          <span className="text-[11px] text-slate-400">per month</span>
                        </div>
                      </td>

                      {/* Remaining Days */}
                      <td className="py-4 px-4 align-top border-r border-slate-200 dark:border-slate-800">
                        {getDaysRemainingDisplay(lease.daysRemaining, lease.calculatedStatus)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top border-r border-slate-200 dark:border-slate-800">
                        {getStatusBadge(lease.calculatedStatus, lease.daysRemaining)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <Link
                          href={`/tenants`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                          title="View Tenant & Lease in Tenants Manager"
                        >
                          Details <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID / CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedLeases.map((lease) => {
            const isCritical = lease.calculatedStatus === 'CRITICAL';
            const isExpiringSoon = lease.calculatedStatus === 'EXPIRING_SOON';

            return (
              <div
                key={lease.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 ${
                  isCritical
                    ? 'border-rose-300 dark:border-rose-900 shadow-rose-500/5'
                    : isExpiringSoon
                    ? 'border-amber-300 dark:border-amber-900 shadow-amber-500/5'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Property ID & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60">
                      Property ID: #{lease.propertyId}
                    </span>
                    {getStatusBadge(lease.calculatedStatus, lease.daysRemaining)}
                  </div>

                  {/* Property Info */}
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {lease.property?.propertyName || 'Unnamed Property'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      <span className="truncate">
                        {[lease.property?.address, lease.property?.city].filter(Boolean).join(', ')}
                      </span>
                    </p>
                  </div>

                  {/* Tenant Info */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Tenant Details
                    </span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {lease.tenant?.firstName} {lease.tenant?.lastName}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      {lease.tenant?.phoneNumber && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> {lease.tenant.phoneNumber}
                        </span>
                      )}
                      {lease.tenant?.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={11} /> {lease.tenant.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lease Timing & Rent Details */}
                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Monthly Rent</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        R{lease.monthlyRent.toLocaleString('en-ZA')}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border ${
                      isCritical
                        ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                        : isExpiringSoon
                        ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                    }`}>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Remaining Days</span>
                      {getDaysRemainingDisplay(lease.daysRemaining, lease.calculatedStatus)}
                    </div>
                  </div>

                  {/* Lease Date Row */}
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar size={12} /> Start Date:
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{lease.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar size={12} /> End Date:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{lease.endDate}</span>
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/tenants"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
                  >
                    View in Tenants <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
