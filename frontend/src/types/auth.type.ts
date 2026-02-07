export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}
