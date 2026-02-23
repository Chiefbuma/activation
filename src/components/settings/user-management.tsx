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
import { PlusCircle, Edit, Trash2, Loader2, Eye, EyeOff, CheckSquare, Trash } from 'lucide-react';
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
import { saveUser, deleteUser } from '@/lib/serve';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface UserManagementProps {
  initialUsers: User[];
  onUsersUpdate: (updatedUsers: User[]) => void;
}

const emptyUser: Omit<User, 'id'> = {
  name: '',
  email: '',
  role: 'staff',
  password: '',
};

export default function UserManagement({ initialUsers, onUsersUpdate }: UserManagementProps) {
  const [users] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const { toast } = useToast();

  const handleOpenModal = (user?: User) => {
    setCurrentUser(user || { ...emptyUser });
    setShowPassword(false);
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.name || !currentUser.email) {
      toast({ variant: 'destructive', title: 'Error', description: 'Name and email are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
        await saveUser(currentUser);
        toast({ title: 'Success', description: 'User account updated.' });
        handleCloseModal();
        window.location.reload();
    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
    setIsSubmitting(false);
  };
  
  const handleDelete = async (id: number) => {
      try {
          await deleteUser(id);
          toast({ title: 'Success', description: 'User account deleted.' });
          window.location.reload();
      } catch (err: any) {
          toast({ variant: 'destructive', title: 'Error', description: err.message });
      }
  }

  const handleBulkDelete = async () => {
      setIsSubmitting(true);
      try {
          for (const row of selectedRows) {
              await deleteUser(row.id);
          }
          toast({ title: 'Success', description: `${selectedRows.length} user accounts removed.` });
          window.location.reload();
      } catch (err: any) {
          toast({ variant: 'destructive', title: 'Error', description: 'Bulk deletion failed.' });
      }
      setIsSubmitting(false);
  };

  const columns: ColumnDef<User>[] = [
    {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
            const user = row.original;
            const initials = user.name.split(' ').map(n => n[0]).join('');
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                        <p className="font-bold text-sm leading-none">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <span className="capitalize bg-muted px-2 py-0.5 rounded-full text-xs font-medium">{row.getValue("role")}</span>
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(user)} className="text-primary hover:bg-primary/10">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                                <AlertDialogDescription>Permanently remove "{user.name}".</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    }
  ];

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {selectedCount > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-primary/10 border border-primary/20 p-2 rounded-lg flex items-center justify-between shadow-sm"
            >
                <div className="flex items-center gap-2 text-primary px-2">
                    <CheckSquare className="h-4 w-4" />
                    <span className="font-bold text-xs">{selectedCount} users selected</span>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="h-8">
                            <Trash className="mr-2 h-3.5 w-3.5" /> Bulk Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Bulk Delete Users</AlertDialogTitle>
                            <AlertDialogDescription>Remove {selectedCount} system accounts? This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Confirm Deletion
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add System User
        </Button>
      </div>

      <div className="overflow-x-auto">
        <DataTable 
            columns={columns} 
            data={users} 
            onSelectionChange={(count, rows) => {
                setSelectedCount(count);
                setSelectedRows(rows);
            }} 
        />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary font-bold">{currentUser?.id ? 'Edit' : 'Add'} System User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name" className="text-primary font-bold">Full Name</Label>
                <Input id="name" name="name" value={currentUser?.name || ''} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary font-bold">Email Address</Label>
                <Input id="email" name="email" type="email" value={currentUser?.email || ''} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-primary font-bold">System Role</Label>
                <Select name="role" value={currentUser?.role || ''} onValueChange={(value) => handleSelectChange('role', value)}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
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
                <Label htmlFor="password_user" className="text-primary font-bold">Account Password {currentUser?.id && '(Optional)'}</Label>
                <div className="relative">
                    <Input id="password_user" name="password" type={showPassword ? "text" : "password"} value={currentUser?.password || ''} onChange={handleChange} required={!currentUser?.id} />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
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
