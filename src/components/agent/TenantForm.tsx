"use client";

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Home, Calendar, DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import { TenantFormData, Tenant } from '@/types/tenant';
import { Property } from '@/types/property';

interface TenantFormProps {
  initialData?: Tenant;
  onSubmit: (data: TenantFormData) => Promise<void>;
  onCancel: () => void;
}

export function TenantForm({ initialData, onSubmit, onCancel }: TenantFormProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract latest lease / move record if initialData exists
  const latestLease = initialData?.leases?.[0];
  const latestMove = initialData?.moveRecords?.[0];

  const [formData, setFormData] = useState<TenantFormData>({
    firstName: initialData?.firstName ?? '',
    lastName: initialData?.lastName ?? '',
    phoneNumber: initialData?.phoneNumber ?? '',
    email: initialData?.email ?? '',
    propertyId: initialData?.propertyId ? String(initialData.propertyId) : '',
    status: initialData?.status ?? 'ACTIVE',
    monthlyRent: latestLease?.monthlyRent ? String(latestLease.monthlyRent) : '',
    leaseStartDate: latestLease?.startDate ? String(latestLease.startDate).split('T')[0] : '',
    leaseEndDate: latestLease?.endDate ? String(latestLease.endDate).split('T')[0] : '',
    moveInDate: latestMove?.moveInDate ? String(latestMove.moveInDate).split('T')[0] : '',
    moveOutDate: latestMove?.moveOutDate ? String(latestMove.moveOutDate).split('T')[0] : '',
    notes: initialData?.notes ?? '',
  });

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch('/api/property');
        if (res.ok) {
          const data = await res.json();
          setProperties(data);
          // If creating new tenant and no property selected yet, pre-select first property
          if (!initialData && data.length > 0 && !formData.propertyId) {
            setFormData((prev) => ({ ...prev, propertyId: String(data[0].id) }));
          }
        }
      } catch (err) {
        console.error('Error fetching properties for dropdown:', err);
      } finally {
        setLoadingProperties(false);
      }
    }
    fetchProperties();
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProperty = properties.find((p) => String(p.id) === String(formData.propertyId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {initialData ? 'Edit Tenant' : 'Add New Tenant'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Assign property, lease duration, contact details, and move records.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar space-y-6">
          <form id="tenant-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Tenant Personal Info */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Tenant Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User size={14} className="text-blue-500" />
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName ?? ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User size={14} className="text-blue-500" />
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName ?? ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone size={14} className="text-blue-500" />
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber ?? ''}
                    onChange={handleChange}
                    placeholder="+27 82 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail size={14} className="text-blue-500" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email ?? ''}
                    onChange={handleChange}
                    placeholder="tenant@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 2. Tied Property Association */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Assigned Property
              </h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Home size={14} className="text-indigo-500" />
                  Select Property *
                </label>
                <select
                  name="propertyId"
                  required
                  value={formData.propertyId ?? ''}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                >
                  {loadingProperties ? (
                    <option value="">Loading properties...</option>
                  ) : properties.length === 0 ? (
                    <option value="">No properties found (please create one first)</option>
                  ) : (
                    properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        [ID #{p.id}] {p.propertyCode} - {p.propertyName} ({p.address})
                      </option>
                    ))
                  )}
                </select>

                {selectedProperty && (
                  <div className="mt-2 p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{selectedProperty.propertyName}</p>
                      <p className="text-slate-500 dark:text-slate-400">{selectedProperty.address}, {selectedProperty.city}</p>
                    </div>
                    <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      Property ID: #{selectedProperty.id}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Status & Lease Information */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Tenancy & Lease Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    Tenancy Status
                  </label>
                  <select
                    name="status"
                    value={formData.status ?? 'ACTIVE'}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  >
                    <option value="ACTIVE">ACTIVE (Currently Residing)</option>
                    <option value="PREVIOUS">PREVIOUS (Moved Out)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-emerald-500" />
                    Monthly Rent (R)
                  </label>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={formData.monthlyRent ?? ''}
                    onChange={handleChange}
                    placeholder="e.g. 8500"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-500" />
                    Lease Start Date
                  </label>
                  <input
                    type="date"
                    name="leaseStartDate"
                    value={formData.leaseStartDate ?? ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-500" />
                    Lease End Date
                  </label>
                  <input
                    type="date"
                    name="leaseEndDate"
                    value={formData.leaseEndDate ?? ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 4. Move In & Move Out Dates */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Movement Timeline
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar size={14} className="text-emerald-500" />
                    Move-In Date
                  </label>
                  <input
                    type="date"
                    name="moveInDate"
                    value={formData.moveInDate ?? ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold flex items-center gap-1.5 ${
                    formData.status === 'PREVIOUS' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    <Calendar size={14} className="text-rose-500" />
                    Move-Out Date {formData.status === 'PREVIOUS' && '(Required for moved out)'}
                  </label>
                  <input
                    type="date"
                    name="moveOutDate"
                    value={formData.moveOutDate ?? ''}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                      formData.status === 'PREVIOUS' 
                        ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* 5. Notes about Tenant */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText size={14} className="text-slate-400" />
                Notes about Tenant (payment history, move-out remarks, pets, etc.)
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Write any important notes regarding this tenant..."
                value={formData.notes ?? ''}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all resize-none"
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="tenant-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
          >
            <CheckCircle2 size={16} />
            {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Tenant'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
