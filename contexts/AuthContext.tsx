import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, name?: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name || email.split('@')[0],
                    },
                },
            });

            if (error) {
                toast.error(error.message);
                return { error };
            }

            if (data.user) {
                // Create default user preferences
                await supabase.from('user_preferences').insert({
                    user_id: data.user.id,
                });

                toast.success('Account created! Please check your email to verify.');
            }

            return { error: null };
        } catch (error: any) {
            toast.error('An unexpected error occurred');
            return { error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
                return { error };
            }

            if (data.user) {
                toast.success('Welcome back!');
            }

            return { error: null };
        } catch (error: any) {
            toast.error('An unexpected error occurred');
            return { error };
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                toast.error(error.message);
            } else {
                toast.success('Signed out successfully');
            }
        } catch (error: any) {
            toast.error('An unexpected error occurred');
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                toast.error(error.message);
                return { error };
            }

            toast.success('Password reset email sent!');
            return { error: null };
        } catch (error: any) {
            toast.error('An unexpected error occurred');
            return { error };
        }
    };

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
