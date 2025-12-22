// 评论类型定义

export interface Comment {
  id: number;
  content: string;
  videoId: number;
  userId: number;
  createTime: string;
  updateTime?: string;
}

export interface CommentCreate {
  content: string;
  videoId: number;
  userId?: number;
}
