export interface TenantProperty {
  id: number;
  propertyCode: string;
  propertyName: string;
  address: string;
  suburb?: string | null;
  city?: string | null;
  status?: string;
}

export interface TenantLease {
  id: number;
  startDate: string;
  endDate: string;
  monthlyRent: number | string;
  status: string;
}

export interface TenantMoveRecord {
  id: number;
  moveInDate?: string | null;
  moveOutDate?: string | null;
  notes?: string | null;
}

export interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  email?: string | null;
  status: 'ACTIVE' | 'PREVIOUS';
  notes?: string | null;
  propertyId: number;
  property: TenantProperty;
  leases?: TenantLease[];
  moveRecords?: TenantMoveRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  propertyId: number | string;
  status: 'ACTIVE' | 'PREVIOUS';
  monthlyRent?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  moveInDate?: string;
  moveOutDate?: string;
  notes?: string;
}
