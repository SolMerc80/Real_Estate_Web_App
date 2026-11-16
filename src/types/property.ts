export interface Property {
  id: number;
  propertyCode: string;
  propertyName: string;
  address: string;
  suburb?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  propertyType: 'HOUSE' | 'APARTMENT' | 'TOWNHOUSE' | 'COMMERCIAL' | 'OFFICE' | 'LAND' | 'OTHER';
  status: 'AVAILABLE' | 'OCCUPIED' | 'UNDER_MAINTENANCE' | 'INACTIVE';
  price: number;
  notes?: string;
  landlordId?: number | null;
  parentPropertyId?: number | null;
  parentProperty?: {
    id: number;
    propertyCode: string;
    propertyName: string;
  } | null;
  childProperties?: Array<{
    id: number;
    propertyCode: string;
    propertyName: string;
    status: string;
    price: number | null;
  }>;
  _count?: {
    tenants: number;
    leases: number;
    maintenanceJobs: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type PropertyFormData = Omit<
  Property,
  'id' | 'createdAt' | 'updatedAt' | 'parentProperty' | 'childProperties' | '_count'
>;

