'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Registration, User, Corporate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getCorporates, getUsers } from '@/lib/serve';
import PatientHeader from './patient-header';

interface OnboardingFormProps {
    patient: Registration;
}

export default function OnboardingForm({ patient }: OnboardingFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Registration>>({ 
        ...patient,
     });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [navigators, setNavigators] = useState<User[]>([]);
    const [corporates, setCorporates] = useState<Corporate[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [navData, corpData] = await Promise.all([
                    getUsers(),
                    getCorporates()
                ]);
                setNavigators(navData.filter((u: User) => u.role === 'navigator'));
                setCorporates(corpData);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load necessary data.' });
            }
        };
        fetchData();
    }, [toast]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        const processedValue = value === 'null' ? null : value;
        setFormData({ ...formData, [name]: processedValue });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        toast({
            title: 'Success',
            description: `Participant details updated successfully.`,
        });
        
        router.refresh(); 
        setIsSubmitting(false);
    };

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
            <PatientHeader patient={patient as any} />
            <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                    <Card className="dark:border-primary/40">
                        <CardHeader>
                            <CardTitle className="text-primary font-bold">Administrative Assignment</CardTitle>
                            <CardDescription>Assign the participant to a corporate partner or navigator.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="navigator_id" className="text-primary font-bold">Assign Navigator</Label>
                                <Select value={String(formData.user_id || 'null')} onValueChange={(value) => handleSelectChange('user_id', value)}>
                                    <SelectTrigger className="dark:border-primary/40"><SelectValue placeholder="Select a navigator" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">Unassigned</SelectItem>
                                        {navigators.map(n => <SelectItem key={n.id} value={String(n.id)}>{n.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="corporate_id" className="text-primary font-bold">Assign Corporate</Label>
                                <Select value={String(formData.corporate_id || 'null')} onValueChange={(value) => handleSelectChange('corporate_id', value)}>
                                    <SelectTrigger className="dark:border-primary/40"><SelectValue placeholder="Select a corporate" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">None</SelectItem>
                                        {corporates.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Participant Assignments
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
