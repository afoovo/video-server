<template>
  <div class="user-card" @click="handleClick">
    <div class="user-avatar">
      <el-avatar
        :alt="displayUser?.userName || '未知用户'"
        :size="avatarSize"
        :src="avatarUrl"
        @error="handleAvatarError"
      />
    </div>
    <div class="user-info">
      <div class="user-name">{{ displayUser?.userName || '未知用户' }}</div>
      <div v-if="showAccount && displayUser?.account" class="user-account">
        @{{ displayUser?.account }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import type { User } from '@/types/user';
  import { getUserInfo } from '@/api/user';

  const props = defineProps<{
    user?: User;
    userId?: string | null;
    showAccount?: boolean;
    avatarSize?: number | string;
  }>();

  const avatarSize = computed(() => {
    return props.avatarSize || 50;
  });

  const emit = defineEmits<{
    click: [user: User];
  }>();

  const router = useRouter();

  // 用户信息状态
  const fetchedUser = ref<User | null>(null);

  // 导入默认资源
  const defaultAvatar = new URL('@/assets/default-avatar.png', import.meta.url).href;

  // 显示的用户信息（优先使用传入的用户信息，其次使用获取到的用户信息）
  const displayUser = computed(() => {
    return props.user || fetchedUser.value;
  });

  // 计算头像URL
  const avatarUrl = computed(() => {
    if (!displayUser.value?.avatarUrl) {
      return defaultAvatar;
    }
    return displayUser.value.avatarUrl;
  });

  // 根据userId获取用户信息
  const fetchUserById = async (userId: string) => {
    if (!userId) return;
    try {
      const user = await getUserInfo(userId);
      fetchedUser.value = user;
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  // 监听userId变化，获取用户信息
  watch(
    [() => props.userId, () => props.user],
    ([newUserId, newUser]) => {
      // 如果传入了完整的user对象，直接使用
      if (newUser) {
        fetchedUser.value = null;
        return;
      }
      // 如果只传入了userId，获取用户信息
      if (newUserId) {
        fetchUserById(newUserId);
      }
    },
    { immediate: true }
  );

  // 处理卡片点击
  const handleClick = () => {
    const user = displayUser.value;
    if (user) {
      emit('click', user);
      // 如果有用户信息且包含ID，跳转到用户详情页
      if (user.id) {
        router.push(`/profile/${user.id}`);
      }
    }
  };

  // 处理头像加载错误
  const handleAvatarError = (e: Event) => {
    const img = e.target as HTMLImageElement;
    if (img) {
      img.src = defaultAvatar;
      // 防止无限循环错误
      img.onerror = null;
    }
  };
</script>

<style scoped>
  .user-card {
    display: flex;
    align-items: center;
    padding: 16px;
    border-radius: 8px;
    background: #fff;
    //box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #e4e7ed;
  }

  .user-card:hover {
    //transform: translateY(-2px);
    //box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    //border-color: #409eff;
  }

  .user-avatar {
    margin-right: 16px;
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-account {
    font-size: 14px;
    color: #909399;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .user-card {
      padding: 12px;
    }

    .user-avatar {
      margin-right: 12px;
    }

    .user-name {
      font-size: 15px;
    }

    .user-account {
      font-size: 13px;
    }
  }
</style>
