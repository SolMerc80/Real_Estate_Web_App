export type LeaseTrackerStatus = 'CRITICAL' | 'EXPIRING_SOON' | 'ACTIVE' | 'EXPIRED';

export interface LeasePropertyInfo {
  id: number;
  propertyCode: string;
  propertyName: string;
  address: string;
  suburb?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
}

export interface LeaseTenantInfo {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  email?: string | null;
  status: string;
}

export interface LeaseItem {
  id: number;
  propertyId: number;
  tenantId: number;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositHeld?: number | null;
  dbStatus: string;
  calculatedStatus: LeaseTrackerStatus;
  daysRemaining: number;
  notes?: string | null;
  renewalDate?: string | null;
  leaseReference?: string | null;
  property: LeasePropertyInfo;
  tenant: LeaseTenantInfo;
}
