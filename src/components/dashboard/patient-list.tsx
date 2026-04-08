'use client';

import { useState } from 'react';
import type { Registration } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, LayoutGrid, Trash2, CheckSquare, Loader2 } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { columns } from '../../app/dashboard/columns';
import Link from 'next/link';
import PatientCard from './patient-card';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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

export default function PatientList({ patients }: { patients: Registration[] }) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Registration[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleBulkDelete = async () => {
    setIsSubmitting(true);
    try {
        let deleted = 0;
        for (const patient of selectedRows) {
            const res = await fetch(`/api/registrations?id=${patient.id}`, { method: 'DELETE' });
            if (res.ok) deleted++;
        }
        
        toast({
            title: "Bulk Deletion Complete",
            description: `Successfully removed ${deleted} activation records.`
        });
        window.location.reload();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Bulk deletion failed. Please try again.' });
    }
    setIsSubmitting(false);
  };

  return (
     <div className="space-y-4">
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-primary/10 border border-primary/20 p-3 rounded-xl flex items-center justify-between shadow-sm"
                >
                    <div className="flex items-center gap-3 text-primary">
                        <CheckSquare className="h-5 w-5" />
                        <span className="font-bold text-sm">{selectedCount} participants selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive" className="h-8">
                                    <Trash2 className="mr-2 h-4 w-4" /> Bulk Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Bulk Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You are about to delete {selectedCount} participant records. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Delete Permanently
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <Card className="dark:border-primary/40">
            <CardContent className="pt-6">
                {viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                        <DataTable 
                            columns={columns} 
                            data={patients} 
                            searchPlaceholder="Search participants..."
                            toolbarActions={
                                <>
                                    <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
                                        <Button
                                            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                            size="icon"
                                            onClick={() => setViewMode('table')}
                                            className="h-8 w-8"
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                            size="icon"
                                            onClick={() => setViewMode('grid')}
                                            className="h-8 w-8"
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button asChild className="h-8 shrink-0">
                                        <Link href="/dashboard/register-patient">
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Participant
                                        </Link>
                                    </Button>
                                </>
                            }
                            onSelectionChange={(count, rows) => {
                                setSelectedCount(count);
                                setSelectedRows(rows);
                            }}
                        />
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex justify-end">
                            <Button asChild className="h-8">
                                <Link href="/dashboard/register-patient">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Participant
                                </Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                            {patients.map((patient, index) => (
                                <PatientCard key={patient.id} patient={patient} index={index}/>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
     </div>
  );
}
