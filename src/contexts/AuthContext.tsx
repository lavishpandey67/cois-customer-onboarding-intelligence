'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type UserRole =
  | 'admin' |'ceo' |'operations_director' |'cs_manager' |'cs_specialist' |'support_agent';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string;
  isActive: boolean;
}

// Role display labels
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  ceo: 'CEO',
  operations_director: 'Operations Director',
  cs_manager: 'CS Manager',
  cs_specialist: 'CS Specialist',
  support_agent: 'Support Agent',
};

// Role hierarchy: higher index = more permissions
const ROLE_HIERARCHY: UserRole[] = [
  'support_agent',
  'cs_specialist',
  'cs_manager',
  'operations_director',
  'ceo',
  'admin',
];

// Page access by role
export const ROLE_ACCESS: Record<string, UserRole[]> = {
  '/': ['admin', 'ceo', 'operations_director', 'cs_manager', 'cs_specialist', 'support_agent'],
  '/customer-management': ['admin', 'ceo', 'operations_director', 'cs_manager', 'cs_specialist', 'support_agent'],
  '/task-management': ['admin', 'ceo', 'operations_director', 'cs_manager', 'cs_specialist', 'support_agent'],
  '/customer-timeline': ['admin', 'ceo', 'operations_director', 'cs_manager', 'cs_specialist', 'support_agent'],
  '/milestones': ['admin', 'ceo', 'operations_director', 'cs_manager', 'cs_specialist'],
  '/knowledge-base': ['admin', 'ceo', 'operations_director', 'cs_manager', 'cs_specialist', 'support_agent'],
  '/reports': ['admin', 'ceo', 'operations_director', 'cs_manager'],
  '/analytics': ['admin', 'ceo', 'operations_director', 'cs_manager'],
  '/ai-assistant': ['admin', 'ceo', 'operations_director', 'cs_manager', 'cs_specialist'],
  '/notifications': ['admin', 'ceo', 'operations_director', 'cs_manager', 'cs_specialist', 'support_agent'],
  '/administration': ['admin', 'ceo', 'operations_director'],
};

interface AuthContextType {
  user: any;
  session: any;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<any>;
  isEmailVerified: () => boolean;
  getUserProfile: () => Promise<UserProfile | null>;
  hasAccess: (path: string) => boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
  roleLabel: string;
  initials: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function fetchProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error || !data) return null;
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role as UserRole,
        avatarUrl: data.avatar_url || '',
        isActive: data.is_active,
      };
    } catch {
      return null;
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: any = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.fullName || '',
          avatar_url: metadata?.avatarUrl || '',
          role: metadata?.role || 'support_agent',
        },
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  };

  const isEmailVerified = () => user?.email_confirmed_at !== null;

  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    return fetchProfile(user.id);
  };

  const hasAccess = (path: string): boolean => {
    if (!profile) return false;
    const allowedRoles = ROLE_ACCESS[path];
    if (!allowedRoles) return true; // unknown paths are open
    return allowedRoles.includes(profile.role);
  };

  const canAccess = (requiredRoles: UserRole[]): boolean => {
    if (!profile) return false;
    return requiredRoles.includes(profile.role);
  };

  const roleLabel = profile ? ROLE_LABELS[profile.role] : '';
  const initials = profile ? getInitials(profile.fullName || profile.email) : 'U';

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    isEmailVerified,
    getUserProfile,
    hasAccess,
    canAccess,
    roleLabel,
    initials,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
