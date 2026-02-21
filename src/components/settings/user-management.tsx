'use client';

import { useState } from 'react';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, Key } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserManagementProps {
  initialUsers: User[];
  onUsersUpdate: (updatedUsers: User[]) => void;
}

const emptyUser: Omit<User, 'id'> = {
  name: '',
  email: '',
  role: 'staff',
  password: '',
  avatarUrl: ''
};

export default function UserManagement({ initialUsers, onUsersUpdate }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const { toast } = useToast();

  const handleOpenModal = (user?: User) => {
    setCurrentUser(user || { ...emptyUser });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, [name]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.name || !currentUser.email) {
      toast({ variant: 'destructive', title: 'Error', description: 'Name and email are required.' });
      return;
    }

    if (!currentUser.id && !currentUser.password) {
        toast({ variant: 'destructive', title: 'Error', description: 'Password is required for new users.' });
        return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
        let updatedUsers;
        if (currentUser.id) {
            updatedUsers = users.map(u => u.id === currentUser!.id ? (currentUser as User) : u);
        } else {
            const newUser: User = {
                id: Date.now(),
                ...emptyUser,
                ...currentUser,
            } as User;
            updatedUsers = [...users, newUser];
        }
        
        setUsers(updatedUsers);
        onUsersUpdate(updatedUsers);
        toast({ title: 'Success', description: `User ${currentUser.id ? 'updated' : 'created'} successfully.` });
        
        setIsSubmitting(false);
        handleCloseModal();
    }, 500);
  };
  
  const handleDelete = (id: number) => {
      const updatedUsers = users.filter(u => u.id !== id);
      setUsers(updatedUsers);
      onUsersUpdate(updatedUsers);
      toast({ title: 'Success', description: 'User account deleted successfully.' });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()} className="bg-teal-600 hover:bg-teal-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="rounded-xl border dark:border-teal-500/20 overflow-hidden">
        <div className="divide-y divide-border dark:divide-teal-500/10">
          {users.length > 0 ? (
            users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 flex items-center justify-center bg-primary/10 text-primary font-bold rounded-full border shadow-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(user)} className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20">
                        <Edit className="h-4 w-4" />
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the account for "{user.name}". This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel className="dark:text-foreground">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No system users found.</p>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg dark:border-teal-500/30">
          <DialogHeader>
            <DialogTitle className="text-teal-600 dark:text-teal-400">{currentUser?.id ? 'Edit' : 'Add'} System User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name" className="text-primary font-bold">Full Name</Label>
                <Input id="name" name="name" value={currentUser?.name || ''} onChange={handleChange} required className="dark:border-teal-500/40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary font-bold">Email Address</Label>
                <Input id="email" name="email" type="email" value={currentUser?.email || ''} onChange={handleChange} required className="dark:border-teal-500/40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-primary font-bold">System Role</Label>
                <Select name="role" value={currentUser?.role || ''} onValueChange={(value) => handleSelectChange('role', value)}>
                    <SelectTrigger className="dark:border-teal-500/40"><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="navigator">Navigator</SelectItem>
                        <SelectItem value="physician">Physician</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="payer">Payer</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password" className="text-primary font-bold">Account Password {currentUser?.id && '(Leave blank to keep current)'}</Label>
                <div className="relative">
                    <Input id="password" name="password" type="password" value={currentUser?.password || ''} onChange={handleChange} required={!currentUser?.id} className="pr-10 dark:border-teal-500/40" />
                    <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="dark:text-foreground">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentUser?.id ? 'Save Changes' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
