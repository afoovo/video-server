/**
 * 分类状态管理
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  type Category,
  deleteCategory,
  getCategories,
  getCategoryDetail,
  getCategoryVideos,
  saveOrUpdateCategory,
} from '@/api/category';
import type { Video } from '@/types/video';

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([]);
  const currentCategory = ref<Category | null>(null);
  const categoryVideos = ref<Video[]>([]);
  const loading = ref<boolean>(false);

  /**
   * 获取所有分类
   */
  async function fetchCategories(): Promise<void> {
    try {
      loading.value = true;
      const data = await getCategories();
      categories.value = data || [];
    } catch (error) {
      console.error('获取分类列表失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取分类详情
   * @param {number|string} id - 分类ID
   */
  async function fetchCategoryDetail(id: number | string): Promise<void> {
    try {
      loading.value = true;
      currentCategory.value = await getCategoryDetail(id);
    } catch (error) {
      console.error('获取分类详情失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取分类视频列表
   * @param {number|string} id - 分类ID
   */
  async function fetchCategoryVideos(id: number | string): Promise<void> {
    try {
      loading.value = true;
      const data = await getCategoryVideos(id);
      categoryVideos.value = data || [];
    } catch (error) {
      console.error('获取分类视频列表失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 创建或更新分类
   * @param {Partial<Category>} data - 分类数据
   * @returns {Promise<Category>}
   */
  async function saveCategory(data: Partial<Category>): Promise<Category> {
    try {
      loading.value = true;
      const result = await saveOrUpdateCategory(data);

      // 如果是新分类，添加到列表中
      if (!data.id) {
        categories.value.push(result);
      } else {
        // 如果是更新分类，更新列表中的对应分类
        const index = categories.value.findIndex(cat => cat.id === data.id);
        if (index > -1) {
          categories.value[index] = result;
        }
      }

      return result;
    } catch (error) {
      console.error('创建或更新分类失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 删除分类
   * @param {number|string} id - 分类ID
   */
  async function removeCategory(id: number | string): Promise<void> {
    try {
      loading.value = true;
      await deleteCategory(id);

      // 从列表中删除分类
      categories.value = categories.value.filter(cat => cat.id !== id);

      // 如果当前分类被删除，清空当前分类
      if (currentCategory.value?.id === id) {
        currentCategory.value = null;
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    categories,
    currentCategory,
    categoryVideos,
    loading,
    fetchCategories,
    fetchCategoryDetail,
    fetchCategoryVideos,
    saveCategory,
    removeCategory,
  };
});
