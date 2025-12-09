<!--个人中心-->
<template>
  <div v-loading="loading" class="user-profile">
    <div v-if="userInfo" class="profile-header">
      <div class="avatar-container">
        <el-avatar :size="100" :src="avatarUrl" class="user-avatar" />
        <el-upload
          v-if="isViewingSelf"
          :before-upload="beforeAvatarUpload"
          :headers="uploadHeaders"
          :on-success="handleAvatarSuccess"
          :show-file-list="false"
          action="/api/user/uploadAvatar"
          class="avatar-uploader"
        >
          <el-button class="upload-btn" size="small" type="primary">更换头像</el-button>
        </el-upload>
      </div>
      <div class="user-info">
        <div class="username">{{ userInfo.userName || '未知用户' }}</div>
        <div class="bio-container">
          <div v-if="!isEditingBio" class="bio">
            {{ userInfo.bio || '这个人很懒，什么都没写~' }}
          </div>
          <div v-else class="bio-edit">
            <el-input
              v-model="bioText"
              :rows="3"
              maxlength="200"
              placeholder="介绍一下你自己..."
              show-word-limit
              type="textarea"
            />
            <div class="bio-actions">
              <el-button size="small" @click="cancelEditBio">取消</el-button>
              <el-button size="small" type="primary" @click="saveBio">保存</el-button>
            </div>
          </div>
          <el-button
            v-if="isViewingSelf && !isEditingBio"
            class="edit-bio-btn"
            size="small"
            type="text"
            @click="startEditBio"
          >
            编辑简介
          </el-button>
        </div>
        <div class="stats">
          <div class="stat-item">
            <span class="count">{{ userInfo.videoCount || 0 }}</span>
            <span class="label">视频</span>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-else-if="!loading" description="无法加载用户信息" />

    <div v-if="userInfo" class="profile-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="视频" name="videos">
          <video-list
            v-if="activeTab === 'videos'"
            ref="videoListRef"
            :user-id="typeof userInfo.id === 'object' ? userInfo.id?.id : userInfo.id"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue';
  import { useUserStore } from '@/stores/user';
  import { useRoute, useRouter } from 'vue-router';
  import VideoList from '@/components/video/VideoList.vue';
  import { ElMessage } from 'element-plus';
  import { getUserInfo, updateUser } from '@/api/user';

  const userStore = useUserStore();
  const route = useRoute();
  const router = useRouter();
  const userInfo = ref(null);
  const activeTab = ref('videos');
  const loading = ref(true);
  const videoListRef = ref();
  const isEditingBio = ref(false);
  const bioText = ref('');
  // 定义上传头像时的请求头
  const uploadHeaders = computed(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  });
  // 计算头像URL
  const avatarUrl = computed(() => {
    if (!userInfo.value?.avatarUrl) {
      return new URL('@/assets/default-avatar.png', import.meta.url).href;
    }
    return `/api${userInfo.value.avatarUrl}`;
  });

  // 从路由参数获取用户ID，或者使用当前登录用户的ID
  const userId = computed(() => userStore.userId);

  // 是否查看自己的个人资料
  const isViewingSelf = computed(() => !route.params.id && userStore.isLoggedIn);

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

      if (res && res.id) {
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
  watch(userInfo, () => {});

  // 处理头像上传成功
  const handleAvatarSuccess = response => {
    if (response && response.data) {
      // 更新用户信息
      userInfo.value.avatarUrl = response.data.avatarUrl;

      // 如果是查看自己的资料，同时更新store和本地存储
      if (isViewingSelf.value) {
        userStore.userInfo.avatarUrl = response.data.avatarUrl;
        localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo));
      }

      ElMessage.success('头像更新成功');
    } else {
      ElMessage.error('头像上传失败');
    }
  };

  // 上传前验证
  const beforeAvatarUpload = file => {
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isJPG) {
      ElMessage.error('上传头像图片只能是 JPG/PNG 格式!');
    }
    if (!isLt2M) {
      ElMessage.error('上传头像图片大小不能超过 2MB!');
    }

    return isJPG && isLt2M;
  };

  // 开始编辑个人介绍
  const startEditBio = () => {
    isEditingBio.value = true;
    bioText.value = userInfo.value.bio || '';
  };

  // 取消编辑个人介绍
  const cancelEditBio = () => {
    isEditingBio.value = false;
    bioText.value = '';
  };

  // 保存个人介绍
  const saveBio = async () => {
    try {
      loading.value = true;

      const userId = userInfo.value.id;
      const updatedUser = await updateUser(userId, { bio: bioText.value });

      if (updatedUser) {
        userInfo.value.bio = updatedUser.bio;

        // 如果是查看自己的资料，使用refreshUserInfo更新整个用户信息
        if (isViewingSelf.value) {
          try {
            await userStore.refreshUserInfo();
            // 更新本地userInfo引用
            userInfo.value = userStore.userInfo;
          } catch (refreshError) {
            console.error('刷新用户信息失败:', refreshError);
            // 降级处理：只更新bio字段
            userStore.userInfo.bio = updatedUser.bio;
            localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo));
          }
        }

        ElMessage.success('个人介绍更新成功');
        isEditingBio.value = false;
      }
    } catch (error) {
      console.error('更新个人介绍失败:', error);
      ElMessage.error('更新个人介绍失败');
    } finally {
      loading.value = false;
    }
  };

  // 使用立即执行的异步函数代替onMounted中的async
  const initProfile = async () => {
    loading.value = true;
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
    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    initProfile();
  });
</script>

<style lang="scss" scoped>
  .profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 0;
    gap: 1.5rem;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: flex-start;
      padding: 2rem;
    }
  }

  .avatar-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .user-avatar {
    border: 3px solid #f0f0f0;
  }

  .upload-btn {
    font-size: 0.8rem;
  }

  .user-info {
    flex: 1;
    width: 100%;

    .username {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      text-align: center;

      @media (min-width: 768px) {
        text-align: left;
      }
    }

    .bio-container {
      margin-bottom: 1rem;
      position: relative;

      .bio {
        color: #666;
        margin-bottom: 0.5rem;
        text-align: center;

        @media (min-width: 768px) {
          text-align: left;
        }
      }

      .bio-edit {
        margin-bottom: 0.5rem;

        .bio-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
      }

      .edit-bio-btn {
        font-size: 0.8rem;
        padding: 0;
        height: auto;
        color: #409eff;

        &:hover {
          color: #66b1ff;
        }
      }
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: 2rem;

      @media (min-width: 768px) {
        justify-content: flex-start;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        @media (min-width: 768px) {
          align-items: flex-start;
        }

        .count {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .label {
          color: #666;
          font-size: 0.9rem;
        }
      }
    }
  }
</style>
