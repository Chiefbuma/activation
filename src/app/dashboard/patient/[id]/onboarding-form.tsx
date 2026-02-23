'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Registration, User, Corporate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getCorporates } from '@/lib/serve';
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
    const [corporates, setCorporates] = useState<Corporate[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const corpData = await getCorporates();
                setCorporates(corpData);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load necessary data.' });
            }
        };
        fetchData();

        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
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
        
        // This form is now primarily for updating registration info
        // Real activation happens when vitals are added
        toast({
            title: 'Info',
            description: `Registration details updated. Please add assessments to fully activate the participant.`,
        });
        
        router.push(`/dashboard/patient/${patient.id}`);
        router.refresh(); 
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <PatientHeader patient={patient as any} />
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <Card className="dark:border-primary/40">
                        <CardHeader className="items-center">
                            <div className="bg-muted px-4 py-2 rounded-lg">
                                <CardTitle className="text-center text-primary">Participant Information</CardTitle>
                            </div>
                            <CardDescription className="pt-2">Capture core demographic details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name" className="text-primary font-bold">First Name</Label>
                                <Input id="first_name" value={formData.first_name || ''} onChange={handleInputChange} required className="dark:border-primary/40" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="middle_name" className="text-primary font-bold">Middle Name</Label>
                                <Input id="middle_name" value={formData.middle_name || ''} onChange={handleInputChange} className="dark:border-primary/40" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="surname" className="text-primary font-bold">Surname</Label>
                                <Input id="surname" value={formData.surname || ''} onChange={handleInputChange} className="dark:border-primary/40" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="age" className="text-primary font-bold">Age</Label>
                                    <Input id="age" type="number" value={formData.age || ''} onChange={handleInputChange} className="dark:border-primary/40" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sex" className="text-primary font-bold">Sex</Label>
                                    <Select value={formData.sex || ''} onValueChange={(value) => handleSelectChange('sex', value)}>
                                        <SelectTrigger className="dark:border-primary/40"><SelectValue placeholder="Select sex" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="dark:border-primary/40">
                        <CardHeader className="items-center">
                             <div className="bg-muted px-4 py-2 rounded-lg">
                                <CardTitle className="text-center text-primary">Contact & Corporate</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-primary font-bold">Phone Number</Label>
                                <Input id="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} className="dark:border-primary/40" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-primary font-bold">Email Address</Label>
                                <Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} className="dark:border-primary/40" />
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
                            <div className="space-y-2">
                                <Label htmlFor="wellness_date" className="text-primary font-bold">Wellness Date</Label>
                                <Input id="wellness_date" type="date" value={formData.wellness_date || ''} onChange={handleInputChange} className="dark:border-primary/40" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Details
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
