'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import Logo from '@/components/logo';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeView = searchParams.get('view') || 'activations';
  const subView = searchParams.get('sub');

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'TH';

  const isAdmin = user?.role === 'admin';
  const isPatientRoute = pathname.startsWith('/dashboard/patient/');
  const isAnalyticsOpen = pathname === '/dashboard' && (activeView === 'partner' || activeView === 'passport');
  const isSettingsOpen = pathname === '/dashboard' && activeView === 'settings';
  const [dashboardOpen, setDashboardOpen] = React.useState(isAnalyticsOpen);
  const [settingsOpen, setSettingsOpen] = React.useState(isSettingsOpen);

  React.useEffect(() => {
    if (isAnalyticsOpen) {
      setDashboardOpen(true);
    }
  }, [isAnalyticsOpen]);

  React.useEffect(() => {
    if (isSettingsOpen) {
      setSettingsOpen(true);
    }
  }, [isSettingsOpen]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    router.push('/');
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-none"
      {...props}
    >
      <div className="flex h-full flex-col bg-[linear-gradient(180deg,hsl(var(--sidebar-background)),hsl(var(--sidebar-accent)))] text-sidebar-foreground">
        <SidebarHeader className="border-b border-sidebar-border/70 px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-xl px-1 py-1 transition-opacity hover:opacity-80"
            >
              <Logo className="h-6 w-auto text-sidebar-foreground" />
            </Link>
          </motion.div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-3">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            <SidebarMenu className="gap-1 font-sidebar">
              <SidebarMenuItem>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={(pathname === '/dashboard' && activeView === 'activations') || isPatientRoute}
                    tooltip="Activation"
                    className="h-9 rounded-xl border border-transparent px-3 text-[13px] font-semibold tracking-[0.01em] text-sidebar-foreground/80 transition-all duration-200 hover:border-sidebar-border/70 hover:bg-sidebar-primary/14 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/80 data-[active=true]:bg-sidebar-primary/10 data-[active=true]:text-sidebar-foreground"
                  >
                    <Link href="/dashboard?view=activations">
                      <span>Activation</span>
                    </Link>
                  </SidebarMenuButton>
                </motion.div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <SidebarMenuButton
                    type="button"
                    isActive={isAnalyticsOpen}
                    tooltip="Dashboard"
                    onClick={() => setDashboardOpen((open) => !open)}
                    className="h-9 rounded-xl border border-transparent px-3 text-[13px] font-semibold tracking-[0.01em] text-sidebar-foreground/80 transition-all duration-200 hover:border-sidebar-border/70 hover:bg-sidebar-primary/14 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/80 data-[active=true]:bg-sidebar-primary/10 data-[active=true]:text-sidebar-foreground"
                  >
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </motion.div>
                <AnimatePresence initial={false}>
                  {dashboardOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <SidebarMenuSub className="mt-1 ml-3 mr-0 gap-1 border-sidebar-border/50 px-2 py-0">
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === '/dashboard' && activeView === 'passport'}
                            className="h-8 rounded-lg border border-transparent px-3 text-[12px] font-medium text-sidebar-foreground/68 transition-all duration-200 hover:bg-sidebar-primary/12 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/70 data-[active=true]:bg-sidebar-primary/8 data-[active=true]:text-sidebar-foreground"
                          >
                            <Link href="/dashboard?view=passport">
                              <span>Taria Passport</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === '/dashboard' && activeView === 'partner'}
                            className="h-8 rounded-lg border border-transparent px-3 text-[12px] font-medium text-sidebar-foreground/68 transition-all duration-200 hover:bg-sidebar-primary/12 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/70 data-[active=true]:bg-sidebar-primary/8 data-[active=true]:text-sidebar-foreground"
                          >
                            <Link href="/dashboard?view=partner">
                              <span>Partners Snapshot</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SidebarMenuItem>

              {isAdmin && (
                <SidebarMenuItem>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <SidebarMenuButton
                      type="button"
                      isActive={isSettingsOpen}
                      tooltip="Setting"
                      onClick={() => setSettingsOpen((open) => !open)}
                      className="h-9 rounded-xl border border-transparent px-3 text-[13px] font-semibold tracking-[0.01em] text-sidebar-foreground/80 transition-all duration-200 hover:border-sidebar-border/70 hover:bg-sidebar-primary/14 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/80 data-[active=true]:bg-sidebar-primary/10 data-[active=true]:text-sidebar-foreground"
                    >
                      <span>Setting</span>
                    </SidebarMenuButton>
                  </motion.div>
                  <AnimatePresence initial={false}>
                    {settingsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <SidebarMenuSub className="mt-1 ml-3 mr-0 gap-1 border-sidebar-border/50 px-2 py-0">
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === '/dashboard' && activeView === 'settings' && subView === 'corporates'}
                              className="h-8 rounded-lg border border-transparent px-3 text-[12px] font-medium text-sidebar-foreground/68 transition-all duration-200 hover:bg-sidebar-primary/12 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/70 data-[active=true]:bg-sidebar-primary/8 data-[active=true]:text-sidebar-foreground"
                            >
                              <Link href="/dashboard?view=settings&sub=corporates">
                                <span>Corporates</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === '/dashboard' && activeView === 'settings' && subView === 'users'}
                              className="h-8 rounded-lg border border-transparent px-3 text-[12px] font-medium text-sidebar-foreground/68 transition-all duration-200 hover:bg-sidebar-primary/12 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/70 data-[active=true]:bg-sidebar-primary/8 data-[active=true]:text-sidebar-foreground"
                            >
                              <Link href="/dashboard?view=settings&sub=users">
                                <span>User Accounts</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </motion.div>
        </SidebarContent>

        <SidebarFooter className="mt-auto border-t border-sidebar-border/70 px-4 py-4 font-sidebar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.12, ease: 'easeOut' }}
            className="space-y-3"
          >
            <div className="rounded-2xl bg-sidebar-primary/8 px-3 py-3">
              <p className="text-[11px] font-medium text-sidebar-foreground">
                {user?.name || 'Taria User'}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/55">
                {user?.role || 'staff'} · {initials}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="h-9 w-full justify-start rounded-xl px-3 text-[12px] font-medium text-sidebar-foreground/72 hover:bg-destructive/10 hover:text-destructive"
            >
              Sign out
            </Button>
          </motion.div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
