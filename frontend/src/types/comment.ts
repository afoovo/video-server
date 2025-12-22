// 评论类型定义

export interface Comment {
  id: string;
  content: string;
  videoId: string;
  userId: string;
  createTime: string;
  updateTime?: string;
}

export interface CommentCreate {
  content: string;
  videoId: string;
  userId?: string;
}
