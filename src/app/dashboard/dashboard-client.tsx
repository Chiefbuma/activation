
'use client';

import { useState, useEffect } from 'react';
import type { Registration, User, Corporate } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import PatientList from '@/components/dashboard/patient-list';
import SettingsView from '@/components/settings/settings-view';
import AnalyticsView from '@/components/dashboard/analytics-view';
import PartnerSnapshotView from '@/components/dashboard/partner-snapshot-view';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';

type View = 'activations' | 'passport' | 'partner' | 'settings';

export default function DashboardClient({ 
  initialPatients, 
  initialCorporates,
  initialUsers,
}: { 
  initialPatients: Registration[],
  initialCorporates: Corporate[],
  initialUsers: User[],
}) {
  const [patients] = useState(initialPatients);
  const [corporates, setCorporates] = useState(initialCorporates);
  const [users, setUsers] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [activeView, setActiveView] = useState<View>('activations');
  const [settingsSubView, setSettingsSubView] = useState<'corporates' | 'users'>('corporates');

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

  const handleViewChange = (view: View, sub?: 'corporates' | 'users') => {
    setActiveView(view);
    if (sub) setSettingsSubView(sub);
  };

  const getViewTitle = () => {
    switch(activeView) {
        case 'activations': return 'Activations';
        case 'passport': return 'Taria Passport';
        case 'partner': return 'Partner Snapshot';
        case 'settings': return 'Settings';
    }
  };

  const getViewSubtitle = () => {
    switch(activeView) {
        case 'activations': return 'Manage participant registration and assessment history';
        case 'passport': return 'Overview of screening outcomes and program health metrics';
        case 'partner': return 'Participation report by corporate partner with PDF-ready snapshot';
        case 'settings': return `Configure system ${settingsSubView}`;
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      <AppSidebar 
        activeView={activeView} 
        onViewChange={handleViewChange} 
        user={currentUser} 
      />
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
            key={activeView + (activeView === 'settings' ? settingsSubView : '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeView === 'activations' && (
              <div className="max-w-full overflow-hidden">
                  <PatientList patients={patients as any} />
              </div>
            )}
            {activeView === 'passport' && (
              <AnalyticsView patients={patients} corporates={corporates} />
            )}
            {activeView === 'partner' && (
              <PartnerSnapshotView patients={patients} corporates={corporates} />
            )}
            {activeView === 'settings' && isAdmin && (
              <SettingsView 
                  corporates={corporates} 
                  onCorporatesUpdate={handleUpdateCorporates}
                  users={users}
                  onUsersUpdate={handleUpdateUsers}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
