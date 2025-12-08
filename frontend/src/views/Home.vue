<template>
  <div class="home-page">
    <div class="page-container">
      <!-- 分类导航 -->
      <div class="category-nav">
        <div class="nav-list">
          <div
            v-for="category in categories"
            :key="category.id"
            class="nav-item"
            :class="{ active: activeCategory === category.id }"
            @click="handleCategoryChange(category.id)"
          >
            <el-icon>
              <component :is="category.icon" />
            </el-icon>
            <span>{{ category.name }}</span>
          </div>
        </div>
      </div>

      <!-- 视频列表 -->
      <div v-loading="loading" class="video-list">
        <div class="list-header">
          <div class="left">
            <h3>{{ activeCategory === 'all' ? '视频列表' : getCategoryName(activeCategory) }}</h3>
          </div>
          <div class="right">
            <el-radio-group v-model="sortBy" size="small" @change="handleSortChange">
              <el-radio-button value="latest"> 最新发布</el-radio-button>
              <el-radio-button value="popular"> 最多播放</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="video-grid">
          <video-card
            v-for="video in videos"
            :key="video.id"
            :video="video"
            @click="goToVideo(video.id)"
          />
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="PAGE_SIZES"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { getVideos } from '@/api/video';
  import VideoCard from '@/components/video/VideoCard.vue';

  // 常量定义
  const PAGE_SIZES = [24, 36, 48, 60];
  const DEFAULT_PAGE_SIZE = 20;
  const DEFAULT_SORT = 'latest';

  // 分类数据
  const categories = [
    { id: 'all', name: '全部', icon: 'VideoPlay' },
    { id: 'gaming', name: '游戏', icon: 'GameController' },
    { id: 'music', name: '音乐', icon: 'Headset' },
    { id: 'movie', name: '电影', icon: 'Film' },
    { id: 'anime', name: '动漫', icon: 'Monitor' },
    { id: 'tech', name: '科技', icon: 'CPU' },
    { id: 'sports', name: '体育', icon: 'Basketball' },
    { id: 'food', name: '美食', icon: 'Food' },
  ];

  const router = useRouter();
  const loading = ref(false);
  const videos = ref([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(DEFAULT_PAGE_SIZE);
  const activeCategory = ref('all');
  const sortBy = ref(DEFAULT_SORT);

  const getCategoryName = id => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : '未知分类';
  };

  const loadVideos = async () => {
    // 防止重复请求
    if (loading.value) return;

    loading.value = true;
    try {
      const params = {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
      };

      // 根据排序选项设置type
      if (sortBy.value === 'popular') {
        params.type = 'hot';
      } else if (sortBy.value === 'latest') {
        // 最新发布 - 默认排序，不需要设置type
      }

      // 分类筛选可以作为关键词搜索
      if (activeCategory.value !== 'all') {
        params.keyword = getCategoryName(activeCategory.value);
      }

      console.log('加载视频列表，参数:', params);

      // 使用API函数代替直接request调用
      const res = await getVideos(params);
      console.log('获取到视频数据:', res);

      if (res && typeof res === 'object' && Array.isArray(res.records)) {
        // 处理分页响应格式
        videos.value = res.records;
        total.value = res.total || 0;
      } else if (Array.isArray(res)) {
        // 处理数组响应格式
        videos.value = res;
        total.value = res.length || 0;
      } else {
        console.error('获取到的视频数据格式不正确:', res);
        videos.value = [];
        total.value = 0;
      }
    } catch (error) {
      console.error('加载视频列表失败:', error);
      const errorMsg = error.response?.data?.message || '获取视频列表失败';
      ElMessage.error(errorMsg);
      videos.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const handleCategoryChange = categoryId => {
    activeCategory.value = categoryId;
    currentPage.value = 1;
    loadVideos();
  };

  const handleSortChange = () => {
    currentPage.value = 1;
    loadVideos();
  };

  const handleSizeChange = val => {
    pageSize.value = val;
    currentPage.value = 1; // 重置到第一页
    loadVideos();
  };

  const handleCurrentChange = val => {
    currentPage.value = val;
    loadVideos();
  };

  const goToVideo = id => {
    router.push(`/video/${id}`);
  };

  onMounted(() => {
    loadVideos();
  });
</script>
<style lang="scss" scoped></style>
