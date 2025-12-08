/**
 * 分类相关API
 */
import request from '@/utils/request';
import type { Video } from '@/types/video';

/**
 * 分类接口
 */
export interface Category {
  id: number;
  name: string;
  description: string;
  status: number;
  createTime: string;
  updateTime: string;
}

/**
 * 获取所有分类
 * @returns {Promise<Category[]>}
 */
export function getCategories(): Promise<Category[]> {
  return request({
    url: '/category/list',
    method: 'get',
  });
}

/**
 * 获取分类详情
 * @param {number|string} id - 分类ID
 * @returns {Promise<Category>}
 */
export function getCategoryDetail(id: number): Promise<Category> {
  return request({
    url: `/category/${id}`,
    method: 'get',
  });
}

/**
 * 获取分类视频列表
 * @param {number|string} id - 分类ID
 * @returns {Promise<Video[]>}
 */
export function getCategoryVideos(id: number): Promise<Video[]> {
  return request({
    url: `/category/${id}/videoList`,
    method: 'get',
  });
}

/**
 * 创建或更新分类
 * @param {Partial<Category>} data - 分类数据
 * @returns {Promise<Category>}
 */
export function saveOrUpdateCategory(data: Partial<Category>): Promise<Category> {
  return request({
    url: '/category/saveOrUpdate',
    method: 'get',
    params: data,
  });
}

/**
 * 删除分类
 * @param {number|string} id - 分类ID
 * @returns {Promise<void>}
 */
export function deleteCategory(id: number | string): Promise<void> {
  return request({
    url: `/category/delete/${id}`,
    method: 'get',
  });
}
