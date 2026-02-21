import { fetchPatients, fetchCorporates, fetchUsers } from '@/lib/data';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const patients = await fetchPatients();
  const corporates = await fetchCorporates();
  const users = await fetchUsers();
  
  return (
    <DashboardClient 
      initialPatients={patients} 
      initialCorporates={corporates}
      initialUsers={users}
    />
  );
}
