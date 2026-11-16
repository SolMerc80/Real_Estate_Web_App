export type RatesAndLevyEntryItem = {
  id: number;
  ratesAndLevyId: number;
  month: number;
  year: number;
  amount: number;
  dueDate: string | null;
  paid: boolean;
  paidDate: string | null;
  updatedAt: string;
};

export type RatesAndLevyItem = {
  id: number;
  propertyId: number;
  accountName: string;
  accountNumber: string | null;
  notes: string | null;
  property: {
    id: number;
    propertyCode: string;
    propertyName: string;
    address: string;
    city: string | null;
    status: string;
  };
  currentEntry: RatesAndLevyEntryItem | null;
  entries: RatesAndLevyEntryItem[];
  createdAt: string;
  updatedAt: string;
};

