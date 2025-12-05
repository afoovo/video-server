<template>
  <div class="video-card" @click="handleClick">
    <div class="video-cover">
      <img
        :src="video.coverUrl ? `/api${video.coverUrl}` : defaultCover"
        :alt="video.title"
        class="cover-image"
        @error="handleImageError"
      />

      <span class="duration">{{ formatDuration(video.duration) }}</span>

      <div class="play-info">
        <span class="play-count">
          <el-icon><View /></el-icon>
          {{ formatNumber(video.viewCount || video.playCount || 0) }}
        </span>
        <span class="like-count">
          <el-icon><Star /></el-icon>
          {{ formatNumber(video.likeCount || 0) }}
        </span>
      </div>
    </div>

    <div class="video-info">
      <h3 class="title" :title="video.title">
        {{ video.title }}
      </h3>
      <div class="meta">
        <div class="uploader" @click.stop="handleUploaderClick">
          <UserInfoDisplay
            :user="video.user"
            :size="24"
            :show-followers="false"
            :show-follow-button="false"
          />
        </div>
        <div class="stats">
          <span class="upload-time">{{
            video.createTime ? formatTime(video.createTime) : ''
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { View, Star } from '@element-plus/icons-vue';
  import { formatNumber, formatTime, formatDuration } from '@/utils/format';
  // 导入默认资源，使用require语法避免类型问题
  const defaultCover = new URL('@/assets/default-cover.jpg', import.meta.url).href;

  import UserInfoDisplay from '@/components/common/UserInfoDisplay.vue';

  // 为VideoCard定义独立的Props接口，避免与Video接口冲突
  interface VideoCardProps {
    video: {
      id: string | number;
      title: string;
      coverUrl?: string;
      duration: number;
      playCount?: number;
      viewCount?: number;
      likeCount?: number;
      createTime?: string | Date;
      user?: {
        id?: string;
        userName?: string;
        avatar?: string;
      };
    };
  }

  const props = defineProps<VideoCardProps>();

  const emit = defineEmits<{
    click: [video: VideoCardProps['video']];
    'uploader-click': [user: VideoCardProps['video']['user']];
  }>();

  const handleClick = (): void => {
    emit('click', props.video);
  };

  const handleUploaderClick = (): void => {
    if (props.video.user) {
      emit('uploader-click', props.video.user);
    }
  };

  const handleImageError = (e: Event): void => {
    const target = e.target as HTMLImageElement;
    // 防止无限循环错误
    if (target) {
      target.onerror = null;
      target.src = defaultCover;
    }
  };
</script>

<style lang="scss" scoped>
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .video-card {
    position: relative;
    border-radius: $border-radius-md;
    overflow: hidden;
    background: $white;
    cursor: pointer;
    transition: transform 0.2s ease;
    will-change: transform;

    &:hover {
      transform: translateY(-5px);
      box-shadow: $box-shadow-md;
    }

    .video-cover {
      position: relative;
      width: 100%;

      .cover-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.2s;
      }

      .duration {
        position: absolute;
        bottom: $spacing-xs;
        right: $spacing-xs;
        padding: 2px 4px;
        background: rgba(0, 0, 0, 0.7);
        color: $white;
        border-radius: $border-radius-sm;
        font-size: $font-size-sm;
      }

      .play-info {
        position: absolute;
        bottom: $spacing-xs;
        left: $spacing-xs;
        display: flex;
        gap: 8px;
        color: $white;
        font-size: $font-size-sm;

        span {
          @include flex-center;
          gap: 4px;
          background: rgba(0, 0, 0, 0.7);
          padding: 2px 4px;
          border-radius: $border-radius-sm;
        }
      }
    }

    .video-info {
      padding: $spacing-sm;

      .title {
        margin: 0 0 8px;
        font-size: $font-size-base;
        font-weight: 500;
        color: $text-color;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.4;
      }

      .meta {
        @include flex-center;
        gap: $spacing-sm;
        color: $text-color-secondary;
        font-size: $font-size-sm;

        .uploader {
          @include flex-center;
          gap: 4px;
          cursor: pointer;

          &:hover {
            color: $primary-color;
          }
        }

        .stats {
          margin-left: auto;
        }
      }
    }
  }
</style>
