'use client';

import Link from 'next/link';
import { useState } from 'react';
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
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/logo';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    email: '',
    password: '',
    age: '',
    sex: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
        title: 'Account Created!',
        description: 'Your account has been created successfully. You will be redirected to the login page.',
    });
    
    router.push('/');
    setLoading(false);
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-muted/40">
        <div className="w-full max-w-md">
            <div className="flex justify-center items-center mb-6">
                <Logo className="h-8 w-auto" />
            </div>
             <Card className="dark:border-primary/40 shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                    <CardDescription>
                        Sign up to begin your journey with Taria Health.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name" className="text-primary font-bold">First Name</Label>
                                <Input id="first_name" required onChange={handleInputChange} className="dark:border-primary/40" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="surname" className="text-primary font-bold">Surname</Label>
                                <Input id="surname" required onChange={handleInputChange} className="dark:border-primary/40" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-primary font-bold">Email Address</Label>
                            <Input id="email" type="email" required onChange={handleInputChange} placeholder="Your login email" className="dark:border-primary/40" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" title="Password" className="text-primary font-bold">Password</Label>
                            <div className="relative">
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    required 
                                    onChange={handleInputChange} 
                                    placeholder="Create a password" 
                                    className="pr-10 dark:border-primary/40" 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="age" className="text-primary font-bold">Age</Label>
                                <Input id="age" type="number" required onChange={handleInputChange} className="dark:border-primary/40" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sex" className="text-primary font-bold">Sex</Label>
                                <Select name="sex" onValueChange={(value) => handleSelectChange('sex', value)} required>
                                    <SelectTrigger id="sex" className="dark:border-primary/40"><SelectValue placeholder="Select sex" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary text-sm">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Login
                        </Link>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </div>
                </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
