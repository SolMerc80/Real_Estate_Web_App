import React, { useState } from 'react';
import { X, Building2, AlignLeft, Phone, FileText, Info } from 'lucide-react';

export interface ContractorData {
  id?: number;
  contractorName: string;
  description: string;
  beneficiaryNumber: string;
  phoneNumber: string;
  notes: string;
}

interface ContractorFormProps {
  initialData?: ContractorData;
  onSubmit: (data: ContractorData) => void;
  onCancel: () => void;
}

export function ContractorForm({ initialData, onSubmit, onCancel }: ContractorFormProps) {
  const [formData, setFormData] = useState<ContractorData>({
    contractorName: initialData?.contractorName || '',
    description: initialData?.description || '',
    beneficiaryNumber: initialData?.beneficiaryNumber || '',
    phoneNumber: initialData?.phoneNumber || '',
    notes: initialData?.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contractorName) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {initialData ? 'Edit Contractor' : 'Add New Contractor'}
          </h2>
          <button 
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          <form id="contractor-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Building2 size={16} className="text-amber-500" />
                  Contractor Name *
                </label>
                <input
                  type="text"
                  name="contractorName"
                  required
                  value={formData.contractorName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Phone size={16} className="text-amber-500" />
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <AlignLeft size={16} className="text-amber-500" />
                Description
              </label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileText size={16} className="text-amber-500" />
                Beneficiary Number
              </label>
              <input
                type="text"
                name="beneficiaryNumber"
                value={formData.beneficiaryNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Info size={16} className="text-amber-500" />
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="contractor-form"
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            {initialData ? 'Save Changes' : 'Add Contractor'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
