import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getVideos, searchVideos } from '@/api/video';
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

  return {
    videos,
    currentVideo,
    loading,
    total,
    searchResults,
    searchLoading,
    searchKeyword,
    fetchVideos,
    searchVideoList,
    clearSearchResults,
  };
});
