<template>
  <div class="user-info-display" :class="{ detailed: detailed }">
    <el-avatar :src="avatarUrl" :alt="user?.userName || '未知用户'" @error="handleAvatarError" />
    <div class="user-details">
      <div class="username">
        {{ user?.userName || '未知用户' }}
      </div>
      <div v-if="detailed && user?.bio" class="bio">
        {{ user.bio || '这个人很懒，什么都没写~' }}
      </div>
      <div v-if="detailed" class="stats">
        <div class="stat-item">
          <span class="count">{{ user?.videoCount || 0 }}</span>
          <span class="label">视频</span>
        </div>
      </div>
    </div>
    <el-button
      v-if="showFollowButton && user?.id"
      :type="user.followed ? 'default' : 'primary'"
      @click="handleFollow"
    >
    </el-button>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { ElMessage } from 'element-plus';
  import { useUserStore } from '@/stores/user';

  // 组件逻辑
  interface UserInfo {
    id?: string | number;
    userName?: string;
    avatar?: string;
    bio?: string;
    followerCount?: number;
    followingCount?: number;
    videoCount?: number;
    followed?: boolean;
  }

  const props = defineProps<{
    user?: UserInfo;
    size?: number | 'large' | 'default' | 'small';
    showFollowers?: boolean;
    showFollowButton?: boolean;
    buttonSize?: 'large' | 'default' | 'small';
    detailed?: boolean;
  }>();

  const userStore = useUserStore();

  // 计算头像URL
  const avatarUrl = computed(() => {
    if (!props.user?.avatar) {
      return new URL('@/assets/default-avatar.png', import.meta.url).href;
    }
    return props.user.avatar;
  });

  // 处理关注/取消关注
  const handleFollow = async () => {
    if (!props.user?.id || !userStore.isLoggedIn) {
      ElMessage.warning('请先登录');
      return;
    }
  };

  // 处理头像加载错误
  const handleAvatarError = (e: Event) => {
    const img = e.target as HTMLImageElement;
    if (img) {
      img.src = new URL('@/assets/default-avatar.png', import.meta.url).href;
      // 防止无限循环错误
      img.onerror = null;
    }
  };
</script>

<style scoped>
  .user-info-display {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-info-display.detailed {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .user-info-display.detailed .user-details {
    gap: 0.5rem;
  }

  .username {
    font-weight: 500;
    color: #333;
  }

  .user-info-display.detailed .username {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .bio {
    color: #666;
    margin-bottom: 1rem;
  }

  .stats {
    display: flex;
    gap: 2rem;
    margin-top: 0.5rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .count {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .label {
    color: #666;
    font-size: 0.9rem;
  }
</style>