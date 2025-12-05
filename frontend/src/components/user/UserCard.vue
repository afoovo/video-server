<template>
  <div class="user-card" @click="handleClick">
    <div class="user-avatar">
      <el-avatar
        :size="avatarSize"
        :src="avatarUrl"
        :alt="user?.userName || '未知用户'"
        @error="handleAvatarError"
      />
    </div>
    <div class="user-info">
      <div class="user-name">{{ user?.userName || '未知用户' }}</div>
      <div v-if="showAccount" class="user-account">@{{ user?.account }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from '@/types/user';

const props = defineProps<{
  user: User;
  avatarSize?: number | 'large' | 'default' | 'small';
  showAccount?: boolean;
}>();

const emit = defineEmits<{
  click: [user: User];
}>();

const router = useRouter();

// 计算头像URL
const avatarUrl = computed(() => {
  if (!props.user?.avatarUrl) {
    return new URL('@/assets/default-avatar.png', import.meta.url).href;
  }
  // 确保头像URL通过/api代理访问
  return `/api${props.user.avatarUrl}`;
});

// 处理卡片点击
const handleClick = () => {
  emit('click', props.user);
  // 跳转到用户详情页
  router.push(`/profile/${props.user.id}`);
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
.user-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
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