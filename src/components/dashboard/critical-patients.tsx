
'use client';
import type { Registration } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '../ui/button';

export default function CriticalPatients({ patients }: { patients: Registration[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span>Recent Activations</span>
                </CardTitle>
                <CardDescription>Most recently registered participants.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {patients.length > 0 ? (
                    patients.slice(0, 5).map(patient => {
                        const name = `${patient.first_name} ${patient.surname || ''}`;
                        const fallback = `${patient.first_name[0]}${patient.surname ? patient.surname[0] : ''}`;
                        return (
                            <div key={patient.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                        <AvatarFallback className="bg-primary text-primary-foreground font-bold text-[10px]">{fallback}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{name}</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">{patient.email || patient.phone}</p>
                                    </div>
                                </div>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={`/dashboard/patient/${patient.id}`}>
                                        View <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-center text-muted-foreground py-4">No patients registered.</p>
                )}
            </CardContent>
        </Card>
    );
}
