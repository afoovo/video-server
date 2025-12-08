import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getAllVideos,
  getUserVideos,
  getVideoDetail,
  getVideos,
  searchVideos,
  uploadVideoLocally,
  uploadVideoToCloud,
} from '@/api/video';
import type { Video, VideoDetail } from '@/types/video';

export const useVideoStore = defineStore('video', () => {
  const videos = ref<Video[]>([]);
  const currentVideo = ref<VideoDetail | null>(null);
  const loading = ref<boolean>(false);
  const total = ref<number>(0);

  // 搜索相关状态
  const searchResults = ref<Video[]>([]);
  const searchLoading = ref<boolean>(false);
  const searchKeyword = ref<string>('');

  // 获取视频列表
  async function fetchVideos(params: { pageNum?: number; pageSize?: number }): Promise<void> {
    try {
      loading.value = true;
      // 使用标准化的分页参数命名
      const requestParams = {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 20,
      };
      const data = await getVideos(requestParams);
      videos.value = data.records || [];
      total.value = data.total;
    } catch (error) {
      console.error('获取视频列表失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 获取所有视频
  async function fetchAllVideos(): Promise<void> {
    try {
      loading.value = true;
      const data = await getAllVideos();
      videos.value = data || [];
    } catch (error) {
      console.error('获取所有视频失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 获取视频详情
  async function fetchVideoDetail(id: string): Promise<VideoDetail> {
    try {
      loading.value = true;
      const data = await getVideoDetail(id);
      currentVideo.value = data;
      return data;
    } catch (error) {
      console.error('获取视频详情失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 获取用户视频列表
  async function fetchUserVideos(userId: string): Promise<void> {
    try {
      loading.value = true;
      const data = await getUserVideos(userId);
      videos.value = data || [];
    } catch (error) {
      console.error('获取用户视频列表失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 搜索视频
  async function searchVideoList(name: string): Promise<Video[]> {
    try {
      searchLoading.value = true;
      searchKeyword.value = name;
      const data = await searchVideos(name);
      searchResults.value = data || [];
      return searchResults.value;
    } catch (error) {
      console.error('搜索视频失败:', error);
      searchResults.value = [];
      throw error;
    } finally {
      searchLoading.value = false;
    }
  }

  // 清除搜索结果
  function clearSearchResults(): void {
    searchResults.value = [];
    searchKeyword.value = '';
  }

  // 上传视频到本地
  async function uploadVideoToLocal(
    videoData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<Video> {
    try {
      loading.value = true;
      return await uploadVideoLocally(videoData, onProgress);
    } catch (error) {
      console.error('上传视频到本地失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 上传视频到云存储
  async function uploadVideoToCloudStorage(
    videoData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<Video> {
    try {
      loading.value = true;
      return await uploadVideoToCloud(videoData, onProgress);
    } catch (error) {
      console.error('上传视频到云存储失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 历史记录项接口
  interface HistoryItem {
    id: number | string;
    title: string;
    coverUrl: string;
    playCount: number;
    userId: string;
    viewTime: string;
  }

  // 添加视频到历史记录
  function addToHistory(video: Video | VideoDetail | null): void {
    if (!video) return;

    try {
      // 获取历史记录
      let history = JSON.parse(localStorage.getItem('videoHistory') || '[]') as HistoryItem[];

      // 删除可能存在的相同视频
      history = history.filter(item => item.id !== video.id);

      // 添加到历史记录开头
      history.unshift({
        id: video.id,
        title: video.title,
        coverUrl: video.coverUrl,
        playCount: video.playCount || video.viewCount || 0,
        userId: video.userId,
        viewTime: new Date().toISOString(),
      });

      // 限制历史记录数量
      if (history.length > 50) {
        history = history.slice(0, 50);
      }

      // 保存到本地存储
      localStorage.setItem('videoHistory', JSON.stringify(history));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }

  return {
    videos,
    currentVideo,
    loading,
    total,
    searchResults,
    searchLoading,
    searchKeyword,
    fetchVideos,
    fetchAllVideos,
    fetchVideoDetail,
    fetchUserVideos,
    searchVideoList,
    clearSearchResults,
    uploadVideoToLocal,
    uploadVideoToCloudStorage,
    addToHistory,
  };
});
