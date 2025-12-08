import request from '@/utils/request';
import type { Comment, CommentCreate, CommentListResponse } from '@/types/comment';
import type { ApiResponse } from '@/types/common';

/**
 * 获取视频评论列表
 * @param {Object} params 参数对象
 * @param {string} params.videoId 视频ID
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页条数
 * @param {string} params.sort 排序方式：latest最新、hot最热
 * @returns {Promise<CommentListResponse>}
 */
export function getVideoComments(params: {
  videoId: string;
  pageNum?: number;
  pageSize?: number;
  sort?: 'latest' | 'hot';
}): Promise<CommentListResponse> {
  // 构建API路径
  const url = `/comments/video/${params.videoId}`;

  return request({
    url,
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      sort: params.sort || 'latest',
    },
  });
}

/**
 * 获取评论回复列表
 * @param {string} commentId - 评论ID
 * @param {Object} params - 查询参数
 * @param {number} [params.pageNum=1] - 页码
 * @param {number} [params.pageSize=10] - 每页数量
 * @returns {Promise<CommentListResponse>}
 */
export function getCommentReplies(
  commentId: string,
  params: { pageNum?: number; pageSize?: number } = {}
): Promise<CommentListResponse> {
  return request({
    url: `/comments/${commentId}/replies`,
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
    },
  });
}

/**
 * 创建评论
 * @param {CommentCreate} data 评论数据
 * @returns {Promise<Comment>}
 */
export function createComment(data: CommentCreate): Promise<Comment> {
  return request({
    url: '/comments',
    method: 'post',
    data,
  });
}

/**
 * 删除评论
 * @param {string} commentId 评论ID
 * @returns {Promise<ApiResponse<void>>}
 */
export function deleteComment(commentId: string): Promise<ApiResponse<void>> {
  return request({
    url: `/comments/${commentId}`,
    method: 'delete',
  });
}

/**
 * 点赞/取消点赞评论
 * @param {string} commentId 评论ID
 * @returns {Promise<ApiResponse<{liked: boolean; likeCount: number}>>}
 */
export function likeComment(
  commentId: string
): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
  return request({
    url: `/comments/${commentId}/like`,
    method: 'post',
  });
}

/**
 * 获取评论点赞数
 * @param {string} id - 评论ID
 * @returns {Promise<ApiResponse<{count: number}>>}
 */
export function getCommentLikeCount(id: string): Promise<ApiResponse<{ count: number }>> {
  return request({
    url: `/likes/comment/${id}/count`,
    method: 'get',
  });
}

/**
 * 检查评论是否已点赞
 * @param {string} id - 评论ID
 * @returns {Promise<ApiResponse<{liked: boolean}>>}
 */
export function checkCommentLiked(id: string): Promise<ApiResponse<{ liked: boolean }>> {
  return request({
    url: `/likes/comment/${id}/check`,
    method: 'get',
  });
}
