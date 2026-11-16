export type RentPaymentStatus = 'PAID' | 'UNPAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';

export interface RentPaymentProperty {
  id: number;
  propertyCode: string;
  propertyName: string;
  address: string;
  suburb?: string | null;
  city?: string | null;
  status?: string;
}

export interface RentPaymentTenant {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  email?: string | null;
  status: string;
}

export interface RentPaymentLease {
  id: number;
  startDate?: string;
  endDate?: string;
  monthlyRent: number;
  status: string;
  property: RentPaymentProperty;
  tenant: RentPaymentTenant;
}

export interface RentPaymentItem {
  id: number;
  leaseId: number;
  month: number;
  year: number;
  amountDue: number;
  amountPaid: number;
  paymentDate?: string | null;
  status: RentPaymentStatus;
  notes?: string | null;
  updatedAt?: string;
  propertyId: number;
  property: RentPaymentProperty;
  tenant: RentPaymentTenant;
  lease: {
    id: number;
    startDate?: string;
    endDate?: string;
    monthlyRent: number;
    status: string;
  };
}

export interface RentPaymentFormData {
  leaseId: number | string;
  year: number;
  month: number;
  amountDue: number | string;
  amountPaid: number | string;
  paymentDate?: string;
  status: 'PAID' | 'UNPAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
  notes?: string;
}
