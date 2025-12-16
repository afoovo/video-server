<template>
  <div class="video-card" @click="handleClick">
    <div class="video-cover">
      <img
        :alt="video.title"
        :src="video.coverUrl || defaultCover"
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
      <h3 :title="video.title" class="title">
        {{ video.title }}
      </h3>
      <div class="meta">
        <div class="uploader">
          <span class="user-name" @click.stop="goToUserProfile">{{ userName }}</span>
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

<script lang="ts" setup>
  import { Star, View } from '@element-plus/icons-vue';
  import { formatDuration, formatNumber, formatTime } from '@/utils/format';
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { getUserInfo } from '@/api/user';

  // 导入默认资源
  const defaultCover = new URL('@/assets/default-cover.jpg', import.meta.url).href;

  // 为VideoCard定义独立的Props接口
  interface VideoCardProps {
    video: {
      id: string;
      title: string;
      coverUrl?: string;
      duration: number;
      playCount?: number;
      viewCount?: number;
      likeCount?: number;
      createTime?: string | Date;
      userId?: string;
    };
  }

  const props = defineProps<VideoCardProps>();

  const emit = defineEmits<{
    click: [video: VideoCardProps['video']];
  }>();

  const router = useRouter();
  const userName = ref('');
  const userId = ref('');

  const handleClick = (): void => {
    emit('click', props.video);
  };

  const handleImageError = (e: Event): void => {
    const target = e.target as HTMLImageElement;
    // 防止无限循环错误
    if (target) {
      target.onerror = null;
      target.src = defaultCover;
    }
  };

  // 获取用户名
  const fetchUserName = async () => {
    if (props.video.userId) {
      try {
        const user = await getUserInfo(props.video.userId);
        userName.value = user.userName;
        userId.value = user.id;
      } catch (error) {
        console.error('获取用户信息失败:', error);
        userName.value = '未知用户';
      }
    } else {
      userName.value = '未知用户';
    }
  };

  // 跳转到用户个人资料页面
  const goToUserProfile = () => {
    if (userId.value) {
      router.push(`/profile/${userId.value}`);
    }
  };

  onMounted(() => {
    fetchUserName();
  });
</script>

<style lang="scss" scoped>
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .video-card {
    position: relative;
    overflow: hidden;
    background: $white;
    cursor: pointer;
    transition: transform 0.2s ease;
    will-change: transform;

    //&:hover {
    //  transform: translateY(-4px);
    //  box-shadow: $box-shadow-md;
    //}悬停上浮

    .video-cover {
      position: relative;
      width: 100%;
      aspect-ratio: 16/9;

      .cover-image {
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
          padding: 2px 4px;
          border-radius: $border-radius-sm;
        }
      }
    }

    .video-info {
      padding: $spacing-sm;

      .title {
        margin: 0 0 8px;
        @include text-truncate(2);
        font-size: $font-size-base;
        line-height: $line-height-base;
        font-weight: 500;
        color: $text-color;

        &:hover {
          transition: color 0.2s ease;
          color: $primary-color;
        }
      }

      .meta {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .uploader {
          display: flex;
          align-items: center;
          gap: 8px;

          .user-name {
            font-size: $font-size-sm;
            color: $text-color-secondary;
            cursor: pointer;

            &:hover {
              color: $primary-color;
            }
          }
        }

        .stats {
          color: $text-color-secondary;
          font-size: $font-size-sm;
        }
      }
    }
  }
</style>
