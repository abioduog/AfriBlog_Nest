export interface User {
  id: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
  isPremiumUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends User {
  hashedPassword: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
