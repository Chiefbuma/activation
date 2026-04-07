'use client';

import * as React from 'react';
import {
  Users,
  LayoutDashboard,
  Building2,
  ActivitySquare,
  Settings,
  Building,
  UserCog,
  ChevronRight,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Logo from '@/components/logo';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { User } from '@/lib/types';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeView = searchParams.get('view') || 'activations';
  const subView = searchParams.get('sub');
  
  const isAdmin = user?.role === 'admin';

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-16 flex items-center justify-center border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="h-6 w-auto" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={pathname === '/dashboard' && activeView === 'activations'} 
                tooltip="Activations"
              >
                <Link href="/dashboard?view=activations">
                  <Users />
                  <span>Activations</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <Collapsible asChild defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={activeView === 'partner'}>
                        <Link href="/dashboard?view=partner">
                          <Building2 className="h-4 w-4 mr-2" />
                          <span>Partners Dashboard</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={activeView === 'passport'}>
                        <Link href="/dashboard?view=passport">
                          <ActivitySquare className="h-4 w-4 mr-2" />
                          <span>Taria Passport</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible asChild defaultOpen={activeView === 'settings'} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Settings">
                      <Settings />
                      <span>Settings</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={activeView === 'settings' && subView === 'corporates'}>
                          <Link href="/dashboard?view=settings&sub=corporates">
                            <Building className="h-4 w-4 mr-2" />
                            <span>Corporates</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={activeView === 'settings' && subView === 'users'}>
                          <Link href="/dashboard?view=settings&sub=users">
                            <UserCog className="h-4 w-4 mr-2" />
                            <span>User Accounts</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2 px-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Active</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
