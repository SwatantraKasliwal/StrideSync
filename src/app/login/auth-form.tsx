"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const title = mode === 'login' ? 'Welcome Back' : 'Create an Account';
  const description = mode === 'login' ? 'Sign in to access your dashboard.' : 'Sign up to start tracking your activity.';
  const buttonText = mode === 'login' ? 'Login' : 'Sign Up';
  const altActionText = mode === 'login' ? "Don't have an account?" : 'Already have an account?';
  const altActionLink = mode === 'login' ? '/signup' : '/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // This is a mock authentication flow.
    // In a real application, you would integrate Firebase Auth here.
    setTimeout(() => {
      setIsLoading(false);
      if (email && password) {
        toast({
          title: 'Success!',
          description: mode === 'login' ? 'You are now logged in.' : 'Your account has been created.',
        });
        router.push('/');
      } else {
        toast({
          title: 'Authentication Failed',
          description: 'Please check your email and password.',
          variant: 'destructive',
        });
      }
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Loading...' : buttonText}
            </Button>
            <div className="mt-4 text-center text-sm">
              {altActionText}
              <a href={altActionLink} className="ml-1 underline">
                {mode === 'login' ? 'Sign up' : 'Login'}
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
