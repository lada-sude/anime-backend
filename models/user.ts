export interface User {
  id: string;
  username: string;
  passwordHash: string;
  plan: 'free' | 'paid';
  quota: number;          // remaining searches
}

export const users: User[] = [];