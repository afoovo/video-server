<template>
  <header class="app-header">
    <div class="header-content">
      <router-link class="logo" to="/">
        <img alt="Video Share Logo" src="@/assets/logo.png" />
      </router-link>

      <div class="search-bar">
        <el-input v-model="searchQuery" placeholder="搜索视频..." @keyup.enter="handleSearch">
          <template #suffix>
            <el-button :icon="Search" aria-label="搜索" link @click="handleSearch" />
          </template>
        </el-input>
      </div>

      <div class="user-actions">
        <template v-if="isLoggedIn">
          <el-button :icon="Plus" aria-label="上传视频" type="primary" @click="handleUpload">
            上传视频
          </el-button>

          <el-dropdown trigger="hover" @command="handleCommand">
            <div class="avatar-wrapper" @click="goToProfile">
              <el-avatar
                :alt="username"
                :src="userAvatar"
                class="user-avatar"
                @error="handleAvatarError"
              />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile"> 个人中心</el-dropdown-item>
                <el-dropdown-item command="logout"> 退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <template v-else>
          <el-button aria-label="登录" link @click="router.push('/login')"> 登录</el-button>
          <el-button aria-label="注册" type="primary" @click="router.push('/register')">
            注册
          </el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Plus, Search } from '@element-plus/icons-vue';
  import { useUserStore } from '@/stores/user';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  const searchQuery = ref('');

  // 计算属性优化
  const isLoggedIn = computed(() => userStore.isLoggedIn);
  const username = computed(() => userStore.username);
  // 计算用户头像
  const userAvatar = computed(() => {
    if (!userStore.avatar) {
      return new URL('@/assets/default-avatar.png', import.meta.url).href;
    }
    // 直接使用store中的头像路径
    return userStore.avatar;
  });

  // 监听路由变化，当离开搜索页面时清空搜索框
  watch(
    () => route.path,
    (newPath, oldPath) => {
      if (oldPath === '/search' && newPath !== '/search') {
        searchQuery.value = '';
      }
    }
  );

  const handleSearch = () => {
    if (searchQuery.value.trim()) {
      router.push({
        path: '/search',
        query: { q: searchQuery.value },
      });
    }
  };

  const handleUpload = () => {
    router.push('/upload');
  };

  const goToProfile = () => {
    router.push('/profile');
  };

  const handleCommand = command => {
    switch (command) {
      case 'profile':
        goToProfile();
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await userStore.logout();
      await router.push('/');
    } catch (error) {
      console.error('退出失败:', error);
      ElMessage.error('退出失败，请重试');
    }
  };

  const handleAvatarError = e => {
    // 头像加载失败时使用默认头像
    const img = e.target;
    if (img) {
      // 使用assets目录下的默认头像文件
      img.src = new URL('@/assets/default-avatar.png', import.meta.url).href;
      // 防止无限循环错误
      img.onerror = null;
    }
  };
</script>

<style lang="scss" scoped>
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;
  @use 'sass:color';

  .app-header {
    //height: vars.$header-height;
    background-color: $white;
    border-bottom: 1px solid $border-color;
    position: sticky;
    top: 0;
    z-index: $zindex-fixed;

    .header-content {
      max-width: 1200px;
      height: 100%;
      margin: 0 auto;
      padding: 0 $spacing-lg;
      @include flex-between;

      .logo {
        @include flex-center;
        gap: $spacing-sm;
        text-decoration: none;

        img {
          height: 32px;
          width: auto;
        }

        span {
          font-size: $font-size-lg;
          font-weight: bold;
          color: $text-color;
        }
      }

      .search-bar {
        flex: 1;
        padding: 0 $spacing-lg;
      }

      .user-actions {
        @include flex-center;
        gap: $spacing-lg;

        .avatar-wrapper {
          @include flex-center;
          cursor: pointer;
          @include hover-transition;

          &:hover {
            transform: scale(1.2);
          }

          .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: $border-radius-circle;
          }
        }
      }
    }
  }

  // 响应式布局
  @media (max-width: $breakpoint-md) {
    .app-header {
      .header-content {
        padding: 0 $spacing-md;

        .search-bar {
          padding: 0 $spacing-sm;
        }

        .user-actions {
          gap: $spacing-md;
        }
      }
    }
  }
</style>
