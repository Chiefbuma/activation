'use client';

import React, { useState, useEffect } from 'react';
import type { Corporate, User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import CorporateManagement from './corporate-management';
import UserManagement from './user-management';

interface SettingsViewProps {
  corporates: Corporate[];
  onCorporatesUpdate: (updatedCorporates: Corporate[]) => void;
  users: User[];
  onUsersUpdate: (updatedUsers: User[]) => void;
  view?: 'corporates' | 'users';
}

export default function SettingsView({
  corporates,
  onCorporatesUpdate,
  users,
  onUsersUpdate,
  view = 'corporates',
}: SettingsViewProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) return null;

  return (
    <Card className="dark:border-primary/40">
      <CardContent className="pt-6">
        {view === 'users' ? (
          <UserManagement
            initialUsers={users}
            onUsersUpdate={onUsersUpdate}
          />
        ) : (
          <CorporateManagement
            initialCorporates={corporates}
            onCorporatesUpdate={onCorporatesUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
}
