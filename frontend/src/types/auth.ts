// src/types/auth.ts
export type UserType = 'MENTOR' | 'COMPANY' | 'ADMIN';
export type CompanySize = 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  mentor?: Mentor;
  company?: Company;
}

export interface Mentor {
  id: string;
  title: string;
  bio?: string;
  yearsExperience: number;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  isApproved: boolean;
}

export interface Company {
  id: string;
  companyName: string;
  cnpj?: string;
  industry?: string;
  companySize: CompanySize;
  website?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  userType: UserType;
  // Campos para mentores
  title?: string;
  yearsExperience?: number;
  hourlyRate?: number;
  // Campos para empresas
  companyName?: string;
  companySize?: CompanySize;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}