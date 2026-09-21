import type { User } from 'firebase/auth';
import type { Nullable } from './common';
import type { UserAccount, UserRole } from './user';

export interface IntendedRoute {
  pathname: string;
}

export interface AuthLocationState {
  from: IntendedRoute;
  moderationDenied?: true;
}

export interface AuthContextValue {
  user: Nullable<User>;
  account: Nullable<UserAccount>;
  role: Nullable<UserRole>;
  canModerate: boolean;
  isLoading: boolean;
  isAccountLoading: boolean;
  isConfigured: boolean;
  isEmailVerified: boolean;
  authError: Nullable<Error>;
  configurationMissing: string[];
  refreshUser: () => Promise<Nullable<User>>;
  logout: () => Promise<void>;
}
