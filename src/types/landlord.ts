export interface LandlordProperty {
  id: number;
  propertyCode: string;
  propertyName: string;
  address: string;
  suburb?: string | null;
  city?: string | null;
  price?: number | string | null;
  status?: string | null;
  managingAgent?: string | null;
  notes?: string | null;
}

export interface Landlord {
  id: number;
  displayName: string;
  phoneNumber?: string | null;
  email?: string | null;
  commissionRate?: number | string | null;
  notes?: string | null;
  properties?: LandlordProperty[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LandlordFormData {
  displayName: string;
  phoneNumber: string;
  email: string;
  commissionRate: string | number;
  propertyId?: number | string | null;
  managingAgent?: string;
  notes?: string;
}
