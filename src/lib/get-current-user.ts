import { headers } from 'next/headers';
import { cache } from 'react';

import { auth } from '@/lib/auth';

type User = {
  id: string;
  email: string;
  name: string;
  role?: string;
  language?: string;
  tradingLevel?: string;
  riskTolerance?: string;
};

// Server-side only function for getting current user
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || '',
      role: session.user.role,
      language: session.user.language,
      tradingLevel: session.user.tradingLevel,
      riskTolerance: session.user.riskTolerance,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
});

export const requireAuth = async (): Promise<User> => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
};
