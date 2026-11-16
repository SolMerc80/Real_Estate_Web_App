"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Wrench, Calendar, Building2, User, DollarSign, Activity, FileText, Edit2, Trash2 } from 'lucide-react';
import { MaintenanceTicketForm, MaintenanceTicketData } from '@/components/agent/MaintenanceTicketForm';

interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
}

interface Contractor {
  id: number;
  contractorName: string;
}

interface MaintenanceJob {
  id: number;
  propertyId: number;
  tenantId: number | null;
  tenant: Tenant | null;
  contractorId: number | null;
  contractor: Contractor | null;
  issueDescription: string;
  priority: string;
  status: string;
  reportedDate: string;
  invoiceDate: string | null;
  paymentDate: string | null;
  cost: number | null;
  paymentStatus: string | null;
  notes: string | null;
}

interface PropertyGroup {
  id: number;
  propertyCode: string;
  propertyName: string;
  maintenanceJobs: MaintenanceJob[];
}

export default function MaintenancePage() {
  const [propertyGroups, setPropertyGroups] = useState<PropertyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicketData | undefined>(undefined);

  const loadData = async () => {
    try {
      const response = await fetch('/api/maintenance');
      if (response.ok) {
        const data = await response.json();
        setPropertyGroups(data);
      }
    } catch (error) {
      console.error('Error fetching maintenance jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTicket = async (data: MaintenanceTicketData) => {
    try {
      if (editingTicket) {
        const response = await fetch(`/api/maintenance/${editingTicket.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to update maintenance ticket');
      } else {
        const response = await fetch('/api/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to create maintenance ticket');
      }

      await loadData();
      setIsFormOpen(false);
      setEditingTicket(undefined);
    } catch (error) {
      console.error('Error saving maintenance ticket:', error);
    }
  };

  const handleDeleteTicket = async (id: number) => {
    if (confirm('Are you sure you want to delete this maintenance ticket?')) {
      try {
        const response = await fetch(`/api/maintenance/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete maintenance ticket');
        await loadData();
      } catch (error) {
        console.error('Error deleting maintenance ticket:', error);
      }
    }
  };

  const openAddForm = () => {
    setEditingTicket(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (job: MaintenanceJob) => {
    setEditingTicket({
      id: job.id,
      propertyId: job.propertyId,
      tenantId: job.tenantId,
      contractorId: job.contractorId,
      issueDescription: job.issueDescription,
      priority: job.priority as any,
      status: job.status as any,
      reportedDate: job.reportedDate,
      invoiceDate: job.invoiceDate,
      paymentDate: job.paymentDate,
      cost: job.cost,
      paymentStatus: job.paymentStatus as any,
      notes: job.notes,
    });
    setIsFormOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'LOW':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ASSIGNED':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'REPORTED':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };
  
  const getPaymentStatusStyle = (status: string | null) => {
    switch (status) {
      case 'PAID':
        return 'text-emerald-600 dark:text-emerald-400 font-medium';
      case 'UNPAID':
        return 'text-red-600 dark:text-red-400 font-medium';
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Maintenance Tickets</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage maintenance jobs grouped by property.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add Ticket
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : propertyGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40">
          <div className="bg-amber-50 dark:bg-amber-950/60 p-4 rounded-full mb-4 text-amber-500 dark:text-amber-400">
            <Wrench size={32} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No maintenance jobs found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
            There are currently no properties with logged maintenance jobs.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {propertyGroups.map((property) => {
            const cumulativeCost = property.maintenanceJobs.reduce((sum, job) => {
              return sum + (Number(job.cost) || 0);
            }, 0);

            return (
              <div key={property.id} className="bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {property.propertyName} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({property.propertyCode})</span>
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {property.maintenanceJobs.length} {property.maintenanceJobs.length === 1 ? 'Job' : 'Jobs'} logged
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Cumulative Cost:</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(cumulativeCost)}</span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-4 font-medium whitespace-nowrap">ID</th>
                        <th className="px-6 py-4 font-medium whitespace-nowrap">Tenant</th>
                        <th className="px-6 py-4 font-medium min-w-[200px]">Issue Description</th>
                        <th className="px-6 py-4 font-medium whitespace-nowrap">Date Logged</th>
                        <th className="px-6 py-4 font-medium whitespace-nowrap">Invoice Date</th>
                        <th className="px-6 py-4 font-medium whitespace-nowrap">Payment Date</th>
                        <th className="px-6 py-4 font-medium whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 font-medium whitespace-nowrap">Priority</th>
                        <th className="px-6 py-4 font-medium whitespace-nowrap">Contractor</th>
                        <th className="px-6 py-4 font-medium whitespace-nowrap text-right">Cost</th>
                        <th className="px-6 py-4 font-medium whitespace-nowrap">Payment Status</th>
                        <th className="px-6 py-4 font-medium min-w-[150px]">Notes</th>
                        <th className="px-6 py-4 font-medium whitespace-nowrap text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {property.maintenanceJobs.map((job) => (
                        <tr key={job.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">#{job.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {job.tenant ? (
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-slate-400" />
                                <span>{job.tenant.firstName} {job.tenant.lastName}</span>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <p className="line-clamp-2" title={job.issueDescription}>{job.issueDescription}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-slate-400" />
                              {formatDate(job.reportedDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">{formatDate(job.invoiceDate)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">{formatDate(job.paymentDate)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${getStatusStyle(job.status)}`}>
                              {job.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${getPriorityStyle(job.priority)}`}>
                              {job.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {job.contractor ? job.contractor.contractorName : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-slate-900 dark:text-slate-100">
                            {formatCurrency(job.cost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getPaymentStatusStyle(job.paymentStatus)}>
                              {job.paymentStatus || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            <p className="line-clamp-2" title={job.notes || ''}>{job.notes || '-'}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => openEditForm(job)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                title="Edit Ticket"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteTicket(job.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                                title="Delete Ticket"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isFormOpen && (
        <MaintenanceTicketForm
          initialData={editingTicket}
          onSubmit={handleAddTicket}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTicket(undefined);
          }}
        />
      )}
    </div>
  );
}
