<template>
  <div class="video-list">
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
  import { computed, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import VideoCard from './VideoCard.vue';
  import { getUserVideos, getVideos } from '@/api/video';
  import type { Video } from '@/types/video';

  const router = useRouter();
  const props = defineProps({
    // 定义props，idea问题会出现报错，请忽略
    userId: {
      type: [String],
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
  });

  const loading = ref(false);
  const videos = ref<Video[]>([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(12);

  // 搜索和筛选条件
  const keyword = ref('');
  const categoryId = ref('');

  const showPagination = computed(() => total.value > pageSize.value);
  const emptyText = computed(() =>
    keyword.value || categoryId.value ? '没有找到符合条件的视频' : '暂无视频数据'
  );

  const fetchVideos = async () => {
    loading.value = true;
    try {
      let response;

      // 如果有 userId，获取用户视频
      if (props.userId) {
        response = await getUserVideos(props.userId);
        // 将用户视频列表转换为标准格式
        videos.value = response || [];
        total.value = response ? response.length : 0;
      }
      // 如果有自定义URL，使用该URL
      else if (props.url) {
        // 这里可以扩展为使用自定义URL获取视频
        // 目前使用默认API
        response = await getVideos({
          pageNum: currentPage.value,
          pageSize: pageSize.value,
        });
        videos.value = response.records || [];
        total.value = response.total || 0;
      }
      // 默认获取所有视频
      else {
        response = await getVideos({
          pageNum: currentPage.value,
          pageSize: pageSize.value,
        });
        videos.value = response.records || [];
        total.value = response.total || 0;
      }
    } catch {
      ElMessage.error('获取视频列表失败');
    } finally {
      loading.value = false;
    }
  };

  const handleVideoClick = (video: Video) => {
    router.push(`/video/${video.id}`);
  };

  const handleSizeChange = () => {
    currentPage.value = 1;
    fetchVideos();
  };

  const handleCurrentChange = () => {
    fetchVideos();
  };

  // 暴露方法给父组件
  defineExpose({
    // 暴露一个方法给父组件调用，idea问题会出现报错，请忽略
    fetchVideos,
    // 也可以暴露其他方法，如果需要的话
    loadVideos: fetchVideos, // 为了兼容性，提供一个别名
  });

  // 生命周期
  onMounted(() => {
    fetchVideos();
  });
</script>

<style scoped>
  .video-list {
    padding: 20px;
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
    .video-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }

    .pagination {
      justify-content: center;
    }
  }
</style>
