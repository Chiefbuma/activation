
'use client';

import * as React from 'react';
import {
  Users,
  ActivitySquare,
  Building2,
  SlidersHorizontal,
  Building,
  UserCog,
  ChevronRight,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Logo from '@/components/logo';
import Link from 'next/link';
import type { User } from '@/lib/types';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeView: string;
  onViewChange: (view: any, sub?: any) => void;
  user: User | null;
}

export function AppSidebar({ activeView, onViewChange, user, ...props }: AppSidebarProps) {
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
                isActive={activeView === 'activations'} 
                onClick={() => onViewChange('activations')}
                tooltip="Activations"
              >
                <Users />
                <span>Activations</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={activeView === 'passport'} 
                onClick={() => onViewChange('passport')}
                tooltip="Taria Passport"
              >
                <ActivitySquare />
                <span>Taria Passport</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={activeView === 'partner'} 
                onClick={() => onViewChange('partner')}
                tooltip="Partner Snapshot"
              >
                <Building2 />
                <span>Partner Snapshot</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
                      <SlidersHorizontal />
                      <span>Settings</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => onViewChange('settings', 'corporates')}
                          isActive={activeView === 'settings'}
                        >
                          <Building className="h-4 w-4 mr-2" />
                          <span>Corporate Partners</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => onViewChange('settings', 'users')}
                          isActive={activeView === 'settings'}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          <span>User Accounts</span>
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
