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
import { fetchCorporates } from '@/lib/data';
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
                const corpData = await fetchCorporates();
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
        
        await new Promise(resolve => setTimeout(resolve, 500));

        toast({
            title: 'Activation Complete (Mock)',
            description: `${patient.first_name} is now activated. This will not persist on page refresh.`,
        });
        
        router.push(`/dashboard/patient/${patient.id}`);
        router.refresh(); 
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <PatientHeader patient={patient} />
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="items-center">
                            <div className="bg-muted px-4 py-2 rounded-lg">
                                <CardTitle className="text-center text-primary">Participant Information</CardTitle>
                            </div>
                            <CardDescription className="pt-2">Capture core demographic details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input id="first_name" value={formData.first_name || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="middle_name">Middle Name</Label>
                                <Input id="middle_name" value={formData.middle_name || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="surname">Surname</Label>
                                <Input id="surname" value={formData.surname || ''} onChange={handleInputChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input id="age" type="number" value={formData.age || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sex">Sex</Label>
                                    <Select value={formData.sex || ''} onValueChange={(value) => handleSelectChange('sex', value)}>
                                        <SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger>
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

                    <Card>
                        <CardHeader className="items-center">
                             <div className="bg-muted px-4 py-2 rounded-lg">
                                <CardTitle className="text-center text-primary">Contact & Corporate</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="corporate_id">Assign Corporate</Label>
                                <Select value={String(formData.corporate_id || 'null')} onValueChange={(value) => handleSelectChange('corporate_id', value)}>
                                    <SelectTrigger><SelectValue placeholder="Select a corporate" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">None</SelectItem>
                                        {corporates.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="wellness_date">Wellness Date</Label>
                                <Input id="wellness_date" type="date" value={formData.wellness_date || ''} onChange={handleInputChange} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Complete Activation
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
