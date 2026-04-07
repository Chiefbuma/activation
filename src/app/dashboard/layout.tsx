'use client';

import type React from 'react';
import { useEffect, useState, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
    LogOut,
    Search,
    Bell,
    UserPlus,
    ClipboardList,
    ChevronRight,
    Menu,
    ActivitySquare,
    Building2,
    Settings,
    Loader2
} from 'lucide-react';
import type { User } from '@/lib/types';
import Logo from '@/components/logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/header';

const NavLink = ({ href, children, isActive, title }: { href: string, children: React.ReactNode, isActive: boolean, title: string }) => {
    return (
        <Link
            href={href}
            className={cn(
                "group flex items-center gap-3 px-3 py-2 text-[11px] font-bold transition-colors rounded-md mx-2 mb-0.5 uppercase tracking-wider",
                isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
        >
            <div className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                {children}
            </div>
            <span className="truncate">{title}</span>
            {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
        </Link>
    );
};

const SubNavLink = ({ href, isActive, title }: { href: string; isActive: boolean; title: string }) => {
    return (
        <Link
            href={href}
            className={cn(
                "group flex items-center gap-3 ml-9 mr-2 px-3 py-1.5 text-[10px] font-bold transition-colors rounded-md mb-0.5 uppercase tracking-wider",
                isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
        >
            <span className="truncate">{title}</span>
        </Link>
    );
};

function SidebarSection({ title }: { title: string }) {
    return <p className="mt-6 mb-2 px-5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{title}</p>;
}

function SidebarNavContent({ user }: { user: User }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isAdmin = user.role === 'admin';
    
    const activeView = searchParams.get('view') || 'activations';
    const subView = searchParams.get('sub');

    return (
        <nav className="grid items-start py-4">
            <SidebarSection title="Operations" />
            <NavLink 
                href="/dashboard?view=activations" 
                isActive={pathname === '/dashboard' && activeView === 'activations'} 
                title="Activations"
            >
                <ClipboardList className="h-4 w-4" />
            </NavLink>
            <NavLink href="/dashboard/register-patient" isActive={pathname === '/dashboard/register-patient'} title="New Participant">
                <UserPlus className="h-4 w-4" />
            </NavLink>
            
            <SidebarSection title="Analytics" />
            <NavLink 
                href="/dashboard?view=partner" 
                isActive={pathname === '/dashboard' && activeView === 'partner'} 
                title="Partners Dashboard"
            >
                <Building2 className="h-4 w-4" />
            </NavLink>
            <NavLink 
                href="/dashboard?view=passport" 
                isActive={pathname === '/dashboard' && activeView === 'passport'} 
                title="Taria Passport"
            >
                <ActivitySquare className="h-4 w-4" />
            </NavLink>

            {isAdmin && (
                <>
                    <SidebarSection title="Administration" />
                    <NavLink 
                        href="/dashboard?view=settings&sub=corporates" 
                        isActive={pathname === '/dashboard' && activeView === 'settings'} 
                        title="Settings Center"
                    >
                        <Settings className="h-4 w-4" />
                    </NavLink>
                    <AnimatePresence>
                        {activeView === 'settings' && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-1 pb-2">
                                    <SubNavLink
                                        href="/dashboard?view=settings&sub=corporates"
                                        isActive={subView === 'corporates'}
                                        title="Corporates"
                                    />
                                    <SubNavLink
                                        href="/dashboard?view=settings&sub=users"
                                        isActive={subView === 'users'}
                                        title="User Accounts"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </nav>
    );
}

function AppSidebarNav({ user }: { user: User }) {
    return (
        <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <SidebarNavContent user={user} />
        </Suspense>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
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
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-card border-r shadow-sm z-40">
            <div className="h-14 flex items-center px-6 border-b">
                <Logo className="h-5 w-auto" />
            </div>
            <div className="flex-1 overflow-y-auto pt-2">
                <AppSidebarNav user={user} />
            </div>
            <div className="p-4 border-t">
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-9"
                    onClick={() => { localStorage.removeItem('loggedInUser'); router.push('/'); }}
                >
                    <LogOut className="h-4 w-4 mr-2 text-muted-foreground/60" />
                    Sign Out
                </Button>
            </div>
        </aside>
      
        <div className="flex flex-col flex-1 min-w-0 h-screen">
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-6 bg-card border-b z-30 sticky top-0">
                <div className="flex items-center gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64 bg-card">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Dashboard Navigation</SheetTitle>
                            </SheetHeader>
                            <div className="h-14 flex items-center px-6 border-b">
                                <Logo className="h-5 w-auto" />
                            </div>
                            <AppSidebarNav user={user} />
                        </SheetContent>
                    </Sheet>
                    
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            placeholder="Unified Registry Search..." 
                            className="w-64 bg-muted/50 border border-transparent rounded-md pl-9 pr-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/30 focus:bg-card"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary relative h-8 w-8">
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-primary rounded-full border border-card" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <Header user={user} />
                </div>
            </header>
            
            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar bg-background/50">
                <div className="max-w-6xl mx-auto w-full">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    </div>
  );
}
