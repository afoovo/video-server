import request from '@/utils/request';
import type { Video, VideoDetail, VideoListResponse } from '@/types/video';

/**
 * 获取视频列表
 * @param {Object} params - 查询参数
 * @param {number} [params.pageNum=1] - 页码
 * @param {number} [params.pageSize=10] - 每页数量
 * @returns {Promise<VideoListResponse>}
 */
export function getVideos(
  params: {
    pageNum?: number;
    pageSize?: number;
  } = {}
): Promise<VideoListResponse> {
  return request({
    url: '/video/page',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 20,
    },
  });
}

/**
 * 获取所有视频
 * @returns {Promise<Video[]>}
 */
export function getAllVideos(): Promise<Video[]> {
  return request({
    url: '/video/list',
    method: 'get',
  });
}

/**
 * 获取视频详情
 * @param {number|string} id - 视频ID
 * @returns {Promise<VideoDetail>}
 */
export function getVideoDetail(id: number | string): Promise<VideoDetail> {
  return request({
    url: `/video/${id}`,
    method: 'get',
    params: {
      Id: id,
    },
  });
}

/**
 * 上传视频到本地
 * @param {FormData} data - 表单数据
 * @param {Function} [onProgress] - 上传进度回调
 * @returns {Promise<Video>}
 */
export function uploadVideoLocally(
  data: FormData,
  onProgress?: (progress: number) => void
): Promise<Video> {
  return request({
    url: '/file/uploadLocally',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: progressEvent => {
      if (progressEvent.total) {
        const progress = Math.min(100, (progressEvent.loaded / progressEvent.total) * 100);
        onProgress?.(progress);
      }
    },
    timeout: 60000, // 60秒超时
  });
}

/**
 * 上传视频到云存储
 * @param {FormData} data - 表单数据
 * @param {Function} [onProgress] - 上传进度回调
 * @returns {Promise<Video>}
 */
export function uploadVideoToCloud(
  data: FormData,
  onProgress?: (progress: number) => void
): Promise<Video> {
  return request({
    url: '/file/uploadCloud',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: progressEvent => {
      if (progressEvent.total) {
        const progress = Math.min(100, (progressEvent.loaded / progressEvent.total) * 100);
        onProgress?.(progress);
      }
    },
    timeout: 60000, // 60秒超时
  });
}

/**
 * 获取用户视频列表
 * @param {number|string} userId - 用户ID
 * @returns {Promise<Video[]>}
 */
export function getUserVideos(userId: number | string): Promise<Video[]> {
  // 参数验证
  if (!userId) {
    return Promise.reject(new Error('userId不能为空'));
  }

  return request({
    url: `/user/${userId}/videoList`,
    method: 'get',
  });
}

/**
 * 模糊搜索视频
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<Video[]>}
 */
export function searchVideos(keyword: string): Promise<Video[]> {
  return request({
    url: `/video/search/${keyword}`,
    method: 'get',
  });
}

/**
 * 获取视频播放URL
 * @param {number|string} id - 视频ID
 * @returns {string} 视频播放URL
 */
export function getVideoPlayUrl(id: number | string): string {
  return `/video/play/${id}`;
}
