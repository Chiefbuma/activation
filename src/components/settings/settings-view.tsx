'use client';

import React, { useState, useEffect } from 'react';
import type { Corporate, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CorporateManagement from './corporate-management';
import UserManagement from './user-management';

interface SettingsViewProps {
  corporates: Corporate[];
  onCorporatesUpdate: (updatedCorporates: Corporate[]) => void;
  users: User[];
  onUsersUpdate: (updatedUsers: User[]) => void;
}

export default function SettingsView({
  corporates,
  onCorporatesUpdate,
  users,
  onUsersUpdate
}: SettingsViewProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="dark:border-primary/40">
            <CardHeader>
            <CardTitle className="text-primary">Corporate Partners</CardTitle>
            <CardDescription>
                Manage corporate entities and their scheduled wellness dates.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <CorporateManagement 
                initialCorporates={corporates} 
                onCorporatesUpdate={onCorporatesUpdate} 
            />
            </CardContent>
        </Card>
        
        {isAdmin && (
            <Card className="dark:border-primary/40">
                <CardHeader>
                <CardTitle className="text-primary">User Accounts</CardTitle>
                <CardDescription>
                    Manage system users, roles, and access credentials.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserManagement 
                        initialUsers={users}
                        onUsersUpdate={onUsersUpdate}
                    />
                </CardContent>
            </Card>
        )}
    </div>
  );
}
