<template>
  <div class="comment-list">
    <!-- 评论输入框 -->
    <div v-if="isLoggedIn" class="comment-input">
      <el-avatar :size="40" :src="currentUser?.avatarUrl" />
      <el-input
        v-model="commentText"
        :maxlength="500"
        :rows="2"
        placeholder="发表评论..."
        show-word-limit
        type="textarea"
        @keyup.enter.ctrl="handleSubmit"
      />
      <el-button
        :disabled="!commentText.trim()"
        :loading="submitting"
        type="primary"
        @click="handleSubmit"
      >
        发表评论
      </el-button>
    </div>
    <div v-else class="login-tip">
      <el-link type="primary" @click="router.push('/login')">登录后发表评论</el-link>
    </div>

    <!-- 评论列表 -->
    <div v-loading="loading" class="comments">
      <div class="comment-header">
        <span class="total">{{ comments.length }} 条评论</span>
      </div>

      <!-- 评论项 -->
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <UserCard :avatar-size="40" :show-account="false" :userId="comment.userId" />
        <div class="comment-content">
          <div class="comment-header">
            <span class="time">{{ formatTime(comment.createTime) }}</span>
          </div>
          <div class="comment-text">
            {{ comment.content }}
          </div>
          <div class="comment-actions">
            <el-button v-if="canDelete(comment)" link type="danger" @click="handleDelete(comment)">
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { formatTime } from '@/utils/format';
  import { createComment, deleteComment, getVideoComments } from '@/api/comment';
  import UserCard from '@/components/user/UserCard.vue';

  const props = defineProps({
    videoId: {
      type: Number,
      required: true,
    },
  });

  // 状态管理
  const userStore = useUserStore();
  const router = useRouter();

  const isLoggedIn = computed(() => userStore.isLoggedIn);
  const currentUser = computed(() => userStore.user);

  // 评论列表状态
  const comments = ref([]);
  const loading = ref(false);
  const submitting = ref(false);

  // 评论输入状态
  const commentText = ref('');

  // 加载评论列表
  const loadComments = async () => {
    loading.value = true;
    try {
      if (!props.videoId) {
        console.error('视频ID为空，无法加载评论');
        return;
      }

      const res = await getVideoComments(props.videoId);
      processComments(res);
    } catch (error) {
      console.error('加载评论出错:', error);
      ElMessage.error('加载评论失败，请稍后重试');
      comments.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 处理评论数据
  const processComments = commentData => {
    if (!Array.isArray(commentData)) {
      console.error('评论数据不是数组:', commentData);
      comments.value = [];
      return;
    }

    // 清理并处理评论数据
    comments.value = commentData.map(comment => {
      // 确保必要字段存在
      return {
        id: comment.id,
        content: comment.content || '(无内容)',
        videoId: comment.videoId,
        userId: comment.userId,
        user: comment.user || {
          id: comment.userId,
          userName: '未知用户',
          avatarUrl: '/static/default/avatars/default.jpg',
        },
        createTime: comment.createTime || new Date().toISOString(),
      };
    });
  };

  // 发表评论
  const handleSubmit = async () => {
    if (!isLoggedIn.value) {
      router.push('/login');
      return;
    }

    if (!commentText.value.trim()) return;

    submitting.value = true;
    try {
      const data = {
        videoId: props.videoId,
        content: commentText.value.trim(),
        userId: currentUser.value?.id,
      };
      await createComment(data);
      ElMessage.success('评论发表成功');
      commentText.value = '';
      // 重新加载评论列表
      await loadComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
      if (error.response && error.response.status === 403) {
        ElMessage.error('权限不足，请联系管理员');
      } else {
        ElMessage.error('评论发表失败');
      }
    } finally {
      submitting.value = false;
    }
  };

  // 删除评论
  const handleDelete = async comment => {
    try {
      ElMessageBox.confirm('确定要删除这条评论吗？');
      await deleteComment(comment.id);
      ElMessage.success('删除成功');
      await loadComments();
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to delete comment:', error);
        ElMessage.error('删除失败');
      }
    }
  };

  // 判断是否可以删除评论
  const canDelete = comment =>
    isLoggedIn.value &&
    (comment.userId === currentUser.value?.id || currentUser.value?.role === 'ADMIN');

  // 监听视频ID变化
  watch(
    () => props.videoId,
    (newId, oldId) => {
      console.log(`视频ID变化: ${oldId} => ${newId}`);
      if (newId) {
        loadComments();
      }
    },
    { immediate: true }
  );

  // 初始化
  onMounted(() => {
    console.log('评论组件加载，视频ID:', props.videoId);
    if (props.videoId) {
      loadComments();
    }
  });

  // 暴露方法给父组件调用
  defineExpose({
    loadComments,
    refreshComments: loadComments,
  });
</script>

<style lang="scss" scoped>
  // 移除所有样式，因为已经移到全局样式中
</style>