'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings2,
  Users,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';

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

  const menuButtonClass = cn(
    'h-10 rounded-md border border-transparent px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors',
    'hover:border-border/70 hover:bg-muted/50 hover:text-foreground',
    'data-[active=true]:border-primary/20 data-[active=true]:bg-primary/10 data-[active=true]:text-primary'
  );

  const subMenuButtonClass = cn(
    'h-8 rounded-md border border-transparent px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors',
    'hover:border-border/70 hover:bg-muted/50 hover:text-foreground',
    'data-[active=true]:border-primary/20 data-[active=true]:bg-primary/10 data-[active=true]:text-primary'
  );

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-none"
      {...props}
    >
      <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="flex h-14 items-center border-b border-sidebar-border px-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center transition-opacity hover:opacity-80"
            >
              <Logo className="h-5 w-auto text-foreground" />
            </Link>
          </motion.div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
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
            <SidebarMenu className="gap-1">
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
                    className={menuButtonClass}
                  >
                    <Link href="/dashboard?view=activations">
                      <ClipboardList className="h-4 w-4" />
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
                    className={menuButtonClass}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                    {dashboardOpen ? (
                      <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-60" />
                    ) : (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                    )}
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
                      <SidebarMenuSub className="mt-1 ml-5 mr-2 gap-1 border-sidebar-border/70 px-2 py-0">
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === '/dashboard' && activeView === 'passport'}
                            className={subMenuButtonClass}
                          >
                            <Link href="/dashboard?view=passport">
                              <BarChart3 className="h-3.5 w-3.5" />
                              <span>Taria Passport</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === '/dashboard' && activeView === 'partner'}
                            className={subMenuButtonClass}
                          >
                            <Link href="/dashboard?view=partner">
                              <BriefcaseBusiness className="h-3.5 w-3.5" />
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
                      tooltip="Settings"
                      onClick={() => setSettingsOpen((open) => !open)}
                      className={menuButtonClass}
                    >
                      <Settings2 className="h-4 w-4" />
                      <span>Settings</span>
                      {settingsOpen ? (
                        <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-60" />
                      ) : (
                        <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                      )}
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
                        <SidebarMenuSub className="mt-1 ml-5 mr-2 gap-1 border-sidebar-border/70 px-2 py-0">
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === '/dashboard' && activeView === 'settings' && subView === 'corporates'}
                              className={subMenuButtonClass}
                            >
                              <Link href="/dashboard?view=settings&sub=corporates">
                                <BriefcaseBusiness className="h-3.5 w-3.5" />
                                <span>Corporates</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === '/dashboard' && activeView === 'settings' && subView === 'users'}
                              className={subMenuButtonClass}
                            >
                              <Link href="/dashboard?view=settings&sub=users">
                                <Users className="h-3.5 w-3.5" />
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

        <SidebarFooter className="mt-auto border-t border-sidebar-border px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.12, ease: 'easeOut' }}
            className="space-y-2"
          >
            <div className="rounded-md border border-sidebar-border bg-muted/30 px-3 py-2.5">
              <p className="text-[11px] font-semibold text-foreground">
                {user?.name || 'Taria User'}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {user?.role || 'staff'} · {initials}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="h-9 w-full justify-start rounded-md px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </motion.div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
