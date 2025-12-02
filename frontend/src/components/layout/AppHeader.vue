<template>
  <header class="app-header">
    <div class="header-content">
      <router-link to="/" class="logo">
        <img src="@/assets/logo.png" alt="Video Share Logo" />
      </router-link>

      <div class="search-bar">
        <el-input v-model="searchQuery" placeholder="搜索视频..." @keyup.enter="handleSearch">
          <template #suffix>
            <el-button link :icon="Search" aria-label="搜索" @click="handleSearch" />
          </template>
        </el-input>
      </div>

      <div class="user-actions">
        <template v-if="isLoggedIn">
          <el-button type="primary" :icon="Plus" aria-label="上传视频" @click="handleUpload">
            上传视频
          </el-button>

          <el-dropdown trigger="hover" @command="handleCommand">
            <div class="avatar-wrapper" @click="goToProfile">
              <el-avatar
                :src="userAvatar"
                :alt="username"
                class="user-avatar"
                @error="handleAvatarError"
              >
                {{ username.charAt(0).toUpperCase() }}
              </el-avatar>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile"> 个人中心 </el-dropdown-item>
                <el-dropdown-item command="logout"> 退出登录 </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <template v-else>
          <el-button link aria-label="登录" @click="$router.push('/login')"> 登录 </el-button>
          <el-button type="primary" aria-label="注册" @click="$router.push('/register')">
            注册
          </el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { Search, Plus } from '@element-plus/icons-vue';
  import { useUserStore } from '@/stores/user';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const userStore = useUserStore();
  const searchQuery = ref('');

  // 计算属性优化
  const isLoggedIn = computed(() => userStore.isLoggedIn);
  const username = computed(() => userStore.username);
  const userAvatar = computed(() => userStore.avatar);

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
      router.push('/login');
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
    height: vars.$header-height;
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
