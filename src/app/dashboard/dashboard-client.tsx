'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Registration, User, Corporate } from '@/lib/types';
import PatientList from '@/components/dashboard/patient-list';
import SettingsView from '@/components/settings/settings-view';
import AnalyticsView from '@/components/dashboard/analytics-view';
import PartnerSnapshotView from '@/components/dashboard/partner-snapshot-view';

export default function DashboardClient({ 
  initialPatients, 
  initialCorporates,
  initialUsers,
}: { 
  initialPatients: Registration[],
  initialCorporates: Corporate[],
  initialUsers: User[],
}) {
  const searchParams = useSearchParams();
  const activeViewFromUrl = searchParams.get('view') || 'activations';
  const subViewFromUrl = (searchParams.get('sub') as 'corporates' | 'users') || 'corporates';

  const [patients] = useState(initialPatients);
  const [corporates, setCorporates] = useState(initialCorporates);
  const [users, setUsers] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const handleUpdateCorporates = (updatedCorporates: Corporate[]) => {
    setCorporates(updatedCorporates);
  };
  
  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  const getViewTitle = () => {
    switch(activeViewFromUrl) {
        case 'activations': return 'Activations';
        case 'passport': return 'Taria Passport';
        case 'partner': return 'Partner Snapshot';
        case 'settings': return 'Settings Center';
        default: return 'Activations';
    }
  };

  const getViewSubtitle = () => {
    switch(activeViewFromUrl) {
        case 'activations': return 'Manage participant registration and assessment history';
        case 'passport': return 'High-density aggregate screening outcome reports';
        case 'partner': return 'Corporate participation summary and PDF-ready snapshots';
        case 'settings': return `System configuration for ${subViewFromUrl}`;
        default: return 'Registry';
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-primary/10 pb-6">
            <div className="w-full md:w-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                    {getViewTitle()}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {getViewSubtitle()}
                </p>
            </div>
       </div>
      
      <div className="w-full">
          {activeViewFromUrl === 'activations' && (
            <div className="max-w-full overflow-hidden">
                <PatientList patients={patients as any} />
            </div>
          )}
          {activeViewFromUrl === 'passport' && (
            <AnalyticsView patients={patients} corporates={corporates} />
          )}
          {activeViewFromUrl === 'partner' && (
            <PartnerSnapshotView patients={patients} corporates={corporates} />
          )}
          {activeViewFromUrl === 'settings' && isAdmin && (
            <SettingsView 
                corporates={corporates} 
                onCorporatesUpdate={handleUpdateCorporates}
                users={users}
                onUsersUpdate={handleUpdateUsers}
                defaultTab={subViewFromUrl}
            />
          )}
      </div>
    </div>
  );
}
