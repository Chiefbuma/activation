import { fetchPatients, fetchCorporates, fetchUsers } from '@/lib/data';
import DashboardClient from './dashboard-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default async function DashboardPage() {
  const patients = await fetchPatients();
  const corporates = await fetchCorporates();
  const users = await fetchUsers();
  
  return (
    <Suspense fallback={
        <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
        </div>
    }>
        <DashboardClient 
            initialPatients={patients} 
            initialCorporates={corporates}
            initialUsers={users}
        />
    </Suspense>
  );
}
