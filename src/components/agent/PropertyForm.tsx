import React, { useState } from 'react';
import { Property, PropertyFormData } from '@/types/property';
import { X, Home, DollarSign, MapPin, Building2, FileText, Tag, CircleDot } from 'lucide-react';

interface PropertyFormProps {
  initialData?: Property;
  onSubmit: (data: PropertyFormData) => void;
  onCancel: () => void;
  mainProperties?: Property[];
}

export function PropertyForm({ initialData, onSubmit, onCancel, mainProperties = [] }: PropertyFormProps) {
  const defaults: PropertyFormData = {
    propertyCode: '',
    propertyName: '',
    address: '',
    city: '',
    propertyType: 'HOUSE',
    status: 'AVAILABLE',
    price: 0,
    parentPropertyId: null,
    notes: '',
  };

  const [formData, setFormData] = useState<PropertyFormData>(
    initialData ? { ...defaults, ...initialData } : defaults
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setFormData((prev) => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else if (name === 'parentPropertyId') {
      const parentId = value === '' ? null : Number(value);
      setFormData((prev) => {
        const selectedParent = mainProperties.find((p) => p.id === parentId);
        return {
          ...prev,
          parentPropertyId: parentId,
          // autofill address from parent if address is blank
          address: prev.address || selectedParent?.address || '',
          city: prev.city || selectedParent?.city || '',
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Property' : 'Add New Property'}
          </h2>
          <button 
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          <form id="property-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Property Hierarchy / Subdivision */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Building2 size={16} className="text-[#135446]" />
                Property Hierarchy / Division
              </label>
              <select
                name="parentPropertyId"
                value={formData.parentPropertyId || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none text-sm"
              >
                <option value="">None — Standalone / Main Property</option>
                {mainProperties
                  .filter((p) => !initialData || p.id !== initialData.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      Sub-division of {p.propertyName} (ID: {p.propertyCode})
                    </option>
                  ))}
              </select>
              <p className="text-[11px] text-slate-500">
                {formData.parentPropertyId
                  ? "For sub-properties or divisions, use ID format like 2.1, 2.2, or 1.3. Sub-properties share the main building and can have different tenants."
                  : "Standalone or main property that can contain sub-units."}
              </p>
            </div>

            {/* Property Code & Property Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Tag size={16} className="text-slate-400" />
                  Property Code / ID (e.g. 2 or 2.1)
                </label>
                <input
                  type="text"
                  name="propertyCode"
                  required
                  value={formData.propertyCode}
                  onChange={handleChange}
                  placeholder={formData.parentPropertyId ? "e.g. 2.1, 5.3" : "e.g. 2, 5, 10"}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-black"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Home size={16} className="text-slate-400" />
                  Property Name / Unit
                </label>
                <input
                  type="text"
                  name="propertyName"
                  required
                  value={formData.propertyName}
                  onChange={handleChange}
                  placeholder="e.g. 10 Dunvegan or Unit 1"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-black"
                />
              </div>
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <DollarSign size={16} className="text-slate-400" />
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  value={formData.price || ''}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-black"
                />
              </div>
            </div>

            {/* Address & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 123 Main Street"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-black"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Building2 size={16} className="text-slate-400" />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  placeholder="e.g. Johannesburg"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-black"
                />
              </div>
            </div>

            {/* Property Type & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Tag size={16} className="text-slate-400" />
                  Property Type
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-black"
                >
                  <option value="HOUSE">House</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="OFFICE">Office</option>
                  <option value="LAND">Land</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <CircleDot size={16} className="text-slate-400" />
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-black"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes || ''}
                onChange={handleChange}
                placeholder="Any additional notes about this property..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-black"
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="property-form"
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95"
          >
            {initialData ? 'Save Changes' : 'Add Property'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
