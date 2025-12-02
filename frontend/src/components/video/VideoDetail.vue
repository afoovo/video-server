<template>
  <div v-loading="loading" class="video-detail">
    <div class="main-content">
      <!-- 视频播放器 -->
      <div class="video-player-container">
        <VideoPlayer
          v-if="video && video.fileUrl"
          :url="video.fileUrl"
          :poster="video.coverUrl || ''"
          :title="video.title"
          :video-id="videoId"
          @ready="handlePlayerReady"
          @play="handlePlayerPlay"
          @error="handlePlayerError"
        />
      </div>

      <!-- 视频信息 -->
      <div v-if="video" class="video-info">
        <h1 class="title">
          {{ video.title }}
        </h1>
        <div class="meta">
          <span class="time">{{ formatTime(video.createTime) }}</span>
        </div>

        <div class="description">
          {{ video.description }}
        </div>

        <div v-if="video.user" class="uploader">
          <UserInfoDisplay
            :user="video.user"
            :size="40"
            :show-followers="true"
            :show-follow-button="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { getVideoDetail } from '@/api/video';
  import { formatTime } from '@/utils/format';
  import VideoPlayer from './VideoPlayer.vue';
  import UserInfoDisplay from '@/components/common/UserInfoDisplay.vue';

  const route = useRoute();

  const videoId = ref(route.params.id);
  const video = ref(null);
  const loading = ref(true);

  // 加载视频信息
  const loadVideoInfo = async () => {
    loading.value = true;
    try {
      video.value = await getVideoDetail(videoId.value);
    } catch (error) {
      console.error('获取视频信息失败:', error);
      ElMessage.error('获取视频信息失败');
    } finally {
      loading.value = false;
    }
  };

  // 监听视频ID变化，重新加载数据
  watch(
    () => route.params.id,
    async newId => {
      if (newId) {
        videoId.value = newId;
        await loadVideoInfo();
      }
    }
  );

  // 播放器事件处理
  const handlePlayerReady = player => {
    console.log('播放器准备就绪', player);
  };

  const handlePlayerPlay = () => {
    console.log('视频开始播放');
  };

  const handlePlayerError = error => {
    console.error('播放器错误:', error);
    ElMessage.error('视频播放出错');
  };

  onMounted(() => {
    loadVideoInfo();
  });
</script>

<style lang="scss" scoped>
  .video-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;

    .main-content {
      .video-player-container {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 56.25%; // 16:9 宽高比
        background: #000;
        margin-bottom: 20px;
        border-radius: 4px;
        overflow: hidden;
      }

      .video-info {
        padding: 20px;
        background: var(--el-bg-color);
        border-radius: var(--el-border-radius-base);
        margin-bottom: 20px;

        .title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .meta {
          color: var(--el-text-color-secondary);
          margin-bottom: 15px;
        }

        .description {
          white-space: pre-wrap;
          margin-bottom: 20px;
          color: var(--el-text-color-regular);
        }

        .uploader {
          display: flex;
          align-items: center;
          gap: 15px;
        }
      }
    }
  }
</style>
