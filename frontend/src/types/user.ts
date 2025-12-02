/**
 * 用户类型定义
 * 适配sa-token认证机制
 */

/**
 * 用户信息接口
 * 对应后端返回的用户信息结构
 */
export interface User {
  id: number;
  userName: string;
  account: string;
  email: string;
  sex?: string;
  roleId: number;
  status: number;
  createTime: string;
  updateTime: string;
  avatarUrl?: string;
}

/**
 * 登录表单接口
 */
export interface LoginForm {
  account: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * 注册表单接口
 */
export interface RegisterForm {
  account: string;
  password: string;
}

/**
 * 用户资料接口
 */
export interface UserProfile {
  id: number;
  userName: string;
  account: string;
  email: string;
  avatarUrl?: string;
  sex?: string;
  roleId: number;
  status: number;
  createTime: string;
  updateTime: string;
}

/**
 * 认证响应接口
 * 适配sa-token的响应格式
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * 用户状态接口
 * 用于状态管理
 */
export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
