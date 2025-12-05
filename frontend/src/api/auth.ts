/**
 * 认证相关API
 * 适配sa-token认证机制
 */
import request from '@/utils/request';
import type { AuthResponse, LoginForm, RegisterForm, User } from '@/types/user';

/**
 * 用户登录
 * @param data - 登录参数
 * @returns 认证响应，包含token和用户信息
 */
export function login(data: LoginForm): Promise<AuthResponse> {
  return request({
    url: '/auth/login',
    method: 'post',
    params: data,
  });
}

/**
 * 用户注册
 * @param data - 注册参数
 * @returns 认证响应，包含token和用户信息
 */
export function register(data: RegisterForm): Promise<AuthResponse> {
  return request({
    url: '/auth/register',
    method: 'post',
    data: data,
  });
}

/**
 * 退出登录
 * @returns 退出登录结果
 */
export function logout(): Promise<void> {
  return request({
    url: '/auth/logout',
    method: 'get',
  });
}

/**
 * 检查token有效性
 * @returns token有效性检查结果
 */
export function checkToken(): Promise<{ valid: boolean }> {
  const token = localStorage.getItem('token');

  if (!token) {
    return Promise.reject(new Error('未登录'));
  }

  return Promise.resolve({ valid: true });
}

/**
 * 获取当前用户ID
 * @returns 用户ID或Promise.reject
 */
export function getUserId(): string | number | Promise<never> {
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      throw new Error('用户未登录');
    }

    const userInfo = JSON.parse(userInfoStr);
    const userId = userInfo?.id;

    if (!userId) {
      throw new Error('用户未登录');
    }

    return userId;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * 获取当前用户信息
 * @returns 当前用户信息
 */
export function getCurrentUser(): Promise<User> {
  return Promise.resolve(getUserId()).then(userId =>
    request({
      url: `/user/get/${userId}`,
      method: 'get',
    })
  );
}

/**
 * 更新用户信息
 * @param data - 用户信息
 * @returns 更新后的用户信息
 */
export function updateUserInfo(data: Partial<User>): Promise<User> {
  return request({
    url: `/user/update`,
    method: 'put',
    data,
  });
}
