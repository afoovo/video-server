<template>
  <div v-loading="loading" class="video-detail">
    <div class="video-container">
      <div class="left-container">
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
            @pause="handlePlayerPause"
          />
        </div>

        <!-- 视频标题 -->
        <h1 v-if="video" class="video-title">
          {{ video.title }}
        </h1>

        <!-- 视频详情 -->
        <div v-if="video" class="video-description">
          <div class="meta">
            <span class="time">{{ formatTime(video.createTime) }}</span>
          </div>
          <div class="description">
            {{ video.description }}
          </div>
        </div>

        <!-- 用户信息卡片 -->
        <div v-if="video && video.userId" class="user-info-card">
          <UserCard :avatar-size="60" :show-account="true" :user-id="String(video.userId)" />
        </div>

        <!--评论区-->
        <div class="comment-section">
          <CommentList :video-id="videoId" />
        </div>
      </div>

      <div class="right-container">
        <!-- 视频选项卡 -->
        <div class="video-tabs">
          <div class="tab-item active">弹幕</div>
          <div class="tab-item">合集列表</div>
        </div>

        <!-- 推荐视频列表 -->
        <div class="recommended-videos">
          <div class="recommended-title">推荐列表</div>
          <div class="video-list-placeholder">
            <!-- 推荐视频会在此显示 -->
          </div>
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
  const handlePlayerPause = () => {
    console.log('视频暂停播放');
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
    position: relative;
    padding: 20px;
    min-height: 100vh;

    &::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-image: url('@/assets/PixPin_2025-12-22_15-41-20.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: 0.3;
      z-index: -1;
      pointer-events: none;
    }

    .video-container {
      display: flex;
      gap: 20px;
      margin: 0 auto;
      max-width: 1400px;
    }

    .left-container {
      flex: 1;
      min-width: 0;

      .video-player-container {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 56.25%;
        background: #000;
        margin-bottom: 20px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .video-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 12px;
        text-align: left;
        color: var(--el-text-color-primary);
        line-height: 1.4;
      }

      .video-description {
        padding: 16px;
        background: var(--el-bg-color);
        border-radius: 8px;
        margin-bottom: 16px;
        text-align: left;
        border: 1px solid var(--el-border-color-lighter);

        .meta {
          color: var(--el-text-color-secondary);
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--el-border-color-lighter);
          font-size: 12px;
        }

        .description {
          white-space: pre-wrap;
          color: var(--el-text-color-regular);
          line-height: 1.6;
          font-size: 14px;
        }
      }

      .user-info-card {
        padding: 16px;
        background: var(--el-bg-color);
        border-radius: 8px;
        margin-bottom: 16px;
        border: 1px solid var(--el-border-color-lighter);
      }

      .comment-section {
        margin-top: 20px;
      }
    }

    .right-container {
      width: 320px;
      flex-shrink: 0;

      .video-tabs {
        display: flex;
        background: var(--el-bg-color);
        border-radius: 8px;
        border: 1px solid var(--el-border-color-lighter);
        margin-bottom: 16px;
        overflow: hidden;

        .tab-item {
          flex: 1;
          padding: 12px;
          text-align: center;
          font-size: 13px;
          cursor: pointer;
          border-right: 1px solid var(--el-border-color-lighter);
          color: var(--el-text-color-regular);
          transition: all 0.3s ease;

          &:last-child {
            border-right: none;
          }

          &:hover {
            background: var(--el-fill-color-light);
          }

          &.active {
            background: var(--el-color-primary);
            color: #fff;
          }
        }
      }

      .recommended-videos {
        background: var(--el-bg-color);
        border-radius: 8px;
        border: 1px solid var(--el-border-color-lighter);
        overflow: hidden;

        .recommended-title {
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          border-bottom: 1px solid var(--el-border-color-lighter);
          background: var(--el-fill-color-light);
        }

        .video-list-placeholder {
          padding: 20px;
          min-height: 400px;
          color: var(--el-text-color-secondary);
          font-size: 12px;
        }
      }
    }

    /* 响应式布局 */
    @media (max-width: 1024px) {
      .video-container {
        flex-direction: column;
      }

      .right-container {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      padding: 12px;

      .video-container {
        gap: 12px;
      }

      .left-container {
        .video-title {
          font-size: 18px;
        }
      }

      .right-container {
        .video-tabs {
          .tab-item {
            font-size: 12px;
            padding: 10px;
          }
        }
      }
    }
  }
</style>
