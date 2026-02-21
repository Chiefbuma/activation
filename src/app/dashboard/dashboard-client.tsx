'use client';

import { useState } from 'react';
import type { Registration, User, Corporate } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, SlidersHorizontal } from 'lucide-react';
import PatientList from '@/components/dashboard/patient-list';
import SettingsView from '@/components/settings/settings-view';
import AnalyticsView from '@/components/dashboard/analytics-view';

type View = 'dashboard' | 'activations' | 'settings';

export default function DashboardClient({ 
  initialPatients, 
  initialCorporates,
  initialUsers,
}: { 
  initialPatients: Registration[],
  initialCorporates: Corporate[],
  initialUsers: User[],
}) {
  const [patients, setPatients] = useState(initialPatients);
  const [corporates, setCorporates] = useState(initialCorporates);
  const [users, setUsers] = useState(initialUsers);
  const [activeView, setActiveView] = useState<View>('dashboard');

  const handleUpdateCorporates = (updatedCorporates: Corporate[]) => {
    setCorporates(updatedCorporates);
  };
  
  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  const getViewTitle = () => {
    switch(activeView) {
        case 'dashboard': return 'Dashboard';
        case 'activations': return 'Activations';
        case 'settings': return 'Settings';
    }
  };

  const getViewSubtitle = () => {
    switch(activeView) {
        case 'dashboard': return 'Overview of health program performance and corporate metrics';
        case 'activations': return 'Manage participant registration and assessment history';
        case 'settings': return 'Configure application users and corporate partners';
    }
  };

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    {getViewTitle()}
                </h1>
                <p className="text-muted-foreground">
                    {getViewSubtitle()}
                </p>
            </div>
            <div className="flex items-center gap-2 p-1 bg-muted rounded-xl border w-fit shadow-sm">
                <NavButton 
                    label="Dashboard" 
                    icon={<LayoutDashboard className="h-4 w-4" />} 
                    isActive={activeView === 'dashboard'}
                    onClick={() => setActiveView('dashboard')}
                />
                <NavButton 
                    label="Activations" 
                    icon={<Users className="h-4 w-4" />} 
                    isActive={activeView === 'activations'}
                    onClick={() => setActiveView('activations')}
                />
                <NavButton 
                    label="Settings" 
                    icon={<SlidersHorizontal className="h-4 w-4" />} 
                    isActive={activeView === 'settings'}
                    onClick={() => setActiveView('settings')}
                />
            </div>
       </div>
      

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === 'dashboard' && (
            <AnalyticsView patients={patients} corporates={corporates} />
          )}
          {activeView === 'activations' && (
            <div className="max-w-full">
                <PatientList patients={patients as any} />
            </div>
          )}
          {activeView === 'settings' && (
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
  );
}

const NavButton = ({ label, icon, isActive, onClick }: { label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isActive && (
        <motion.div
          layoutId="active-nav-bg"
          className="absolute inset-0 bg-background rounded-lg shadow-sm z-0"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
};
