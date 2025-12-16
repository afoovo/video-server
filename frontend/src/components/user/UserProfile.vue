<!--个人中心-->
<template>
  <div v-loading="loading" class="user-profile">
    <div v-if="userInfo" class="profile-header">
      <div class="avatar-container">
        <div
          class="avatar-wrapper"
          @mouseenter="showUploadHint = true"
          @mouseleave="showUploadHint = false"
        >
          <el-avatar :size="100" :src="avatarUrl" class="user-avatar" />
          <div v-if="isViewingSelf && showUploadHint" class="avatar-overlay">
            <span class="overlay-text">更换头像</span>
          </div>
        </div>
        <el-upload
          v-if="isViewingSelf"
          :before-upload="beforeAvatarUpload"
          :headers="uploadHeaders"
          :http-request="customUploadAvatar"
          :show-file-list="false"
          class="avatar-uploader"
        >
          <el-button
            class="upload-btn"
            size="small"
            style="display: none"
            type="primary"
          ></el-button>
        </el-upload>
      </div>
      <div class="user-info">
        <div class="username-container">
          <div v-if="!isEditingUsername" class="username-display">
            <div class="username">{{ userInfo.userName || '未知用户' }}</div>
            <el-button
              v-if="isViewingSelf"
              class="edit-username-btn"
              size="small"
              type="text"
              @click="startEditUsername"
            >
              编辑
            </el-button>
          </div>
          <div v-else class="username-edit">
            <el-input
              v-model="usernameText"
              maxlength="20"
              placeholder="请输入用户名"
              show-word-limit
            />
            <div class="username-actions">
              <el-button size="small" @click="cancelEditUsername">取消</el-button>
              <el-button size="small" type="primary" @click="saveUsername">保存</el-button>
            </div>
          </div>
        </div>
        <div
          class="bio-container"
          @mouseenter="isViewingSelf && (showBioEditIcon = true)"
          @mouseleave="showBioEditIcon = false"
        >
          <div v-if="!isEditingBio" class="bio" @dblclick="isViewingSelf && startEditBio()">
            {{ userInfo.bio || '这个人很懒，什么都没写~' }}
            <el-button
              v-if="showBioEditIcon && isViewingSelf"
              class="edit-bio-icon"
              link
              size="small"
              type="primary"
              @click="startEditBio"
            >
              <el-icon>
                <Edit />
              </el-icon>
            </el-button>
          </div>
          <div v-else class="bio-edit">
            <el-input
              ref="bioInputRef"
              v-model="bioText"
              :autosize="{ minRows: 1, maxRows: 1 }"
              maxlength="100"
              placeholder="介绍一下你自己..."
              type="textarea"
              @blur="saveBio"
              @keydown.enter.exact.prevent="saveBio"
            />
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
  import { Edit } from '@element-plus/icons-vue';
  import { getUserInfo, updateUser, uploadAvatar } from '@/api/user';

  const userStore = useUserStore();
  const route = useRoute();
  const router = useRouter();
  const userInfo = ref(null);
  const activeTab = ref('videos');
  const loading = ref(true);
  const videoListRef = ref();
  const isEditingBio = ref(false);
  const bioText = ref('');
  const isEditingUsername = ref(false);
  const usernameText = ref('');
  const showUploadHint = ref(false); // 控制是否显示上传提示
  const showBioEditIcon = ref(false); // 控制是否显示编辑图标
  const bioInputRef = ref(null); // 简介输入框引用

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
    return userInfo.value.avatarUrl;
  });

  // 从路由参数获取用户ID，或者使用当前登录用户的ID
  const userId = computed(() => route.params.id || userStore.userId);

  // 是否查看自己的个人资料
  const isViewingSelf = computed(
    () =>
      !route.params.id ||
      route.params.id === userStore.userId?.toString() ||
      (!route.params.id && userStore.isLoggedIn)
  );

  const loadUserInfo = async () => {
    loading.value = true; // 确保在开始时设置loading状态

    try {
      // 检查是否查看的是自己的资料
      const isSelfProfile = !route.params.id || route.params.id === userStore.userId?.toString();

      if (isSelfProfile && !route.params.id) {
        console.log('查看自己的个人资料');
        // 如果是查看自己的资料，直接从store中获取
        if (userStore.userInfo && Object.keys(userStore.userInfo).length > 0) {
          userInfo.value = userStore.userInfo;
          console.log('从userStore获取用户信息:', userInfo.value);
          loading.value = false;
          return; // 成功从store获取，直接返回
        }
        // 没有从store获取到，继续使用API获取
      }

      // 检查是否有有效的用户ID
      if (!userId.value) {
        console.error('没有可用的用户ID，检查是否已登录');
        if (!userStore.isLoggedIn) {
          ElMessage.warning('请先登录');
          await router.push('/login');
          loading.value = false;
          return;
        }
        loading.value = false;
        return; // 没有userId但已登录，可能是其他原因
      }

      console.log('加载用户ID:', userId.value);
      const res = await getUserInfo(userId.value);
      console.log('获取到用户信息:', res);

      if (res && res.id) {
        userInfo.value = res;
        // 如果是自己的资料，同时更新store
        if (isSelfProfile) {
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
    (newId, oldId) => {
      if (newId !== oldId) {
        loadUserInfo();
      }
    }
  );

  // 当userInfo变化时，刷新视频列表
  watch(userInfo, () => {});

  // 处理头像上传成功
  const customUploadAvatar = async options => {
    const { file, onSuccess, onError } = options;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadAvatar(formData);

      // 更新用户信息
      userInfo.value.avatarUrl = response.avatarUrl;

      // 如果是查看自己的资料，同时更新store和本地存储
      if (isViewingSelf.value) {
        userStore.userInfo.avatarUrl = response.avatarUrl;
        localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo));
      }

      ElMessage.success('头像更新成功');
      onSuccess(response);
    } catch (error) {
      ElMessage.error('头像上传失败');
      onError(error);
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

  // 开始编辑用户名
  const startEditUsername = () => {
    isEditingUsername.value = true;
    usernameText.value = userInfo.value.userName || '';
  };

  // 取消编辑用户名
  const cancelEditUsername = () => {
    isEditingUsername.value = false;
    usernameText.value = '';
  };

  // 保存用户名
  const saveUsername = async () => {
    if (!usernameText.value.trim()) {
      ElMessage.error('用户名不能为空');
      return;
    }

    try {
      loading.value = true;

      const userId = userInfo.value.id;
      const updatedUser = await updateUser(userId, { userName: usernameText.value });

      if (updatedUser) {
        userInfo.value.userName = updatedUser.userName;

        // 如果是查看自己的资料，使用refreshUserInfo更新整个用户信息
        if (isViewingSelf.value) {
          try {
            await userStore.refreshUserInfo();
            // 更新本地userInfo引用
            userInfo.value = userStore.userInfo;
          } catch (refreshError) {
            console.error('刷新用户信息失败:', refreshError);
            // 降级处理：只更新userName字段
            userStore.userInfo.userName = updatedUser.userName;
            localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo));
          }
        }

        ElMessage.success('用户名更新成功');
        isEditingUsername.value = false;
      }
    } catch (error) {
      console.error('更新用户名失败:', error);
      ElMessage.error('更新用户名失败');
    } finally {
      loading.value = false;
    }
  };

  // 开始编辑个人介绍
  const startEditBio = () => {
    isEditingBio.value = true;
    bioText.value = userInfo.value.bio || '';

    // 在下一帧聚焦到输入框
    setTimeout(() => {
      bioInputRef.value?.focus();
    }, 0);
  };

  // 保存个人介绍
  const saveBio = async () => {
    try {
      // 如果内容没有改变，则直接退出编辑模式
      if (bioText.value === (userInfo.value.bio || '')) {
        isEditingBio.value = false;
        return;
      }

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
  @use '@/styles/variables' as *;
  @use '@/styles/mixins' as *;

  .user-profile {
    max-width: 1200px;
    margin: 0 auto;
    padding: $spacing-lg;
  }

  .profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-lg;
    gap: $spacing-lg;
    margin-bottom: $spacing-lg;

    @media (min-width: $breakpoint-md) {
      flex-direction: row;
      align-items: flex-start;
    }

    @media (max-width: $breakpoint-md) {
      padding: $spacing-md;
    }
  }

  .avatar-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;
  }

  .avatar-wrapper {
    position: relative;
    cursor: pointer;
  }

  .user-avatar {
    border: 3px solid $border-color;
    box-shadow: $box-shadow-sm;
  }

  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%; /* 保持圆形 */
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: $font-size-sm;
    transition: opacity 0.3s ease;
  }

  .overlay-text {
    text-align: center;
  }

  .upload-btn {
    font-size: $font-size-sm;
  }

  .user-info {
    flex: 1;
    width: 100%;

    .username-container {
      margin-bottom: $spacing-sm;

      .username-display {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        justify-content: center;

        @media (min-width: $breakpoint-md) {
          justify-content: flex-start;
        }
      }

      .username-edit {
        .username-actions {
          display: flex;
          justify-content: flex-end;
          gap: $spacing-sm;
          margin-top: $spacing-sm;
        }
      }
    }

    .username {
      font-size: $font-size-xl;
      font-weight: 500;
      margin-bottom: $spacing-sm;
      color: $text-color;
    }

    .bio-container {
      margin-bottom: $spacing-md;
      position: relative;

      &:hover {
        .edit-bio-icon {
          opacity: 1;
        }
      }

      .bio {
        color: $text-color-secondary;
        margin-bottom: $spacing-sm;
        text-align: center;
        line-height: $line-height-base;
        position: relative;
        padding-right: 30px;
        cursor: pointer;

        @media (min-width: $breakpoint-md) {
          text-align: left;
        }

        .edit-bio-icon {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0;
          transition: opacity 0.3s;
        }
      }

      .bio-edit {
        margin-bottom: $spacing-sm;
      }
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: $spacing-xl;

      @media (min-width: $breakpoint-md) {
        justify-content: flex-start;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        @media (min-width: $breakpoint-md) {
          align-items: flex-start;
        }

        .count {
          font-size: $font-size-lg;
          font-weight: 500;
          color: $text-color;
        }

        .label {
          color: $text-color-secondary;
          font-size: $font-size-sm;
        }
      }
    }
  }

  .edit-username-btn {
    font-size: $font-size-sm;
    padding: 0;
    height: auto;
    color: $primary-color;
  }

  .profile-content {
    padding: $spacing-lg;
  }
</style>
