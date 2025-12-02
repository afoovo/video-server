<template>
  <div class="video-list">
    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索视频"
        prefix-icon="el-icon-search"
        style="width: 300px"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
      <el-button type="success" @click="handleCreate"> 上传视频 </el-button>
      <div class="filter-group">
        <span>分类:</span>
        <el-select v-model="categoryId" placeholder="选择分类" @change="handleSearch">
          <el-option label="全部" value="" />
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </div>
    </div>

    <div v-loading="loading" class="video-grid">
      <div v-for="video in videos" :key="video.id" class="video-item">
        <video-card :video="video" @click="handleVideoClick(video)" />
      </div>
    </div>

    <el-empty v-if="!loading && videos.length === 0" :description="emptyText" />

    <div v-if="showPagination && total > 0" class="pagination">
      <el-pagination
        v-model="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import VideoCard from './VideoCard.vue';
  import { getVideos } from '@/api/video';
  import type { Video } from '@/types/video';

  const router = useRouter();

  // mock分类数据
  const categories = [
    { id: '', name: '全部' },
    { id: 'gaming', name: '游戏' },
    { id: 'music', name: '音乐' },
    { id: 'movie', name: '电影' },
    { id: 'anime', name: '动漫' },
    { id: 'tech', name: '科技' },
    { id: 'sports', name: '体育' },
    { id: 'food', name: '美食' },
  ];

  // 状态管理
  const loading = ref(false);
  const videos = ref<Video[]>([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(12);

  // 搜索和筛选条件
  const keyword = ref('');
  const categoryId = ref('');

  // 计算属性
  const showPagination = computed(() => total.value > pageSize.value);
  const emptyText = computed(() =>
    keyword.value || categoryId.value ? '没有找到符合条件的视频' : '暂无视频数据'
  );

  // 方法
  const fetchVideos = async () => {
    loading.value = true;
    try {
      const response = await getVideos({
        pageNum: currentPage.value,
        pageSize: pageSize.value,
      });
      videos.value = response.records || [];
      total.value = response.total || 0;
    } catch {
      ElMessage.error('获取视频列表失败');
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    currentPage.value = 1;
    fetchVideos();
  };

  const handleVideoClick = (video: Video) => {
    router.push(`/video/${video.id}`);
  };

  const handleCreate = () => {
    router.push('/video/upload');
  };

  const handleSizeChange = () => {
    currentPage.value = 1;
    fetchVideos();
  };

  const handleCurrentChange = () => {
    fetchVideos();
  };

  // 生命周期
  onMounted(() => {
    fetchVideos();
  });
</script>

<style scoped>
  .video-list {
    padding: 20px;
  }

  .filter-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 8px;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .filter-group span {
    color: #606266;
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .video-item {
    transition: transform 0.3s ease;
  }

  .video-item:hover {
    transform: translateY(-4px);
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  @media (max-width: 768px) {
    .filter-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-group {
      margin-left: 0;
    }

    .video-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }

    .pagination {
      justify-content: center;
    }
  }
</style>
