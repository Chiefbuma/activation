
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
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
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

interface CorporateManagementProps {
  initialCorporates: Corporate[];
  onCorporatesUpdate: (updatedCorporates: Corporate[]) => void;
}

const emptyCorporate: Omit<Corporate, 'id'> = {
  name: '',
  wellness_date: new Date().toISOString().split('T')[0],
};

export default function CorporateManagement({ initialCorporates, onCorporatesUpdate }: CorporateManagementProps) {
  const [corporates, setCorporates] = useState<Corporate[]>(initialCorporates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCorporate, setCurrentCorporate] = useState<Partial<Corporate> | null>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCorporate || !currentCorporate.name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Corporate name is required.' });
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
        let updatedCorporates;
        if (currentCorporate.id) {
            updatedCorporates = corporates.map(c => c.id === currentCorporate!.id ? (currentCorporate as Corporate) : c);
        } else {
            const newCorp: Corporate = {
                id: Date.now(),
                ...emptyCorporate,
                ...currentCorporate,
            } as Corporate;
            updatedCorporates = [...corporates, newCorp];
        }
        
        setCorporates(updatedCorporates);
        onCorporatesUpdate(updatedCorporates);
        toast({ title: 'Success', description: `Corporate ${currentCorporate.id ? 'updated' : 'added'} successfully.` });
        
        setIsSubmitting(false);
        handleCloseModal();
    }, 500);
  };
  
  const handleDelete = (id: number) => {
      const updatedCorporates = corporates.filter(c => c.id !== id);
      setCorporates(updatedCorporates);
      onCorporatesUpdate(updatedCorporates);
      toast({ title: 'Success', description: 'Corporate partner removed successfully.' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()} className="bg-teal-600 hover:bg-teal-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Partner
        </Button>
      </div>

      <div className="rounded-xl border dark:border-teal-500/20 overflow-hidden">
        <div className="divide-y divide-border dark:divide-teal-500/10">
          {corporates.length > 0 ? (
            corporates.map(corp => (
              <div key={corp.id} className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-bold text-foreground">{corp.name}</p>
                  <p className="text-sm text-muted-foreground">Wellness Date: {new Date(corp.wellness_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(corp)} className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20">
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
                            <AlertDialogTitle>Remove Partner?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the corporate partner "{corp.name}".
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel className="dark:text-foreground">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(corp.id)} className="bg-destructive hover:bg-destructive/90">
                                Remove
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No corporate partners registered.</p>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md dark:border-teal-500/30">
          <DialogHeader>
            <DialogTitle className="text-teal-600 dark:text-teal-400">{currentCorporate?.id ? 'Edit' : 'Add'} Corporate Partner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-primary font-bold">Partner Name</Label>
                <Input id="name" name="name" value={currentCorporate?.name || ''} onChange={handleChange} required className="dark:border-teal-500/40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wellness_date" className="text-primary font-bold">Wellness Date</Label>
                <Input id="wellness_date" name="wellness_date" type="date" value={currentCorporate?.wellness_date || ''} onChange={handleChange} required className="dark:border-teal-500/40" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="dark:text-foreground">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
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
