/**
 * 用户相关类型定义
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  bio?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
}

export enum UserRole {
  Admin = "admin",
  User = "user",
  Guest = "guest",
}

export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Banned = "banned",
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
}

/**
 * API 响应类型
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  code?: number;
  success: boolean;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * 通用错误类型
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
