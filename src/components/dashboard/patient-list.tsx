'use client';

import { useState } from 'react';
import type { Registration } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, LayoutGrid, FileDown, Trash2, CheckSquare } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { columns } from '../../app/dashboard/columns';
import Link from 'next/link';
import PatientCard from './patient-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function PatientList({ patients }: { patients: Registration[] }) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedRows, setSelectedRows] = useState<number>(0);
  const { toast } = useToast();

  const handleSelectionChange = (count: number) => {
    setSelectedRows(count);
  };

  const handleBulkAction = (action: string) => {
    toast({
        title: "Bulk Action Initiated",
        description: `Performing ${action} on ${selectedRows} selected participants.`
    });
  };

  return (
     <div className="space-y-4">
        <AnimatePresence>
            {selectedRows > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-primary/10 border border-primary/20 p-3 rounded-xl flex items-center justify-between shadow-sm"
                >
                    <div className="flex items-center gap-3 text-primary">
                        <CheckSquare className="h-5 w-5" />
                        <span className="font-bold text-sm">{selectedRows} participants selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-8 bg-background" onClick={() => handleBulkAction('Export')}>
                            <FileDown className="mr-2 h-4 w-4" /> Export
                        </Button>
                        <Button size="sm" variant="destructive" className="h-8" onClick={() => handleBulkAction('Delete')}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <Card className="dark:border-primary/40">
            <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>All Participants</CardTitle>
                        <CardDescription>View, search, and manage activation records.</CardDescription>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border">
                            <Button 
                                variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                                size="icon" 
                                onClick={() => setViewMode('table')}
                                aria-label="Table View"
                                className="h-8 w-8"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                                size="icon" 
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid View"
                                className="h-8 w-8"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button asChild className="flex-1 md:flex-none">
                            <Link href="/dashboard/register-patient">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Participant
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                        <DataTable 
                            columns={columns} 
                            data={patients} 
                            onSelectionChange={handleSelectionChange}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {patients.map((patient, index) => (
                            <PatientCard key={patient.id} patient={patient} index={index}/>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
     </div>
  );
}
