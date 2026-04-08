'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/logo';
import { login } from '@/lib/serve';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const user = await login({ email, password });
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        toast({ title: 'Success!', description: 'Logged in successfully.' });
        router.push('/dashboard');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.message || 'Check your credentials and try again.',
        });
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-muted/40">
       <div className="w-full max-w-md">
            <div className="flex justify-center items-center mb-6">
                <Logo className="h-8 w-auto" />
            </div>
            <Card className="dark:border-primary/40 shadow-xl">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="font-bold text-primary">Email</Label>
                            <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="dark:border-primary/40"
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="font-bold text-primary">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-muted-foreground hover:text-primary underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
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
                        <Button type="submit" className="w-full mt-2 font-bold py-6 shadow-lg" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login to Dashboard'}
                        </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
