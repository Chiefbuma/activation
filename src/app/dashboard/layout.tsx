'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { placeholderImages } from '@/lib/placeholder-images';
import Header from '@/components/header';
import Logo from '@/components/logo';
import Link from 'next/link';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const userForState: User = {
        ...parsedUser,
        avatarUrl: parsedUser.avatarUrl || placeholderImages.find(p => p.id === 'user-avatar')?.imageUrl,
      };
      setUser(userForState);
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar user={user} />
        <SidebarInset>
          <header className="flex h-16 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:px-8 sticky top-0 z-50 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary md:hidden">
                      <Logo className="h-8 w-auto" />
                  </Link>
              </div>
              <div className="flex items-center gap-4">
                  <Header user={user} />
              </div>
          </header>
          <main className="flex-1 container mx-auto py-6 px-4 lg:px-8">
              {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
