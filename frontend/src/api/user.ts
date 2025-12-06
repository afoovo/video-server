import request from '@/utils/request';
import type { User } from '@/types/user';

/**
 * 获取用户信息
 * @param {number|string} id - 用户ID
 * @returns {Promise<User>} 用户信息
 */
export function getUserInfo(id: number | string): Promise<User> {
  return request({
    url: `/user/get/${id}`,
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
    url: `/user/update`,
    method: 'put',
    data: {
      id,
      ...data,
    },
  });
}

/**
 * 模糊搜索用户列表
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<User[]>} 用户列表
 */
export function searchUsers(keyword: string): Promise<User[]> {
  return request({
    url: `/user/search/${keyword}`,
    method: 'get',
  });
}
