'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { fetchCorporates } from '@/lib/data';
import type { Corporate } from '@/lib/types';

export default function RegisterParticipantPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    surname: '',
    email: '',
    phone: '',
    age: '',
    sex: '',
    dob: '',
    corporate_id: '',
    wellness_date: '',
  });
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchCorporates().then(setCorporates);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    toast({
        title: 'Registration Successful',
        description: 'The participant has been registered successfully.',
    });
    
    router.push('/dashboard');
    setLoading(false);
  }

  return (
    <div className="container mx-auto flex justify-center items-start py-8">
      <Card className="w-full max-w-4xl border-primary/20 shadow-lg">
        <CardHeader className="text-center bg-muted/30 pb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4">
            <CardTitle className="text-2xl text-primary">New Participant Registration</CardTitle>
          </div>
          <CardDescription>
            Enter participant details to create a new activation record.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-primary font-bold">First Name *</Label>
                <Input id="first_name" required value={formData.first_name} onChange={handleInputChange} className="dark:border-primary/40 dark:focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middle_name" className="text-primary font-bold">Middle Name</Label>
                <Input id="middle_name" value={formData.middle_name} onChange={handleInputChange} className="dark:border-primary/40 dark:focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname" className="text-primary font-bold">Surname *</Label>
                <Input id="surname" required value={formData.surname} onChange={handleInputChange} className="dark:border-primary/40 dark:focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex" className="text-primary font-bold">Sex *</Label>
                <Select value={formData.sex} onValueChange={(v) => handleSelectChange('sex', v)} required>
                  <SelectTrigger className="dark:border-primary/40"><SelectValue placeholder="Select sex" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-primary font-bold">Date of Birth (Optional)</Label>
                <Input id="dob" type="date" value={formData.dob} onChange={handleInputChange} className="dark:border-primary/40 dark:focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-primary font-bold">Age (Optional)</Label>
                <Input id="age" type="number" value={formData.age} onChange={handleInputChange} className="dark:border-primary/40 dark:focus:ring-primary" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary font-bold">Email Address</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="dark:border-primary/40 dark:focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-primary font-bold">Phone Number</Label>
                <Input id="phone" value={formData.phone} onChange={handleInputChange} className="dark:border-primary/40 dark:focus:ring-primary" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="corporate_id" className="text-primary font-bold">Corporate Partner</Label>
                <Select value={formData.corporate_id} onValueChange={(v) => handleSelectChange('corporate_id', v)}>
                  <SelectTrigger className="dark:border-primary/40"><SelectValue placeholder="Assign corporate" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {corporates.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wellness_date" className="text-primary font-bold">Wellness Date</Label>
                <Input id="wellness_date" type="date" value={formData.wellness_date} onChange={handleInputChange} className="dark:border-primary/40 dark:focus:ring-primary" />
              </div>
            </div>

            <div className="pt-4 flex justify-between gap-4">
              <Button variant="outline" asChild className="dark:text-foreground">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={loading} className="px-8">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Register Participant'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
