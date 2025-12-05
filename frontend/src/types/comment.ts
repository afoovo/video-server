// 评论类型定义

export interface Comment {
  id: string;
  content: string;
  videoId: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  likeCount: number;
  dislikeCount: number;
  replyTo?: string;
  replies?: Comment[];
  isLiked?: boolean;
  isDisliked?: boolean;
}

export interface CommentCreate {
  videoId: string;
  content: string;
  replyTo?: string;
}

export interface CommentUpdate {
  content: string;
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface CommentFilter {
  videoId: string;
  sortBy?: 'newest' | 'popular';
  page?: number;
  pageSize?: number;
  parentId?: string;
}

export interface CommentState {
  comments: Record<string, Comment[]>; // 按视频ID存储评论列表
  loading: boolean;
  error: string | null;
  pagination: Record<string, { page: number; hasMore: boolean }>;
}
