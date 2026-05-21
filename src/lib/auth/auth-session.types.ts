export type AuthSession = {
  userId: string | null;
  email?: string | null;
  isAuthenticated: boolean;
};

export type AuthSessionResult = {
  data: AuthSession;
  error?: string;
};

export type AuthSessionProvider = {
  getSession(): Promise<AuthSessionResult>;
};

export const unauthenticatedSession: AuthSession = {
  userId: null,
  email: null,
  isAuthenticated: false,
};
