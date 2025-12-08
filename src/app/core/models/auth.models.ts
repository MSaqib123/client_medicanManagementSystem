// src/app/models/auth.models.ts

export interface LoginRequest {
  email: string;      // or username
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn?: number;       // optional
  refreshToken?: string;    // optional
  userId?: string;          // optional
  roles?: string[];         // optional (needed for your decodeToken roles)
}
