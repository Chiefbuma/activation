'use client';

import { useState } from 'react';
import type { Registration, ClinicalParameter, User } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, SlidersHorizontal } from 'lucide-react';
import PatientList from '@/components/dashboard/patient-list';
import SettingsView from '@/components/settings/settings-view';
import Notifications from '@/components/dashboard/notifications';

type View = 'activations' | 'settings';

export default function DashboardClient({ 
  initialPatients, 
  initialClinicalParameters,
  initialUsers,
}: { 
  initialPatients: Registration[],
  initialClinicalParameters: any[],
  initialUsers: User[],
}) {
  const [patients, setPatients] = useState(initialPatients);
  const [clinicalParameters, setClinicalParameters] = useState(initialClinicalParameters);
  const [users, setUsers] = useState(initialUsers);
  const [activeView, setActiveView] = useState<View>('activations');

  const handleUpdateParameters = (updatedParameters: any[]) => {
    setClinicalParameters(updatedParameters);
  };
  
  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                {activeView === 'activations' ? 'Activations' : 'Settings'}
                </h1>
                <p className="text-muted-foreground">
                {activeView === 'activations' ? 'Manage participant registration and assessment' : 'Configure application settings'}
                </p>
            </div>
            <div className="flex items-center gap-2 p-1 bg-muted rounded-xl border w-fit">
                <NavButton 
                    label="Activations" 
                    icon={<Users />} 
                    isActive={activeView === 'activations'}
                    onClick={() => setActiveView('activations')}
                />
                <NavButton 
                    label="Settings" 
                    icon={<SlidersHorizontal />} 
                    isActive={activeView === 'settings'}
                    onClick={() => setActiveView('settings')}
                />
            </div>
       </div>
      

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'activations' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <PatientList patients={patients as any} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <Notifications />
                </div>
            </div>
          )}
          {activeView === 'settings' && <SettingsView 
              clinicalParameters={clinicalParameters as any} 
              onParametersUpdate={handleUpdateParameters}
              users={users}
              onUsersUpdate={handleUpdateUsers}
           />}
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
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
