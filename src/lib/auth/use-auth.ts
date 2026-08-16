'use client';

import { useContext } from 'react';
import { AuthContext } from './provider';
import type { AuthContextValue } from './provider';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
