export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}
export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export type SignupResponse = {
  id: string;
  name: string;
  email: string;
};
