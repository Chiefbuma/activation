'use client';

import type React from 'react';
import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { User } from '@/lib/types';
import Logo from '@/components/logo';
import Header from '@/components/header';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/');
    }

    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Logo className="h-6 w-auto animate-pulse opacity-50" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Suspense
        fallback={<div className="hidden h-svh w-64 border-r border-border/70 bg-card md:block" />}
      >
        <AppSidebar user={user} />
      </Suspense>

      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border/70 bg-card px-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {isMobile && (
              <SidebarTrigger className="h-9 w-9 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden" />
            )}
            <Logo className="h-5 w-auto md:hidden" />
          </div>

          <Header user={user} />
        </header>

        <main className="flex-1 overflow-y-auto bg-background/50 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
