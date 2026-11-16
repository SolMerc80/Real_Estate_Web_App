import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Building, Target } from 'lucide-react';

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Lead' | 'Closed';
  budget: string;
  propertyType: string;
}

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
}

export function ClientForm({ initialData, onSubmit, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    address: initialData?.address ?? '',
    status: initialData?.status ?? 'Lead',
    budget: initialData?.budget ?? '',
    propertyType: initialData?.propertyType ?? 'House',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {initialData ? 'Edit Client' : 'Add New Client'}
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
          <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User size={16} className="text-blue-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name ?? ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Mail size={16} className="text-blue-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email ?? ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Phone size={16} className="text-blue-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone ?? ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-500" />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address ?? ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Target size={16} className="text-blue-500" />
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status ?? ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="Lead" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Lead</option>
                  <option value="Active" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Active</option>
                  <option value="Closed" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Closed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Building size={16} className="text-blue-500" />
                  Property Type
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType ?? ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="House" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">House</option>
                  <option value="Apartment" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Apartment</option>
                  <option value="Condo" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Condo</option>
                  <option value="Commercial" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Commercial</option>
                  <option value="Land" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Land</option>
                  <option value="Any" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Any</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  Budget
                </label>
                <input
                  type="text"
                  name="budget"
                  value={formData.budget ?? ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
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
            form="client-form"
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            {initialData ? 'Save Changes' : 'Add Client'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
