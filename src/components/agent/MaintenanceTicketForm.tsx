import React, { useState, useEffect } from 'react';
import { X, Wrench, Building2, User, FileText, Calendar, DollarSign, Activity, HardHat } from 'lucide-react';

export interface MaintenanceTicketData {
  id?: number;
  propertyId: number;
  tenantId?: number | null;
  contractorId?: number | null;
  issueDescription: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  reportedDate: string;
  invoiceDate?: string | null;
  paymentDate?: string | null;
  cost?: number | null;
  paymentStatus?: 'UNPAID' | 'PAID' | null;
  notes?: string | null;
}

interface MaintenanceTicketFormProps {
  initialData?: MaintenanceTicketData;
  onSubmit: (data: MaintenanceTicketData) => void;
  onCancel: () => void;
}

export function MaintenanceTicketForm({ initialData, onSubmit, onCancel }: MaintenanceTicketFormProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);

  const [formData, setFormData] = useState<Partial<MaintenanceTicketData>>({
    propertyId: initialData?.propertyId,
    tenantId: initialData?.tenantId,
    contractorId: initialData?.contractorId,
    issueDescription: initialData?.issueDescription || '',
    priority: initialData?.priority || 'MEDIUM',
    status: initialData?.status || 'REPORTED',
    reportedDate: initialData?.reportedDate ? new Date(initialData.reportedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    invoiceDate: initialData?.invoiceDate ? new Date(initialData.invoiceDate).toISOString().split('T')[0] : null,
    paymentDate: initialData?.paymentDate ? new Date(initialData.paymentDate).toISOString().split('T')[0] : null,
    cost: initialData?.cost || null,
    paymentStatus: initialData?.paymentStatus || 'UNPAID',
    notes: initialData?.notes || ''
  });

  useEffect(() => {
    // Fetch options
    const fetchOptions = async () => {
      try {
        const [propRes, tenantRes, contractorRes] = await Promise.all([
          fetch('/api/property'),
          fetch('/api/tenant'), // assuming this endpoint exists
          fetch('/api/contractor')
        ]);
        if (propRes.ok) setProperties(await propRes.json());
        if (tenantRes.ok) setTenants(await tenantRes.json());
        if (contractorRes.ok) setContractors(await contractorRes.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value === '' ? null : value 
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value === '' ? null : Number(value) 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.issueDescription || !formData.reportedDate) return;
    
    // Convert date strings to ISO strings for Prisma
    const dataToSubmit = {
      ...formData,
      reportedDate: new Date(formData.reportedDate!).toISOString(),
      invoiceDate: formData.invoiceDate ? new Date(formData.invoiceDate).toISOString() : null,
      paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : null,
    } as MaintenanceTicketData;

    onSubmit(dataToSubmit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {initialData ? 'Edit Maintenance Ticket' : 'Add New Maintenance Ticket'}
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
          <form id="ticket-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Building2 size={16} className="text-amber-500" />
                  Property *
                </label>
                <select
                  name="propertyId"
                  required
                  value={formData.propertyId || ''}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                >
                  <option value="">Select Property...</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.propertyName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User size={16} className="text-amber-500" />
                  Tenant
                </label>
                <select
                  name="tenantId"
                  value={formData.tenantId || ''}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                >
                  <option value="">No Tenant</option>
                  {tenants.filter(t => t.propertyId === formData.propertyId).map(t => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <HardHat size={16} className="text-amber-500" />
                Contractor
              </label>
              <select
                name="contractorId"
                value={formData.contractorId || ''}
                onChange={handleNumberChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              >
                <option value="">No Contractor Assigned</option>
                {contractors.map(c => (
                  <option key={c.id} value={c.id}>{c.contractorName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileText size={16} className="text-amber-500" />
                Issue Description *
              </label>
              <textarea
                name="issueDescription"
                required
                rows={3}
                value={formData.issueDescription || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Activity size={16} className="text-amber-500" />
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority || 'MEDIUM'}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Activity size={16} className="text-amber-500" />
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status || 'REPORTED'}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                >
                  <option value="REPORTED">Reported</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar size={16} className="text-amber-500" />
                  Date Logged *
                </label>
                <input
                  type="date"
                  name="reportedDate"
                  required
                  value={formData.reportedDate || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar size={16} className="text-amber-500" />
                  Invoice Date
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar size={16} className="text-amber-500" />
                  Payment Date
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <DollarSign size={16} className="text-amber-500" />
                  Cost
                </label>
                <input
                  type="number"
                  name="cost"
                  step="0.01"
                  value={formData.cost || ''}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <DollarSign size={16} className="text-amber-500" />
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus || 'UNPAID'}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                >
                  <option value="UNPAID">Unpaid</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileText size={16} className="text-amber-500" />
                Additional Notes
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes || ''}
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
            form="ticket-form"
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            {initialData ? 'Save Changes' : 'Submit Ticket'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
