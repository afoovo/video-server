// 视频类型定义

export interface Video {
  id: number;
  title: string;
  description: string;
  coverUrl: string;
  fileUrl: string;
  duration: number;
  status: number;
  createTime: string;
  updateTime: string;
  userId: number;
  categoryId: number;
  // 统计字段（可能由其他服务计算）
  playCount?: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  // 为了兼容性，添加别名
  videoUrl?: string;
  desc?: string;
}

export interface VideoDetail extends Video {
  relatedVideos?: Video[];
}

export interface VideoListResponse {
  records: Video[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface VideoUploadForm {
  title: string;
  desc: string;
  file: File | null;
  cover: File | null;
}

export interface VideoFilter {
  keyword?: string;
  category?: string;
  tag?: string;
  sortBy?: 'newest' | 'popular' | 'trending';
  page?: number;
  pageSize?: number;
}
