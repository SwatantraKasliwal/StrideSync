"use client";

import { useState, useEffect } from 'react';
import Dashboard from './dashboard';
import LoginPage from '@/app/login/page';

// Mock auth state. In a real app, this would come from Firebase Auth.
const useAuth = () => {
    const [user, setUser] = useState<{ uid: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for an authenticated user.
        const timer = setTimeout(() => {
            // To test the logged-in state, you can manually set a user object.
            // For example: setUser({ uid: 'test-user-123' });
            setUser(null); 
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return { user, loading };
}


export default function AuthProvider() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Dashboard />;
}
