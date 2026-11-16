"use client";

import React, { useState } from 'react';
import { X, LogOut, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Tenant } from '@/types/tenant';

interface MoveOutModalProps {
  tenant: Tenant;
  onConfirm: (moveOutDate: string, notes: string, updatePropertyStatus: boolean) => Promise<void>;
  onCancel: () => void;
}

export function MoveOutModal({ tenant, onConfirm, onCancel }: MoveOutModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [moveOutDate, setMoveOutDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [updatePropertyStatus, setUpdatePropertyStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(moveOutDate, notes, updatePropertyStatus);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <div className="p-2 bg-rose-100 dark:bg-rose-950/60 rounded-xl">
              <LogOut size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Record Move-Out</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tenant.firstName} {tenant.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Associated Property banner */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
              <span>Property: {tenant.property?.propertyName || 'Associated Unit'}</span>
              <span className="text-indigo-600 dark:text-indigo-400">ID #{tenant.propertyId}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">{tenant.property?.address}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar size={15} className="text-rose-500" />
              Move-Out Date
            </label>
            <input
              type="date"
              required
              value={moveOutDate}
              onChange={(e) => setMoveOutDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText size={15} className="text-rose-500" />
              Move-Out Reason & Inspection Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Lease expired, deposit refunded in full, key returned, inspection completed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm resize-none"
            />
          </div>

          <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl cursor-pointer border border-slate-200/60 dark:border-slate-700/60">
            <input
              type="checkbox"
              checked={updatePropertyStatus}
              onChange={(e) => setUpdatePropertyStatus(e.target.checked)}
              className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Reset Property Status to Available
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Automatically mark {tenant.property?.propertyName} as AVAILABLE for new tenants.
              </span>
            </div>
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-70"
            >
              <CheckCircle2 size={16} />
              {isSubmitting ? 'Recording...' : 'Confirm Move Out'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
