'use client';

import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import Link from 'next/link';

export default function Header({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    router.push('/');
  };

  const getInitials = (name: any) => {
      if (!name || typeof name !== 'string') return 'U';
      // Use regex to find first letters of words instead of split() to avoid TypeError
      const matches = name.match(/\b\w/g) || [];
      return matches.join('').toUpperCase().slice(0, 2) || 'U';
  };

  const initials = getInitials(user?.name);

  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full border-2 border-background shadow-sm"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          {user?.role === 'admin' && (
            <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/dashboard">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
