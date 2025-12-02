import request from '@/utils/request';
import type { User } from '@/types/user';
import type { ApiResponse } from '@/types/common';

/**
 * 获取用户信息
 * @param {number|string} id - 用户ID
 * @returns {Promise<User>} 用户信息
 */
export function getUserInfo(id: number | string): Promise<User> {
  return request({
    url: `/users/${id}`,
    method: 'get',
  });
}

/**
 * 更新用户信息
 * @param {number|string} id - 用户ID
 * @param {Partial<User>} data - 用户信息更新数据
 * @returns {Promise<User>} 更新后的用户信息
 */
export function updateUser(id: number | string, data: Partial<User>): Promise<User> {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data,
  });
}

/**
 * 更新用户状态
 * @param {number|string} id - 用户ID
 * @param {number} status - 状态
 * @returns {Promise<ApiResponse<void>>} 操作结果
 */
export function updateUserStatus(id: number | string, status: number): Promise<ApiResponse<void>> {
  return request({
    url: `/users/${id}/status`,
    method: 'put',
    params: {
      status,
    },
  });
}

/**
 * 检查是否已关注用户
 * @param {number|string} id - 用户ID
 * @returns {Promise<ApiResponse<{ isFollowing: boolean }>>} 是否关注状态
 */
export function isFollowing(id: number | string): Promise<ApiResponse<{ isFollowing: boolean }>> {
  return request({
    url: `/users/${id}/follow`,
    method: 'get',
  });
}

/**
 * 关注用户
 * @param {number|string} id - 用户ID
 * @returns {Promise<ApiResponse<void>>} 操作结果
 */
export function followUser(id: number | string): Promise<ApiResponse<void>> {
  return request({
    url: `/users/${id}/follow`,
    method: 'post',
  });
}

/**
 * 取消关注用户
 * @param {number|string} id - 用户ID
 * @returns {Promise<ApiResponse<void>>} 操作结果
 */
export function unfollowUser(id: number | string): Promise<ApiResponse<void>> {
  return request({
    url: `/users/${id}/follow`,
    method: 'delete',
  });
}
