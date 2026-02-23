'use client';
import type { Registration } from '@/lib/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function PatientCard({ patient, index }: { patient: Registration, index: number }) {
    const name = `${patient.first_name} ${patient.surname || ''}`
    const fallback = `${patient.first_name[0]}${patient.surname ? patient.surname[0] : ''}`
  
    return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="w-full"
    >
      <Link href={`/dashboard/patient/${patient.id}`} className="block">
        <motion.div
            className="w-full bg-white dark:bg-card border border-gray-200 dark:border-card-foreground/20 rounded-xl shadow-sm hover:shadow-lg hover:border-primary/50 cursor-pointer transition-all duration-300 relative overflow-hidden"
            whileHover={{ y: -4, borderColor: 'hsl(var(--primary))' }}
        >
        <div className="flex items-start p-5 gap-5">
            <Avatar className="h-16 w-16 sm:flex rounded-lg shadow-md border-2 border-background">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xl font-bold">{fallback}</AvatarFallback>
            </Avatar>

            <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-foreground capitalize hover:underline">
                            {patient.first_name} {patient.surname}
                        </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {patient.age ? `${patient.age} years old` : 'Age N/A'} &middot; {patient.sex || 'Sex N/A'}
                        </p>
                    </div>
                    <Badge variant="outline">{patient.corporate_name || 'Individual'}</Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 mb-4">
                    <div className="space-y-2">
                         <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><ClipboardCheck className="w-4 h-4"/>Assessments</h4>
                         <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Total Records:</span> <span className="font-bold">{patient.vitals.length + patient.nutritions.length + patient.clinicals.length}</span></div>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2.5 dark:bg-muted/50 mt-auto">
                    <motion.div
                        className="h-2.5 rounded-full bg-primary"
                        style={{ width: `${Math.min(100, (patient.vitals.length + patient.clinicals.length) * 20)}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (patient.vitals.length + patient.clinicals.length) * 20)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    ></motion.div>
                </div>

            </div>
        </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
