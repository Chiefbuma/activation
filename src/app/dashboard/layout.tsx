'use client';

import type React from 'react';
import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import type { User } from '@/lib/types';
import Logo from '@/components/logo';
import Header from '@/components/header';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { Button } from '@/components/ui/button';
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
    <SidebarProvider defaultOpen open>
      <Suspense
        fallback={<div className="hidden h-svh w-12 border-r border-border/70 bg-sidebar/50 md:block" />}
      >
        <AppSidebar user={user} variant="floating" />
      </Suspense>

      <SidebarInset className="min-w-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(148,163,184,0.1),_transparent_24%)]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/70 bg-background/90 px-4 backdrop-blur md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {isMobile && (
              <SidebarTrigger className="h-10 w-10 rounded-2xl border border-border/70 bg-card shadow-sm transition-colors hover:bg-muted/70 md:hidden" />
            )}
            <Logo className="h-5 w-auto md:hidden" />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-2xl border border-transparent text-muted-foreground transition-colors hover:border-border/70 hover:bg-card hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            </Button>
            <Header user={user} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
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
