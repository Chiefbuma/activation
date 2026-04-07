'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Registration, User, Corporate } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import PatientList from '@/components/dashboard/patient-list';
import SettingsView from '@/components/settings/settings-view';
import AnalyticsView from '@/components/dashboard/analytics-view';
import PartnerSnapshotView from '@/components/dashboard/partner-snapshot-view';
import { SidebarTrigger } from '@/components/ui/sidebar';

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
        case 'settings': return 'Settings';
        default: return 'Activations';
    }
  };

  const getViewSubtitle = () => {
    switch(activeViewFromUrl) {
        case 'activations': return 'Manage participant registration and assessment history';
        case 'passport': return 'Overview of screening outcomes and program health metrics';
        case 'partner': return 'Participation report by corporate partner with PDF-ready snapshot';
        case 'settings': return `Configure system ${subViewFromUrl}`;
        default: return 'Manage participant registration and history';
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <div className="w-full md:w-auto">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                        {getViewTitle()}
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        {getViewSubtitle()}
                    </p>
                </div>
            </div>
       </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeViewFromUrl + (activeViewFromUrl === 'settings' ? subViewFromUrl : '')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
