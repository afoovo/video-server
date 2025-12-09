import request from '@/utils/request';
import type { User } from '@/types/user';

/**
 * 获取用户信息
 * @param {string} id - 用户ID
 * @returns {Promise<User>} 用户信息
 */
export function getUserInfo(id: string): Promise<User> {
  return request({
    url: `/user/get/${id}`,
    method: 'get',
  });
}

/**
 * 更新用户信息
 * @param {string} id - 用户ID
 * @param {Partial<User>} data - 用户信息更新数据
 * @returns {Promise<User>} 更新后的用户信息
 */
export function updateUser(id: string, data: Partial<User>): Promise<User> {
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

/**
 * 上传用户头像
 * @param {FormData} formData - 包含头像文件的表单数据
 * @returns {Promise<{avatarUrl: string}>} 上传结果，包含头像URL
 */
export function uploadAvatar(formData: FormData): Promise<{avatarUrl: string}> {
  return request({
    url: '/user/uploadAvatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
