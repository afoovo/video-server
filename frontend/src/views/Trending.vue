<template>
  <div class="trending-page">
    <div class="page-container">
      <!-- 排行榜头部 -->
      <div class="trending-header">
        <h2 class="title">热门视频排行</h2>
        <div class="filter">
          <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
            <el-radio-button value="day"> 日排行</el-radio-button>
            <el-radio-button value="week"> 周排行</el-radio-button>
            <el-radio-button value="month"> 月排行</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 排行榜列表 -->
      <div v-loading="loading" class="trending-list">
        <div
          v-for="(video, index) in videos"
          :key="video.id"
          class="trending-item"
          @click="goToVideo(video.id)"
        >
          <div class="rank-number" :class="{ top3: index < 3 }">
            {{ index + 1 }}
          </div>
          <div class="video-cover">
            <img :src="`${video.coverUrl}`" :alt="video.title" />
            <div class="video-duration">
              {{ formatDuration(video.duration) }}
            </div>
          </div>
          <div class="video-info">
            <h3 class="title">
              {{ video.title }}
            </h3>
            <div class="stats">
              <div class="uploader">
                <UserCard :user="video.user" :show-account="false" />
              </div>
              <div class="counts">
                <span class="play-count">
                  <el-icon><View /></el-icon>
                  {{ formatNumber(video.viewCount) }}
                </span>
                <span class="like-count">
                  <el-icon><Star /></el-icon>
                  {{ formatNumber(video.likeCount) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { Star, View } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import request from '@/utils/request';

  const router = useRouter();
  const loading = ref(false);
  const videos = ref([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const timeRange = ref('day');

  // 加载热门视频
  const loadTrendingVideos = async () => {
    loading.value = true;
    try {
      const res = await request.get('/videos', {
        params: {
          type: 'hot',
          pageNum: currentPage.value,
          pageSize: pageSize.value,
          timeRange: timeRange.value,
        },
      });
      videos.value = res.data.records;
      total.value = res.data.total;
    } catch {
      ElMessage.error('获取热门视频失败');
    } finally {
      loading.value = false;
    }
  };

  // 处理时间范围变化
  const handleTimeRangeChange = () => {
    currentPage.value = 1;
    loadTrendingVideos();
  };

  // 处理分页变化
  const handlePageChange = () => {
    loadTrendingVideos();
  };

  // 跳转到视频详情
  const goToVideo = id => {
    router.push(`/video/${id}`);
  };

  const formatDuration = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = num => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num;
  };

  onMounted(() => {
    loadTrendingVideos();
  });
</script>

<style lang="scss" scoped></style>
