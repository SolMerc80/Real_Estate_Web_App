import { Metadata } from 'next';
import RentTrackerClient from '@/components/agent/RentTrackerClient';

export const metadata: Metadata = {
  title: 'Rent Tracker | Real Estate Agency',
  description: 'Rent Tracker ledger with property details, tenants, due amounts, amounts paid, payment dates, status toggles, notes, and total calculations.',
};

export default function PaymentsPage() {
  return <RentTrackerClient />;
}
