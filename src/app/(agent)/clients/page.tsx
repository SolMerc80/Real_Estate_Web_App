"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  LayoutGrid,
  List as ListIcon,
  LogOut,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { Tenant, TenantFormData } from '@/types/tenant';
import { TenantForm } from '@/components/agent/TenantForm';
import { MoveOutModal } from '@/components/agent/MoveOutModal';

type ViewMode = 'grid' | 'list';
type FilterTab = 'ALL' | 'ACTIVE' | 'PREVIOUS';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | undefined>(undefined);
  const [moveOutTenant, setMoveOutTenant] = useState<Tenant | undefined>(undefined);

  // Load Tenants
  const loadTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tenant');
      if (res.ok) {
        const data = await res.json();
        setTenants(data);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // Handle Add Tenant
  const handleAddTenant = async (data: TenantFormData) => {
    try {
      const res = await fetch('/api/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create tenant');
      }

      await loadTenants();
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error creating tenant:', err);
      alert(err instanceof Error ? err.message : 'Error adding tenant');
    }
  };

  // Handle Edit Tenant
  const handleEditTenant = async (data: TenantFormData) => {
    if (!editingTenant) return;
    try {
      const res = await fetch(`/api/tenant/${editingTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update tenant');
      }

      await loadTenants();
      setEditingTenant(undefined);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error updating tenant:', err);
      alert(err instanceof Error ? err.message : 'Error updating tenant');
    }
  };

  // Handle Quick Move-Out
  const handleMoveOutConfirm = async (
    moveOutDate: string,
    notes: string,
    updatePropertyStatus: boolean
  ) => {
    if (!moveOutTenant) return;
    try {
      const res = await fetch(`/api/tenant/${moveOutTenant.id}/move-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moveOutDate, moveOutNotes: notes, updatePropertyStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to record move-out');
      }

      await loadTenants();
      setMoveOutTenant(undefined);
    } catch (err) {
      console.error('Move out error:', err);
      alert('Failed to record move out');
    }
  };

  // Handle Delete Tenant
  const handleDeleteTenant = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tenant record? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/tenant/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete tenant');
      }

      setTenants((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error deleting tenant:', err);
      alert('Failed to delete tenant');
    }
  };

  // Filtered tenants list
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      // Tab filter
      if (activeTab === 'ACTIVE' && tenant.status !== 'ACTIVE') return false;
      if (activeTab === 'PREVIOUS' && tenant.status !== 'PREVIOUS') return false;

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const fullName = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
        const propName = (tenant.property?.propertyName || '').toLowerCase();
        const propAddr = (tenant.property?.address || '').toLowerCase();
        const propId = String(tenant.propertyId);
        const email = (tenant.email || '').toLowerCase();
        const phone = (tenant.phoneNumber || '').toLowerCase();

        return (
          fullName.includes(query) ||
          propName.includes(query) ||
          propAddr.includes(query) ||
          propId.includes(query) ||
          email.includes(query) ||
          phone.includes(query)
        );
      }

      return true;
    });
  }, [tenants, activeTab, searchQuery]);

  const activeCount = tenants.filter((t) => t.status === 'ACTIVE').length;
  const previousCount = tenants.filter((t) => t.status === 'PREVIOUS').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Tenants</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
              {tenants.length} Total
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage active tenants, assigned properties, lease duration, and track moved-out records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle (Grid vs List) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <ListIcon size={16} />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTenant(undefined);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            Add Tenant
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Tenants ({tenants.length})
          </button>
          
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Active ({activeCount})
          </button>

          <button
            onClick={() => setActiveTab('PREVIOUS')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'PREVIOUS'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <LogOut size={13} />
            Moved Out ({previousCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, property, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Loading tenants and property records...</p>
        </div>
      ) : filteredTenants.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40">
          <div className="bg-blue-50 dark:bg-blue-950/60 p-4 rounded-full mb-4 text-blue-500 dark:text-blue-400">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {activeTab === 'PREVIOUS'
              ? 'No moved-out tenants found'
              : activeTab === 'ACTIVE'
              ? 'No active tenants found'
              : 'No tenant records found'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6 text-sm">
            {searchQuery
              ? `No records matched your search "${searchQuery}".`
              : activeTab === 'PREVIOUS'
              ? 'Tenants that have moved out will appear here with their move-out date and notes.'
              : 'Add your first tenant to tie them to a property and manage their lease terms.'}
          </p>
          <button
            onClick={() => {
              setEditingTenant(undefined);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl shadow-sm transition-all"
          >
            <Plus size={18} />
            Add Tenant
          </button>
        </div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* GRID VIEW */}
          {/* ========================================================= */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTenants.map((tenant) => {
                const lease = tenant.leases?.[0];
                const moveRecord = tenant.moveRecords?.[0];
                const moveOutDateObj = moveRecord?.moveOutDate ? new Date(moveRecord.moveOutDate) : null;
                const isPastMoveOut = moveOutDateObj ? moveOutDateObj.getTime() <= new Date().setHours(23, 59, 59, 999) : false;
                const isMovedOut = tenant.status === 'PREVIOUS' || (Boolean(moveRecord?.moveOutDate) && isPastMoveOut);

                return (
                  <div
                    key={tenant.id}
                    className={`group bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${
                      isMovedOut
                        ? 'border-slate-200/90 dark:border-slate-800'
                        : 'border-slate-200/80 dark:border-slate-800 dark:hover:border-blue-800/60'
                    }`}
                  >
                    <div className="p-5 space-y-4">
                      
                      {/* Tenant Header: Name, Avatar, Status & Actions */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-sm ${
                              isMovedOut
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                : 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {tenant.firstName.charAt(0).toUpperCase()}
                            {tenant.lastName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                              {tenant.firstName} {tenant.lastName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full inline-flex items-center gap-1 ${
                                  isMovedOut
                                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
                                {isMovedOut ? (
                                  <>
                                    <LogOut size={11} /> Moved Out
                                  </>
                                ) : (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Active
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Top action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingTenant(tenant);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Tenant"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteTenant(tenant.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Tenant"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Property Association Box (Property ID, Name, Address) */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                            {tenant.property?.propertyName || 'Associated Property'}
                          </span>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 shrink-0">
                            Property ID: #{tenant.propertyId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin size={12} className="shrink-0 text-slate-400" />
                          <span className="truncate">
                            {[tenant.property?.address, tenant.property?.city].filter(Boolean).join(', ')}
                          </span>
                        </p>
                      </div>

                      {/* Contact Info (Phone & Email) */}
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          <span className="font-medium">{tenant.phoneNumber || 'No phone number'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{tenant.email || 'No email provided'}</span>
                        </div>
                      </div>

                      {/* Lease Period & Move-out Timeline */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                        {/* Lease Dates */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar size={12} />
                            Lease:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {lease?.startDate && lease?.endDate
                              ? `${lease.startDate} → ${lease.endDate}`
                              : 'No lease dates set'}
                          </span>
                        </div>

                        {/* Move Out Date banner */}
                        {isMovedOut ? (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium">
                            <span className="flex items-center gap-1.5 text-[11px]">
                              <LogOut size={12} />
                              Moved Out:
                            </span>
                            <span className="font-bold text-[11px]">
                              {moveRecord?.moveOutDate || 'Date recorded in notes'}
                            </span>
                          </div>
                        ) : moveRecord?.moveOutDate ? (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
                            <span className="flex items-center gap-1.5 text-[11px]">
                              <Calendar size={12} />
                              Scheduled Move-Out:
                            </span>
                            <span className="font-bold text-[11px]">
                              {moveRecord.moveOutDate}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <DollarSign size={12} />
                              Monthly Rent:
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {lease?.monthlyRent ? `R${lease.monthlyRent}` : '—'}
                            </span>
                          </div>
                        )}

                        {/* Notes preview */}
                        {tenant.notes && (
                          <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-0.5">
                              <FileText size={11} className="text-slate-400" /> Notes:
                            </span>
                            <p className="line-clamp-2 italic">&quot;{tenant.notes}&quot;</p>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Card Footer: Quick Move-Out Action */}
                    {!isMovedOut && (
                      <div className="p-3 bg-slate-50/60 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                        <button
                          onClick={() => setMoveOutTenant(tenant)}
                          className="w-full py-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-rose-200/60 dark:border-rose-900/50 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <LogOut size={13} />
                          Record Move Out
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================= */}
          {/* LIST VIEW */}
          {/* ========================================================= */}
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border-spacing-0">
                  <thead>
                    <tr className="border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Tenant</th>
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Contact Details</th>
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Property ID & Name</th>
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Property Address</th>
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Lease Dates</th>
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Monthly Rent</th>
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800">
                    {filteredTenants.map((tenant) => {
                      const lease = tenant.leases?.[0];
                      const moveRecord = tenant.moveRecords?.[0];
                      const moveOutDateObj = moveRecord?.moveOutDate ? new Date(moveRecord.moveOutDate) : null;
                      const isPastMoveOut = moveOutDateObj ? moveOutDateObj.getTime() <= new Date().setHours(23, 59, 59, 999) : false;
                      const isMovedOut = tenant.status === 'PREVIOUS' || (Boolean(moveRecord?.moveOutDate) && isPastMoveOut);

                      return (
                        <tr
                          key={tenant.id}
                          className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          {/* Tenant Name */}
                          <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isMovedOut
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                    : 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
                                }`}
                              >
                                {tenant.firstName.charAt(0).toUpperCase()}
                                {tenant.lastName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                {tenant.firstName} {tenant.lastName}
                              </span>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800">
                            <div className="space-y-1 text-xs">
                              {tenant.phoneNumber ? (
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                  <Phone size={12} className="text-emerald-500 shrink-0" />
                                  <span>{tenant.phoneNumber}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">No phone</span>
                              )}
                              {tenant.email && (
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                  <Mail size={12} className="text-indigo-500 shrink-0" />
                                  <span className="truncate max-w-[140px]">{tenant.email}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Property ID & Name */}
                          <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800">
                            <div>
                              <span className="inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60">
                                ID #{tenant.propertyId}
                              </span>
                              <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-0.5 truncate max-w-[150px]">
                                {tenant.property?.propertyName || '—'}
                              </div>
                            </div>
                          </td>

                          {/* Property Address */}
                          <td className="py-3.5 px-4 max-w-[180px] border-r border-slate-200 dark:border-slate-800">
                            <div className="flex items-start gap-1 text-slate-600 dark:text-slate-300 text-xs">
                              <MapPin size={12} className="text-blue-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">
                                {[tenant.property?.address, tenant.property?.city].filter(Boolean).join(', ') || '—'}
                              </span>
                            </div>
                          </td>

                          {/* Lease Dates */}
                          <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800">
                            <div className="text-xs text-slate-700 dark:text-slate-300">
                              {lease?.startDate && lease?.endDate ? (
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} className="text-slate-400" />
                                  <span>{lease.startDate}</span>
                                  <span className="text-slate-400">→</span>
                                  <span className="font-semibold">{lease.endDate}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">No lease set</span>
                              )}
                              {isMovedOut && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                                  <LogOut size={10} /> Out: {moveRecord?.moveOutDate || 'Recorded'}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Monthly Rent */}
                          <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {lease?.monthlyRent ? `R${Number(lease.monthlyRent).toLocaleString('en-ZA')}` : '—'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800">
                            <span
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-full inline-flex items-center gap-1 ${
                                isMovedOut
                                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                  : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                              }`}
                            >
                              {isMovedOut ? (
                                <>
                                  <LogOut size={11} /> Moved Out
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  Active
                                </>
                              )}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!isMovedOut && (
                                <button
                                  onClick={() => setMoveOutTenant(tenant)}
                                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center gap-1"
                                  title="Record tenant move-out"
                                >
                                  <LogOut size={13} />
                                  Move Out
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingTenant(tenant);
                                  setIsFormOpen(true);
                                }}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Tenant"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteTenant(tenant.id)}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                                title="Delete Tenant"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tenant Add / Edit Form Modal */}
      {isFormOpen && (
        <TenantForm
          initialData={editingTenant}
          onSubmit={editingTenant ? handleEditTenant : handleAddTenant}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTenant(undefined);
          }}
        />
      )}

      {/* Quick Move-Out Modal */}
      {moveOutTenant && (
        <MoveOutModal
          tenant={moveOutTenant}
          onConfirm={handleMoveOutConfirm}
          onCancel={() => setMoveOutTenant(undefined)}
        />
      )}

    </div>
  );
}
