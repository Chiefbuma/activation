'use client';

import { useState } from 'react';
import type { Corporate } from '@/lib/types';
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
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, CheckSquare, Trash } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { saveCorporate, deleteCorporate } from '@/lib/serve';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';

interface CorporateManagementProps {
  initialCorporates: Corporate[];
  onCorporatesUpdate: (updatedCorporates: Corporate[]) => void;
}

const emptyCorporate: Omit<Corporate, 'id'> = {
  name: '',
  wellness_date: new Date().toISOString().split('T')[0],
};

export default function CorporateManagement({ initialCorporates, onCorporatesUpdate }: CorporateManagementProps) {
  const [corporates] = useState<Corporate[]>(initialCorporates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCorporate, setCurrentCorporate] = useState<Partial<Corporate> | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const { toast } = useToast();

  const handleOpenModal = (corporate?: Corporate) => {
    setCurrentCorporate(corporate || { ...emptyCorporate });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCorporate(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentCorporate) return;
    setCurrentCorporate({ ...currentCorporate, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCorporate || !currentCorporate.name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Corporate name is required.' });
      return;
    }
    
    setIsSubmitting(true);
    try {
        await saveCorporate(currentCorporate);
        toast({ title: 'Success', description: 'Corporate partner saved.' });
        handleCloseModal();
        window.location.reload(); 
    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
    setIsSubmitting(false);
  };
  
  const handleDelete = async (id: number) => {
      try {
          await deleteCorporate(id);
          toast({ title: 'Success', description: 'Corporate partner removed.' });
          window.location.reload();
      } catch (err: any) {
          toast({ variant: 'destructive', title: 'Error', description: err.message });
      }
  };

  const handleBulkDelete = async () => {
      setIsSubmitting(true);
      try {
          for (const row of selectedRows) {
              await deleteCorporate(row.id);
          }
          toast({ title: 'Success', description: `${selectedRows.length} partners removed.` });
          window.location.reload();
      } catch (err: any) {
          toast({ variant: 'destructive', title: 'Error', description: 'Some deletions failed.' });
      }
      setIsSubmitting(false);
  };

  const columns: ColumnDef<Corporate>[] = [
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
        header: "Partner Name",
        cell: ({ row }) => <div className="font-bold">{row.getValue("name")}</div>
    },
    {
        accessorKey: "wellness_date",
        header: "Wellness Date",
        cell: ({ row }) => {
            const date = row.getValue("wellness_date") as string;
            return date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';
        }
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const corp = row.original;
            return (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(corp)} className="text-primary hover:bg-primary/10">
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
                                <AlertDialogTitle>Remove Partner?</AlertDialogTitle>
                                <AlertDialogDescription>Permanently delete "{corp.name}".</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(corp.id)} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
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
                    <span className="font-bold text-xs">{selectedCount} partners selected</span>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="h-8">
                            <Trash className="mr-2 h-3.5 w-3.5" /> Bulk Remove
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Bulk Delete Corporates</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete {selectedCount} partners? This action is permanent.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Delete All
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Partner
        </Button>
      </div>

      <div className="overflow-x-auto">
        <DataTable 
            columns={columns} 
            data={corporates} 
            onSelectionChange={(count, rows) => {
                setSelectedCount(count);
                setSelectedRows(rows);
            }} 
        />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">{currentCorporate?.id ? 'Edit' : 'Add'} Corporate Partner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-primary font-bold">Partner Name</Label>
                <Input id="name" name="name" value={currentCorporate?.name || ''} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wellness_date" className="text-primary font-bold">Wellness Date</Label>
                <Input id="wellness_date" name="wellness_date" type="date" value={currentCorporate?.wellness_date || ''} onChange={handleChange} required />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentCorporate?.id ? 'Save Changes' : 'Add Partner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
