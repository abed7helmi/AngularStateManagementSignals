import { UserRole } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
}
