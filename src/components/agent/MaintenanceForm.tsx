import React, { useState } from 'react';
import { X, Wrench, Mail, Phone, MapPin, Star, Building2 } from 'lucide-react';

export interface MaintenanceContactData {
  name: string;
  serviceType: string;
  phone: string;
  email: string;
  rating: string;
  status: 'Available' | 'Busy' | 'Unavailable';
  address: string;
  notes: string;
}

interface MaintenanceFormProps {
  initialData?: Partial<MaintenanceContactData>;
  onSubmit: (data: MaintenanceContactData) => void;
  onCancel: () => void;
}

export function MaintenanceForm({ initialData, onSubmit, onCancel }: MaintenanceFormProps) {
  const [formData, setFormData] = useState<MaintenanceContactData>({
    name: '',
    serviceType: 'Plumbing',
    phone: '',
    email: '',
    rating: '5.0',
    status: 'Available',
    address: '',
    notes: '',
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            {initialData ? 'Edit Contact' : 'Add New Maintenance Contact'}
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
          <form id="maintenance-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Building2 size={16} className="text-amber-500" />
                  Company / Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Wrench size={16} className="text-amber-500" />
                  Service Type
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                >
                  <option value="Plumbing" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Plumbing</option>
                  <option value="Electrical" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Electrical</option>
                  <option value="HVAC" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">HVAC</option>
                  <option value="General Handyman" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">General Handyman</option>
                  <option value="Landscaping" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Landscaping</option>
                  <option value="Cleaning" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Cleaning</option>
                  <option value="Security" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Security</option>
                  <option value="Other" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Phone size={16} className="text-amber-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Mail size={16} className="text-amber-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin size={16} className="text-amber-500" />
                  Address (Optional)
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Star size={16} className="text-amber-500" />
                  Rating / Status
                </label>
                <div className="flex gap-4">
                   <input
                    type="number"
                    name="rating"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-1/3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  />
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-2/3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  >
                    <option value="Available" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Available</option>
                    <option value="Busy" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Busy</option>
                    <option value="Unavailable" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Additional Notes</label>
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
            form="maintenance-form"
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            {initialData ? 'Save Changes' : 'Add Contact'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
