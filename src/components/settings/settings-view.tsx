'use client';

import React, { useState, useEffect } from 'react';
import type { Corporate, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CorporateManagement from './corporate-management';
import UserManagement from './user-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingsViewProps {
  corporates: Corporate[];
  onCorporatesUpdate: (updatedCorporates: Corporate[]) => void;
  users: User[];
  onUsersUpdate: (updatedUsers: User[]) => void;
  defaultTab?: 'corporates' | 'users';
}

export default function SettingsView({
  corporates,
  onCorporatesUpdate,
  users,
  onUsersUpdate,
  defaultTab = 'corporates'
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
    <Tabs defaultValue={defaultTab} className="w-full space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="corporates">Corporate Partners</TabsTrigger>
        <TabsTrigger value="users">User Accounts</TabsTrigger>
      </TabsList>

      <TabsContent value="corporates">
        <Card className="dark:border-primary/40">
            <CardHeader>
            <CardTitle className="text-primary">Corporate Partners</CardTitle>
            <CardDescription>
                Manage corporate entities, wellness dates, and expected participant targets for partner snapshot reporting.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <CorporateManagement 
                initialCorporates={corporates} 
                onCorporatesUpdate={onCorporatesUpdate} 
            />
            </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users">
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
      </TabsContent>
    </Tabs>
  );
}
