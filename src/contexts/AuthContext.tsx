import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if test mode is enabled
    const isTestMode = import.meta.env.VITE_TEST_MODE === 'true';
    
    if (isTestMode) {
      // Use mock user in test mode
      const mockUser: User = {
        id: 'test-user-123',
        email: 'test@djobba.nl',
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: { name: 'Test Gebruiker', role: 'professional' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phone: '',
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: null,
        last_sign_in_at: new Date().toISOString(),
        factors: null,
        identities: []
      };
      setUser(mockUser);
      setLoading(false);
      console.log('✅ Test mode enabled - using mock user:', mockUser.email);
      return;
    }

    // Get initial session
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
