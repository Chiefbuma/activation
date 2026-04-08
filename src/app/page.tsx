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
    <div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.08),transparent_26%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted))/0.35)] px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="border-border/60 bg-background/92 shadow-[0_32px_90px_-34px_rgba(15,23,42,0.45)] backdrop-blur dark:border-primary/25 dark:bg-card/92">
          <CardHeader className="space-y-3 pb-3 text-center">
            <div className="flex justify-center">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 shadow-sm">
                <Logo className="h-8 w-auto" />
              </div>
            </div>
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-sm leading-6">
                Sign in to continue to your activation workspace.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="font-semibold text-primary">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-11 border-border/70 bg-background/80 dark:border-primary/30"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="font-semibold text-primary">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground transition-colors hover:text-primary"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="h-11 border-border/70 bg-background/80 pr-10 dark:border-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="mt-2 h-11 w-full font-semibold shadow-lg shadow-primary/15" disabled={loading}>
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
