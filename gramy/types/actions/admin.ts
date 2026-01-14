
export interface AdminUser {
  id: string;
  username: string | null;
  email: string;
  role: string;
  banned: boolean;
  created_at: string;
}
