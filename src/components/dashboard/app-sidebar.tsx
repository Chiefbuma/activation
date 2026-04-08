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
      className="border-none md:p-3"
      {...props}
    >
      <div className="flex h-full flex-col rounded-[26px] bg-[linear-gradient(180deg,hsl(var(--sidebar-background))_0%,hsl(var(--sidebar-accent))_100%)] text-sidebar-foreground">
        <SidebarHeader className="border-b border-sidebar-border/55 px-3.5 py-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-2xl px-1.5 py-1 transition-opacity hover:opacity-80"
            >
              <Logo className="h-5 w-auto text-sidebar-foreground" />
            </Link>
          </motion.div>
        </SidebarHeader>

        <SidebarContent className="px-2.5 py-2.5">
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
            <SidebarMenu className="gap-0.5 font-sidebar">
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
                    className="h-8 rounded-[16px] border border-transparent px-2.5 text-[12.5px] font-semibold tracking-[0.005em] text-sidebar-foreground/82 transition-all duration-200 hover:border-sidebar-border/65 hover:bg-sidebar-primary/16 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/70 data-[active=true]:bg-sidebar-primary/10 data-[active=true]:text-sidebar-foreground"
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
                    className="h-8 rounded-[16px] border border-transparent px-2.5 text-[12.5px] font-semibold tracking-[0.005em] text-sidebar-foreground/82 transition-all duration-200 hover:border-sidebar-border/65 hover:bg-sidebar-primary/16 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/70 data-[active=true]:bg-sidebar-primary/10 data-[active=true]:text-sidebar-foreground"
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
                      <SidebarMenuSub className="mt-0.5 ml-2.5 mr-0 gap-0.5 border-sidebar-border/45 px-1.5 py-0">
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === '/dashboard' && activeView === 'passport'}
                            className="h-7 rounded-[14px] border border-transparent px-2.5 text-[11.5px] font-medium text-sidebar-foreground/72 transition-all duration-200 hover:border-sidebar-border/55 hover:bg-sidebar-primary/14 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/65 data-[active=true]:bg-sidebar-primary/8 data-[active=true]:text-sidebar-foreground"
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
                            className="h-7 rounded-[14px] border border-transparent px-2.5 text-[11.5px] font-medium text-sidebar-foreground/72 transition-all duration-200 hover:border-sidebar-border/55 hover:bg-sidebar-primary/14 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/65 data-[active=true]:bg-sidebar-primary/8 data-[active=true]:text-sidebar-foreground"
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
                      className="h-8 rounded-[16px] border border-transparent px-2.5 text-[12.5px] font-semibold tracking-[0.005em] text-sidebar-foreground/82 transition-all duration-200 hover:border-sidebar-border/65 hover:bg-sidebar-primary/16 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/70 data-[active=true]:bg-sidebar-primary/10 data-[active=true]:text-sidebar-foreground"
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
                        <SidebarMenuSub className="mt-0.5 ml-2.5 mr-0 gap-0.5 border-sidebar-border/45 px-1.5 py-0">
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === '/dashboard' && activeView === 'settings' && subView === 'corporates'}
                              className="h-7 rounded-[14px] border border-transparent px-2.5 text-[11.5px] font-medium text-sidebar-foreground/72 transition-all duration-200 hover:border-sidebar-border/55 hover:bg-sidebar-primary/14 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/65 data-[active=true]:bg-sidebar-primary/8 data-[active=true]:text-sidebar-foreground"
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
                              className="h-7 rounded-[14px] border border-transparent px-2.5 text-[11.5px] font-medium text-sidebar-foreground/72 transition-all duration-200 hover:border-sidebar-border/55 hover:bg-sidebar-primary/14 hover:text-sidebar-foreground data-[active=true]:border-sidebar-border/65 data-[active=true]:bg-sidebar-primary/8 data-[active=true]:text-sidebar-foreground"
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

        <SidebarFooter className="mt-auto border-t border-sidebar-border/55 px-3 py-3 font-sidebar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.12, ease: 'easeOut' }}
            className="space-y-2"
          >
            <div className="rounded-[18px] border border-sidebar-border/45 bg-sidebar-primary/7 px-2.5 py-2">
              <p className="text-[10.5px] font-medium text-sidebar-foreground">
                {user?.name || 'Taria User'}
              </p>
              <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.12em] text-sidebar-foreground/55">
                {user?.role || 'staff'} · {initials}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="h-8 w-full justify-start rounded-[16px] px-2.5 text-[11.5px] font-medium text-sidebar-foreground/72 hover:bg-destructive/10 hover:text-destructive"
            >
              Sign out
            </Button>
          </motion.div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
