import request from '@/utils/request';
import type { Comment, CommentCreate } from '@/types/comment';
import type { ApiResponse } from '@/types/common';

/**
 * 获取视频评论列表
 */
export function getVideoComments(videoId: string): Promise<Comment[]> {
  return request({
    url: `/comment/list/video/${videoId}`,
    method: 'get',
  });
}

/**
 * 创建评论
 */
export function createComment(data: CommentCreate): Promise<ApiResponse<string>> {
  return request({
    url: '/comment/create',
    method: 'post',
    data,
  });
}

/**
 * 删除评论
 */
export function deleteComment(id: string): Promise<ApiResponse<string>> {
  return request({
    url: `/comment/delete/${id}`,
    method: 'delete',
  });
}
