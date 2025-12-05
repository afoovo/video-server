<!--个人中心-->
<template>
  <div v-loading="loading" class="user-profile">
    <div v-if="userInfo" class="profile-header">
      <user-info-display :user="userInfo" :detailed="true" :size="100" />
    </div>

    <el-empty v-else-if="!loading" description="无法加载用户信息" />

    <div v-if="userInfo" class="profile-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="视频" name="videos">
          <video-list v-if="activeTab === 'videos'" ref="videoListRef" :user-id="userInfo.id" />
        </el-tab-pane>
        <el-tab-pane label="喜欢" name="likes">
          <video-list v-if="activeTab === 'likes'" url="/likes/user/videos" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import { useUserStore } from '@/stores/user';
  import { useRoute, useRouter } from 'vue-router';
  import VideoList from '@/components/video/VideoList.vue';
  import UserInfoDisplay from '@/components/common/UserInfoDisplay.vue';
  import { ElMessage } from 'element-plus';
  import { getUserInfo } from '@/api/user';

  const userStore = useUserStore();
  const route = useRoute();
  const router = useRouter();
  const userInfo = ref(null);
  const activeTab = ref('videos');
  const loading = ref(true);
  const videoListRef = ref();

  // 从路由参数获取用户ID，或者使用当前登录用户的ID
  const userId = computed(() => route.params.id || userStore.userId);

  // 是否查看自己的个人资料
  const isViewingSelf = computed(() => !route.params.id && userStore.isLoggedIn);

  const refreshVideoList = () => {
    console.log('尝试刷新视频列表');
    if (videoListRef.value) {
      console.log('刷新视频列表');
      videoListRef.value.loadVideos();
    }
  };

  const loadUserInfo = async () => {
    loading.value = true; // 确保在开始时设置loading状态

    try {
      if (isViewingSelf.value) {
        console.log('查看自己的个人资料');
        // 如果是查看自己的资料，直接从store中获取
        if (userStore.userInfo && Object.keys(userStore.userInfo).length > 0) {
          userInfo.value = userStore.userInfo;
          console.log('从userStore获取用户信息:', userInfo.value);
          return; // 成功从store获取，直接返回
        }
        // 没有从store获取到，继续使用API获取
      }

      if (!userId.value) {
        console.error('没有可用的用户ID，检查是否已登录');
        if (!userStore.isLoggedIn) {
          ElMessage.warning('请先登录');
          await router.push('/login');
          return;
        }
        return; // 没有userId但已登录，可能是其他原因
      }

      console.log('加载用户ID:', userId.value);
      const res = await getUserInfo(userId.value);
      console.log('获取到用户信息:', res);

      if (res && (res.id || res.userId)) {
        userInfo.value = res;
        // 如果是自己的资料，同时更新store
        if (isViewingSelf.value) {
          userStore.userInfo = res;
          localStorage.setItem('userInfo', JSON.stringify(res));
        }
      } else {
        ElMessage.error('获取到的用户信息无效');
        console.error('无效的用户信息响应:', res);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      ElMessage.error('获取用户信息失败');
    } finally {
      loading.value = false; // 确保在所有情况下都结束loading状态
    }
  };

  // 当路由参数变化时，重新加载用户信息
  watch(
    () => route.params.id,
    () => {
      loadUserInfo();
    }
  );

  // 当userInfo变化时，刷新视频列表
  watch(userInfo, newValue => {
    if (newValue) {
      console.log('用户信息已加载，刷新视频列表');
      setTimeout(() => {
        refreshVideoList();
      }, 100);
    }
  });

  onMounted(async () => {
    loading.value = true; // 确保在挂载时设置loading状态

    try {
      // 确保userStore已初始化
      if (!userStore.isLoggedIn) {
        try {
          await userStore.initialize();
        } catch (error) {
          console.error('初始化用户状态失败:', error);
        }
      }

      await loadUserInfo();

      // 加载完用户信息后刷新视频列表
      setTimeout(() => {
        refreshVideoList();
      }, 100);
    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      loading.value = false; // 确保在所有情况下都结束loading状态
    }
  });
</script>

<style lang="scss" scoped>
  // 移除所有样式，因为已经移到全局样式中
</style>
