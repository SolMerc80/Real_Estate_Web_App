import { Metadata } from 'next';
import LeaseTrackerClient from '@/components/agent/LeaseTrackerClient';

export const metadata: Metadata = {
  title: 'Lease Tracker | Real Estate Agency',
  description: 'Track property leases, remaining days, expiration statuses, and critical renewal timelines.',
};

export default function LeasesPage() {
  return <LeaseTrackerClient />;
}
