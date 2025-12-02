// 通用类型定义

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data?: T;
  dataCount?: number;
}

export interface PaginatedResponse<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface PaginationParams {
  pageNum?: number;
  pageSize?: number;
}

export type Nullable<T> = T | null | undefined;

export type MaybePromise<T> = T | Promise<T>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export interface AppConfig {
  apiUrl: string;
  appName: string;
  version: string;
  defaultPageSize: number;
}

export type SortDirection = 'asc' | 'desc';

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

// 响应式工具类型
export type { Ref as RefType, ComputedRef as ComputedRefType } from 'vue';

export interface StoreState<T> {
  data: T;
  status: LoadingStatus;
  error: string | null;
}
