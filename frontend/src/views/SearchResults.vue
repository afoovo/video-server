<template>
  <div class="search-results">
    <div class="search-header">
      <h1 class="search-title">
        搜索结果：{{ route.query.q }}
      </h1>
      <div class="search-tabs">
        <el-radio-group v-model="searchType" size="large">
          <el-radio-button label="video">视频</el-radio-button>
          <el-radio-button label="user">用户</el-radio-button>
        </el-radio-group>
      </div>
      <p class="search-stats">找到 {{ total }} 个相关{{ searchType === 'video' ? '视频' : '用户' }}</p>
    </div>

    <!-- 视频搜索结果 -->
    <div v-if="searchType === 'video'" v-loading="loading" class="video-grid">
      <div v-for="video in searchResults" :key="video.id" class="video-item">
        <video-card :video="video" @click="handleVideoClick(video)" />
      </div>
    </div>

    <!-- 用户搜索结果 -->
    <div v-if="searchType === 'user'" v-loading="loading" class="user-grid">
      <div v-for="user in userSearchResults" :key="user.id" class="user-item">
        <user-card :user="user" @click="handleUserClick(user)" />
      </div>
    </div>

    <el-empty 
      v-if="!loading && ((searchType === 'video' && searchResults.length === 0) || (searchType === 'user' && userSearchResults.length === 0))" 
      :description="emptyDescription"
    />

    <div v-if="total > 0" class="pagination">
      <el-pagination
        v-model="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import VideoCard from '@/components/video/VideoCard.vue';
import UserCard from '@/components/user/UserCard.vue';
import { useVideoStore } from '@/stores/video';
import { searchUsers } from '@/api/user';
import type { Video } from '@/types/video';
import type { User } from '@/types/user';

const route = useRoute();
const router = useRouter();
const videoStore = useVideoStore();

// 状态管理
const currentPage = ref(1);
const pageSize = ref(12);
const searchType = ref<'video' | 'user'>('video');
const userSearchResults = ref<User[]>([]);
const userLoading = ref(false);

// 计算属性
const searchKeyword = computed(() => route.query.q as string || '');
const searchResults = computed(() => videoStore.searchResults);
const loading = computed(() => searchType.value === 'video' ? videoStore.searchLoading : userLoading.value);
const total = computed(() => searchType.value === 'video' ? searchResults.value.length : userSearchResults.value.length);
const emptyDescription = computed(() => {
  const keyword = searchKeyword.value;
  return searchType.value === 'video' 
    ? `没有找到与"${keyword}"相关的视频，试试其他关键词吧`
    : `没有找到与"${keyword}"相关的用户，试试其他关键词吧`;
});

// 方法
const fetchSearchResults = async () => {
  if (!searchKeyword.value) {
    videoStore.clearSearchResults();
    userSearchResults.value = [];
    return;
  }

  try {
    if (searchType.value === 'video') {
      await videoStore.searchVideoList(searchKeyword.value);
    } else {
      // 搜索用户
      userLoading.value = true;
      const users = await searchUsers(searchKeyword.value);
      userSearchResults.value = users;
    }
  } catch (error) {
    console.error('搜索失败:', error);
    ElMessage.error('搜索失败，请稍后重试');
  } finally {
    if (searchType.value === 'user') {
      userLoading.value = false;
    }
  }
};

const handleUserClick = (user: User) => {
  router.push(`/profile/${user.id}`);
};

const handleVideoClick = (video: Video) => {
  // 清空搜索状态
  videoStore.clearSearchResults();
  router.push(`/video/${video.id}`);
};

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  // 这里可以实现分页逻辑，当前后端接口返回的是所有结果
};

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
  // 这里可以实现分页逻辑，当前后端接口返回的是所有结果
};

// 监听搜索关键词变化
watch(() => route.query.q, () => {
  currentPage.value = 1;
  fetchSearchResults();
});

// 监听搜索类型变化
watch(searchType, () => {
  currentPage.value = 1;
  fetchSearchResults();
});

// 生命周期
onMounted(() => {
  fetchSearchResults();
});
</script>

<style scoped>
.search-results {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.search-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.search-tabs {
  margin: 16px 0;
}

.search-stats {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.video-item {
  transition: transform 0.3s ease;
}

.video-item:hover {
  transform: translateY(-4px);
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.user-item {
  transition: transform 0.3s ease;
}

.user-item:hover {
  transform: translateY(-2px);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .search-results {
    padding: 16px;
  }

  .search-title {
    font-size: 20px;
  }

  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .user-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>