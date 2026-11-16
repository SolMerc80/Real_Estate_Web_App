"use client";

import React, { useEffect, useState } from 'react';
import { HardHat, FileText, Phone, Building2, AlignLeft, Info, Plus, Edit2, Trash2 } from 'lucide-react';
import { ContractorForm, ContractorData } from '@/components/agent/ContractorForm';

interface Contractor {
  id: number;
  contractorName: string;
  description: string | null;
  beneficiaryNumber: string | null;
  phoneNumber: string | null;
  notes: string | null;
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | undefined>(undefined);

  const loadData = async () => {
    try {
      const response = await fetch('/api/contractor');
      if (response.ok) {
        const data = await response.json();
        setContractors(data);
      }
    } catch (error) {
      console.error('Error fetching contractors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddContractor = async (data: ContractorData) => {
    try {
      if (editingContractor) {
        const response = await fetch(`/api/contractor/${editingContractor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to update contractor');
      } else {
        const response = await fetch('/api/contractor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to create contractor');
      }

      await loadData();
      setIsFormOpen(false);
      setEditingContractor(undefined);
    } catch (error) {
      console.error('Error saving contractor:', error);
    }
  };

  const handleDeleteContractor = async (id: number) => {
    if (confirm('Are you sure you want to delete this contractor?')) {
      try {
        const response = await fetch(`/api/contractor/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete contractor');
        await loadData();
      } catch (error) {
        console.error('Error deleting contractor:', error);
      }
    }
  };

  const openAddForm = () => {
    setEditingContractor(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (contractor: Contractor) => {
    setEditingContractor(contractor);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Contractors</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage service providers and contractors.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add Contractor
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : contractors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40">
          <div className="bg-amber-50 dark:bg-amber-950/60 p-4 rounded-full mb-4 text-amber-500 dark:text-amber-400">
            <HardHat size={32} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No contractors found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
            There are currently no contractors in your system.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Name</th>
                  <th className="px-6 py-4 font-medium min-w-[200px]">Description</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Beneficiary Number</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Contact Number</th>
                  <th className="px-6 py-4 font-medium min-w-[200px]">Notes</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {contractors.map((contractor) => (
                  <tr key={contractor.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-slate-400" />
                        {contractor.contractorName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <AlignLeft size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="line-clamp-2" title={contractor.description || ''}>
                          {contractor.description || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {contractor.beneficiaryNumber || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-slate-400" />
                        {contractor.phoneNumber || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-start gap-2">
                        <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="line-clamp-2" title={contractor.notes || ''}>
                          {contractor.notes || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditForm(contractor)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/50"
                          title="Edit Contractor"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteContractor(contractor.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                          title="Delete Contractor"
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
      )}

      {isFormOpen && (
        <ContractorForm
          initialData={editingContractor as ContractorData | undefined}
          onSubmit={handleAddContractor}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingContractor(undefined);
          }}
        />
      )}
    </div>
  );
}
