"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Percent,
  UserCheck,
  FileText,
  MapPin,
  Tag,
  AlertCircle,
} from "lucide-react";
import { Landlord, LandlordFormData } from "@/types/landlord";
import { Property } from "@/types/property";

interface LandlordFormProps {
  initialData?: Landlord;
  onSubmit: (data: LandlordFormData) => Promise<void>;
  onCancel: () => void;
}

export function LandlordForm({ initialData, onSubmit, onCancel }: LandlordFormProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initial property if editing
  const initialProperty = initialData?.properties?.[0];

  const [formData, setFormData] = useState<LandlordFormData>({
    displayName: initialData?.displayName ?? "",
    phoneNumber: initialData?.phoneNumber ?? "",
    email: initialData?.email ?? "",
    commissionRate: initialData?.commissionRate !== undefined && initialData?.commissionRate !== null
      ? String(initialData.commissionRate)
      : "10",
    propertyId: initialProperty?.id ? String(initialProperty.id) : "",
    managingAgent: initialProperty?.managingAgent ?? "",
    notes: initialData?.notes ?? "",
  });

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("/api/property");
        if (res.ok) {
          const data = await res.json();
          setProperties(data);
        }
      } catch (err) {
        console.error("Error fetching properties for landlord form:", err);
      } finally {
        setLoadingProperties(false);
      }
    }
    fetchProperties();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // When user picks a property, auto-fill managing agent if property has one and form's managingAgent is empty
      if (name === "propertyId" && value) {
        const picked = properties.find((p) => String(p.id) === String(value));
        if (picked && (picked as unknown as { managingAgent?: string }).managingAgent && !prev.managingAgent) {
          next.managingAgent = (picked as unknown as { managingAgent?: string }).managingAgent || "";
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.displayName.trim()) {
      setFormError("Landlord name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save landlord.";
      setFormError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProperty = properties.find(
    (p) => String(p.id) === String(formData.propertyId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="text-blue-600 dark:text-blue-400" size={22} />
              {initialData ? "Edit Landlord" : "Add New Landlord"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record landlord profile, property linkage, commission percentage, and managing agent.
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
          {formError && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              <AlertCircle size={16} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form id="landlord-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Landlord Details */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Landlord Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User size={14} className="text-blue-500" />
                    Landlord Name *
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    required
                    placeholder="e.g. Eleanor Vance or Vance Properties LLC"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Phone size={14} className="text-emerald-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="e.g. +27 82 123 4567"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail size={14} className="text-indigo-500" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. landlord@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Property Association & Financials */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Property & Commission
              </h3>
              
              <div className="space-y-4">
                {/* Property Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 size={14} className="text-blue-500" />
                    Property Assignment (Property ID & Name)
                  </label>
                  <select
                    name="propertyId"
                    value={formData.propertyId || ""}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">-- Select Property (Optional) --</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.propertyCode}] {p.propertyName} - {p.address}
                      </option>
                    ))}
                  </select>
                  {loadingProperties && (
                    <p className="text-[11px] text-slate-400">Loading available properties...</p>
                  )}
                </div>

                {/* Selected Property Preview (Address & ID confirmation) */}
                {selectedProperty && (
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-900 dark:text-blue-200">
                      <Tag size={13} className="text-blue-500" />
                      <span>Property ID: <strong>{selectedProperty.propertyCode}</strong></span>
                      <span className="text-blue-300 dark:text-blue-700">|</span>
                      <span>Name: <strong>{selectedProperty.propertyName}</strong></span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <MapPin size={13} className="text-blue-500 mt-0.5 shrink-0" />
                      <span>{selectedProperty.address}{selectedProperty.city ? `, ${selectedProperty.city}` : ""}</span>
                    </div>
                  </div>
                )}

                {/* Commission % and Managing Agent */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Percent size={14} className="text-amber-500" />
                      % Commission (Agency Rate)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        name="commissionRate"
                        placeholder="e.g. 10.0"
                        value={formData.commissionRate}
                        onChange={handleChange}
                        className="w-full pl-3.5 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        %
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <UserCheck size={14} className="text-purple-500" />
                      Managing Agent
                    </label>
                    <input
                      type="text"
                      name="managingAgent"
                      placeholder="e.g. Agent Sarah Jenkins"
                      value={formData.managingAgent || ""}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText size={14} className="text-slate-400" />
                Notes & Additional Remarks
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Contractual agreements, payment instructions, or special requests..."
                value={formData.notes || ""}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="landlord-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Saving...</span>
              </>
            ) : initialData ? (
              "Save Changes"
            ) : (
              "Add Landlord"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
