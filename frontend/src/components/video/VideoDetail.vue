<template>
  <div v-loading="loading" class="video-detail">
    <div class="content-wrapper">
      <div class="main-content">
        <!-- 视频标题 -->
        <h1 v-if="video" class="video-title">
          {{ video.title }}
        </h1>

        <!-- 视频播放器 -->
        <div class="video-player-container">
          <VideoPlayer
            v-if="video && video.fileUrl"
            :poster="video.coverUrl || ''"
            :title="video.title"
            :url="video.fileUrl"
            :video-id="videoId"
            @error="handlePlayerError"
            @play="handlePlayerPlay"
            @ready="handlePlayerReady"
          />
        </div>

        <!-- 视频详情 -->
        <div v-if="video" class="video-description">
          <div class="meta">
            <span class="time">{{ formatTime(video.createTime) }}</span>
          </div>
          <div class="description">
            {{ video.description }}
          </div>
        </div>
        <!--评论区-->
        <div class="comment-section">
          <CommentList :video-id="videoId" />
        </div>
      </div>

      <!-- 右侧栏 -->
      <div class="rightbar">
        <div v-if="video && video.userId" class="user-card-wrapper">
          <UserCard :avatar-size="60" :show-account="true" :user-id="video.userId" />
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
  import UserCard from '@/components/user/UserCard.vue';
  import CommentList from '@/components/comment/CommentList.vue';

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
    min-height: 100vh;

    .content-wrapper {
      display: flex;
      gap: 20px;
    }

    .main-content {
      flex: 1;
      min-width: 600px; /* 设置最小宽度，确保内容区域不会被过度压缩 */

      .video-title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 16px;
        text-align: left;
        color: var(--el-text-color-primary);
      }

      .video-player-container {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 56.25%;
        background: #000;
        margin-bottom: 20px;
        border-radius: 4px;
        overflow: hidden;
      }

      .video-description {
        padding: 20px;
        background: var(--el-bg-color);
        border-radius: var(--el-border-radius-base);
        margin-bottom: 20px;
        text-align: left;
        //box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .meta {
          color: var(--el-text-color-secondary);
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid var(--el-border-color-lighter);
        }

        .description {
          white-space: pre-wrap;
          color: var(--el-text-color-regular);
          line-height: 1.5;
        }
      }
    }

    .rightbar {
      width: 300px;

      .user-card-wrapper {
        background-color: var(--el-bg-color);
        border-radius: var(--el-border-radius-base);
        padding: 16px;
        margin-bottom: 16px;
      }
    }

    /* 响应式布局 - 在小屏幕上垂直排列 */
    @media (max-width: 992px) {
      .content-wrapper {
        flex-direction: column;
      }

      .main-content {
        min-width: 100%;
        order: 2; /* 主内容在下方 */
      }

      .rightbar {
        width: 100%;
        order: 1; /* 右侧栏在上方 */
      }
    }
  }
</style>